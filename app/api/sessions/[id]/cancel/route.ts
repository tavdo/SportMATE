import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import type { SessionFeed } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = req.headers.get("x-device-id");
    if (!deviceId) {
      return NextResponse.json({ error: "device_id required" }, { status: 401 });
    }

    const db = getAdminDb();
    const sessionRef = db.collection("sessions").doc(params.id);
    const session = docData<SessionFeed>(await sessionRef.get());

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== deviceId) {
      return NextResponse.json({ error: "Only host can cancel" }, { status: 403 });
    }

    await sessionRef.update({ status: "cancelled" });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
