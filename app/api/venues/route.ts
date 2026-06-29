import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import type { Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb().collection("venues").orderBy("name").get();
    const venues = snap.docs.map((d) => docData<Venue>(d)!);
    return NextResponse.json(venues, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
