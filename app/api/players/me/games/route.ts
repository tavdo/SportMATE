import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { effectiveSessionStatus } from "@/lib/types";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import type { Player, SessionFeed } from "@/lib/types";

async function getPlayerGames(uid: string) {
  const db = getAdminDb();
  const playerSnap = await db.collection("players").doc(uid).get();
  const player = docData<Player>(playerSnap);

  if (!player) {
    return null;
  }

  const sessionsSnap = await db.collection("sessions").get();
  const allSessions = sessionsSnap.docs.map((d) => docData<SessionFeed>(d)!);

  const hosted = allSessions.filter((s) => s.host_id === uid);

  const joinedSessionIds = new Set<string>();
  for (const session of allSessions) {
    const pt = await db
      .collection("sessions")
      .doc(session.id)
      .collection("participants")
      .doc(uid)
      .get();
    if (pt.exists && pt.data()?.status === "going") {
      joinedSessionIds.add(session.id);
    }
  }

  const joined = allSessions.filter(
    (s) => joinedSessionIds.has(s.id) && !hosted.some((h) => h.id === s.id)
  );

  const all = [...hosted, ...joined].map((s) => ({
    ...s,
    effective_status: effectiveSessionStatus(s),
    is_host: s.host_id === uid,
  }));

  const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
  const now = new Date();

  const upcoming = unique.filter(
    (s) =>
      s.effective_status !== "cancelled" &&
      s.effective_status !== "done" &&
      new Date(s.starts_at) >= now
  );
  const past = unique.filter(
    (s) =>
      s.effective_status === "done" ||
      s.effective_status === "cancelled" ||
      new Date(s.starts_at) < now
  );

  return { player, upcoming, past };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const result = await getPlayerGames(auth.uid);
    if (!result) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const body = await req.json();
    const { session_id, player_ids } = body;

    if (!session_id || !Array.isArray(player_ids) || player_ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(session_id);
    const session = docData<SessionFeed>(await sessionRef.get());

    if (!session || session.host_id !== auth.uid) {
      return NextResponse.json({ error: "Only host can mark no-shows" }, { status: 403 });
    }

    if (new Date(session.starts_at) >= new Date()) {
      return NextResponse.json({ error: "Session not finished yet" }, { status: 400 });
    }

    if (session.status === "done") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    for (const playerId of player_ids) {
      if (playerId === auth.uid) continue;
      const pRef = db.collection("players").doc(playerId);
      const pSnap = await pRef.get();
      if (pSnap.exists) {
        const p = docData<Player>(pSnap)!;
        await pRef.update({ no_shows: p.no_shows + 1 });
      }
    }

    const goingSnap = await sessionRef
      .collection("participants")
      .where("status", "==", "going")
      .get();

    for (const pt of goingSnap.docs) {
      const playerId = pt.data().player_id as string;
      const pRef = db.collection("players").doc(playerId);
      const pSnap = await pRef.get();
      if (pSnap.exists) {
        const p = docData<Player>(pSnap)!;
        await pRef.update({ games_played: p.games_played + 1 });
      }
    }

    await sessionRef.update({ status: "done" });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
