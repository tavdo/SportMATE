import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import type { Player, SessionFeed, SessionMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 500;

async function isGoingParticipant(
  sessionId: string,
  uid: string
): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db
    .collection("sessions")
    .doc(sessionId)
    .collection("participants")
    .doc(uid)
    .get();
  return snap.exists && snap.data()?.status === "going";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const sessionId = params.id;
    const session = docData<SessionFeed>(
      await getAdminDb().collection("sessions").doc(sessionId).get()
    );

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!(await isGoingParticipant(sessionId, auth.uid))) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const snap = await getAdminDb()
      .collection("sessions")
      .doc(sessionId)
      .collection("messages")
      .orderBy("created_at", "asc")
      .limit(200)
      .get();

    const messages = snap.docs.map((d) => docData<SessionMessage>(d)!);
    return NextResponse.json(messages, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const sessionId = params.id;
    const db = getAdminDb();
    const session = docData<SessionFeed>(
      await db.collection("sessions").doc(sessionId).get()
    );

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "cancelled") {
      return NextResponse.json({ error: "Session cancelled" }, { status: 400 });
    }

    if (!(await isGoingParticipant(sessionId, auth.uid))) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const player = docData<Player>(
      await db.collection("players").doc(auth.uid).get()
    );

    if (!player || player.is_banned) {
      return NextResponse.json({ error: "Player not found" }, { status: 403 });
    }

    const ref = db
      .collection("sessions")
      .doc(sessionId)
      .collection("messages")
      .doc();

    const message: SessionMessage = {
      id: ref.id,
      session_id: sessionId,
      player_id: auth.uid,
      nickname: player.nickname,
      avatar_color: player.avatar_color,
      avatar_url: player.avatar_url ?? null,
      text,
      created_at: new Date().toISOString(),
    };

    await ref.set(message);
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
