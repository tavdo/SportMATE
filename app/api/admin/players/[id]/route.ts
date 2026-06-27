import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import type { Player } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await req.json();
    const db = getAdminDb();
    const playerRef = db.collection("players").doc(params.id);
    const player = docData<Player>(await playerRef.get());

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const updates: Partial<Player> = {};
    if (typeof body.is_banned === "boolean") updates.is_banned = body.is_banned;
    if (typeof body.is_verified === "boolean") updates.is_verified = body.is_verified;
    if (typeof body.nickname === "string" && body.nickname.trim().length >= 2) {
      updates.nickname = body.nickname.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    await playerRef.update(updates);
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
    await getAdminDb().collection("players").doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
