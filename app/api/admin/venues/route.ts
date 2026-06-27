import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import type { SportType, Venue } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const snap = await getAdminDb().collection("venues").orderBy("name").get();
    const venues = snap.docs.map((d) => docData<Venue>(d)!);
    return NextResponse.json(venues);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await req.json();
    const { name, lat, lng, sports, district, surface, is_indoor, is_free, note } = body;

    if (!name || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(sports) || sports.length === 0) {
      return NextResponse.json({ error: "Select at least one sport" }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection("venues").doc();
    const venue: Venue = {
      id: ref.id,
      name: String(name).trim(),
      lat,
      lng,
      sports: sports as SportType[],
      district: district ?? null,
      surface: surface ?? null,
      is_indoor: Boolean(is_indoor),
      is_free: is_free !== false,
      photo_url: null,
      note: note ?? null,
    };

    await ref.set(venue);
    return NextResponse.json(venue, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
