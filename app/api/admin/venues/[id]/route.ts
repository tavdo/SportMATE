import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import type { SportType, Venue } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await req.json();
    const db = getAdminDb();
    const ref = db.collection("venues").doc(params.id);
    const venue = docData<Venue>(await ref.get());

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const updates: Partial<Venue> = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.lat === "number") updates.lat = body.lat;
    if (typeof body.lng === "number") updates.lng = body.lng;
    if (Array.isArray(body.sports) && body.sports.length > 0) {
      updates.sports = body.sports as SportType[];
    }
    if (body.district !== undefined) updates.district = body.district;
    if (body.surface !== undefined) updates.surface = body.surface;
    if (typeof body.is_indoor === "boolean") updates.is_indoor = body.is_indoor;
    if (typeof body.is_free === "boolean") updates.is_free = body.is_free;
    if (body.note !== undefined) updates.note = body.note;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    await ref.update(updates);
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
    await getAdminDb().collection("venues").doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
