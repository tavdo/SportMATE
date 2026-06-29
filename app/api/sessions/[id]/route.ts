import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { effectiveSessionStatus } from "@/lib/types";
import type { ParticipantWithPlayer, SessionFeed, Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const sessionSnap = await db.collection("sessions").doc(params.id).get();
    const session = docData<SessionFeed>(sessionSnap);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const venueSnap = await db.collection("venues").doc(session.venue_id).get();
    const venue = docData<Venue>(venueSnap);

    const participantsSnap = await db
      .collection("sessions")
      .doc(params.id)
      .collection("participants")
      .where("status", "==", "going")
      .get();

    const participants = participantsSnap.docs.map(
      (d) => docData<ParticipantWithPlayer>(d)!
    );

    return NextResponse.json({
      ...session,
      effective_status: effectiveSessionStatus(session),
      venue,
      participants,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
