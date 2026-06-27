import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import type { Player, SessionFeed } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(params.id);
    const sessionSnap = await sessionRef.get();
    const session = docData<SessionFeed>(sessionSnap);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "cancelled" || session.status === "done") {
      return NextResponse.json({ error: "Session not joinable" }, { status: 400 });
    }

    if (new Date(session.starts_at) < new Date()) {
      return NextResponse.json({ error: "Session has started" }, { status: 400 });
    }

    const playerSnap = await db.collection("players").doc(auth.uid).get();
    if (!playerSnap.exists) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    const player = docData<Player>(playerSnap)!;

    if (player.is_banned) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const participantRef = sessionRef.collection("participants").doc(auth.uid);
    const existingSnap = await participantRef.get();

    if (existingSnap.exists && existingSnap.data()?.status === "going") {
      return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    const goingSnap = await sessionRef
      .collection("participants")
      .where("status", "==", "going")
      .get();
    const currentCount = goingSnap.size;

    if (currentCount >= session.max_players) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    const now = new Date().toISOString();
    await participantRef.set({
      session_id: params.id,
      player_id: auth.uid,
      status: "going",
      joined_at: now,
      player: {
        id: player.id,
        nickname: player.nickname,
        avatar_color: player.avatar_color,
        games_played: player.games_played,
        no_shows: player.no_shows,
        is_verified: player.is_verified,
      },
    });

    const newCount = currentCount + 1;
    const updates: Partial<SessionFeed> = { current_players: newCount };
    if (newCount >= session.max_players) {
      updates.status = "full";
    }
    await sessionRef.update(updates);

    return NextResponse.json({ success: true, current_players: newCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
