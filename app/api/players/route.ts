import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { ka } from "@/lib/i18n/ka";
import type { Player } from "@/lib/types";

function getDeviceIdFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get("x-device-id") ??
    (req.nextUrl.searchParams.get("device_id") || null)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deviceId = getDeviceIdFromRequest(req) ?? body.device_id;

    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json({ error: "device_id required" }, { status: 400 });
    }

    const { nickname, preferred_sports, avatar_color } = body;

    if (!nickname || typeof nickname !== "string" || nickname.trim().length < 2) {
      return NextResponse.json({ error: "Invalid nickname" }, { status: 400 });
    }

    if (!Array.isArray(preferred_sports) || preferred_sports.length === 0) {
      return NextResponse.json({ error: "Select at least one sport" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();
    const player: Player = {
      id: deviceId,
      nickname: nickname.trim(),
      preferred_sports,
      avatar_color: avatar_color ?? "#22c55e",
      games_played: 0,
      no_shows: 0,
      is_verified: false,
      created_at: now,
    };

    const existing = await db.collection("players").doc(deviceId).get();
    if (existing.exists) {
      const prev = docData<Player>(existing)!;
      player.games_played = prev.games_played;
      player.no_shows = prev.no_shows;
      player.is_verified = prev.is_verified;
      player.created_at = prev.created_at;
    }

    await db.collection("players").doc(deviceId).set(player);
    return NextResponse.json(player);
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
