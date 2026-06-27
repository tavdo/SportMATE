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
    const session = docData<SessionFeed>(await sessionRef.get());

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== auth.uid) {
      return NextResponse.json({ error: "Only host can cancel" }, { status: 403 });
    }

    await sessionRef.update({ status: "cancelled" });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
