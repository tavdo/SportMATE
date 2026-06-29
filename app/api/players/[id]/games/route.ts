import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { effectiveSessionStatus } from "@/lib/types";
import { finalizeSessionStats } from "@/lib/game-stats";
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    if (auth.uid !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    if (auth.uid !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { session_id, player_ids } = body;

    if (!session_id || !Array.isArray(player_ids)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await finalizeSessionStats(
      getAdminDb(),
      session_id,
      auth.uid,
      player_ids
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
