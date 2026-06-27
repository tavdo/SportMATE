import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import type { SessionFeed } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(params.id);
    const participantRef = sessionRef.collection("participants").doc(auth.uid);
    const participantSnap = await participantRef.get();

    if (!participantSnap.exists || participantSnap.data()?.status !== "going") {
      return NextResponse.json({ error: "Not joined" }, { status: 400 });
    }

    const session = docData<SessionFeed>(await sessionRef.get());
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await participantRef.update({ status: "cancelled" });

    const goingSnap = await sessionRef
      .collection("participants")
      .where("status", "==", "going")
      .get();
    const newCount = goingSnap.size;

    const updates: Partial<SessionFeed> = { current_players: newCount };
    if (session.status === "full") {
      updates.status = "open";
    }
    await sessionRef.update(updates);

    return NextResponse.json({ success: true, current_players: newCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
