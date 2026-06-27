import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { tFromRequest } from "@/lib/i18n/server";
import { SEED_VENUES } from "@/lib/seed-venues";

export async function POST(req: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET;
  if (setupSecret) {
    const auth = req.headers.get("x-setup-secret");
    if (auth !== setupSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { error: "Set SETUP_SECRET env var to run seed on Vercel" },
      { status: 403 }
    );
  }

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
        { error: tFromRequest(req).common.firebaseNotConfigured },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
