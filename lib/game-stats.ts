import type { Firestore } from "firebase-admin/firestore";
import type { Player } from "@/lib/types";

export async function finalizeSessionStats(
  db: Firestore,
  sessionId: string,
  hostId: string,
  noShowPlayerIds: string[]
): Promise<{ error: string; status: number } | { success: true }> {
  const sessionRef = db.collection("sessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  const session = sessionSnap.data();

  if (!session || session.host_id !== hostId) {
    return { error: "Only host can finish the game", status: 403 };
  }

  if (new Date(session.starts_at as string) >= new Date()) {
    return { error: "Session not finished yet", status: 400 };
  }

  if (session.status === "done") {
    return { error: "Already processed", status: 400 };
  }

  const noShowSet = new Set(
    noShowPlayerIds.filter((id) => id && id !== hostId)
  );

  for (const playerId of Array.from(noShowSet)) {
    const pRef = db.collection("players").doc(playerId);
    const pSnap = await pRef.get();
    if (pSnap.exists) {
      const p = pSnap.data() as Player;
      await pRef.update({ no_shows: (p.no_shows ?? 0) + 1 });
    }
  }

  const goingSnap = await sessionRef
    .collection("participants")
    .where("status", "==", "going")
    .get();

  for (const pt of goingSnap.docs) {
    const playerId = pt.data().player_id as string;
    if (noShowSet.has(playerId)) continue;

    const pRef = db.collection("players").doc(playerId);
    const pSnap = await pRef.get();
    if (pSnap.exists) {
      const p = pSnap.data() as Player;
      const gamesPlayed = (p.games_played ?? 0) + 1;
      await pRef.update({ games_played: gamesPlayed });

      const embedded = pt.data().player;
      if (embedded && typeof embedded === "object") {
        await pt.ref.update({
          player: { ...embedded, games_played: gamesPlayed },
        });
      }
    }
  }

  await sessionRef.update({ status: "done" });
  return { success: true };
}
