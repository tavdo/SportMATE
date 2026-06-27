import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { ka } from "@/lib/i18n/ka";
import { SEED_VENUES } from "@/lib/seed-venues";

export async function POST() {
  try {
    const db = getAdminDb();
    const batch = db.batch();

    for (const venue of SEED_VENUES) {
      const { id, ...data } = venue;
      batch.set(db.collection("venues").doc(id), {
        ...data,
        photo_url: null,
      });
    }

    await batch.commit();
    return NextResponse.json({ success: true, count: SEED_VENUES.length });
  } catch (err) {
    if (err instanceof Error && err.message === "FIREBASE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: ka.common.firebaseNotConfigured },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
