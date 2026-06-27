import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import type { SessionFeed } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await req.json();
    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(params.id);
    const session = docData<SessionFeed>(await sessionRef.get());

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updates: Partial<SessionFeed> = {};
    if (body.status === "cancelled" || body.status === "open" || body.status === "done") {
      updates.status = body.status;
    }
    if (typeof body.note === "string" || body.note === null) {
      updates.note = body.note;
    }
    if (typeof body.max_players === "number") {
      updates.max_players = body.max_players;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    await sessionRef.update(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(params.id);
    const session = docData<SessionFeed>(await sessionRef.get());

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const participants = await sessionRef.collection("participants").get();
    const batch = db.batch();
    participants.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(sessionRef);
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
