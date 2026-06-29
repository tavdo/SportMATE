import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import { tFromRequest } from "@/lib/i18n/server";
import type { Player, Gender, AgeRange } from "@/lib/types";

const VALID_GENDERS: Gender[] = ["male", "female", "other", "prefer_not_to_say"];
const VALID_AGE_RANGES: AgeRange[] = ["18_24", "25_34", "35_44", "45_54", "55_plus"];

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const body = await req.json();
    const { nickname, preferred_sports, avatar_color, gender, age_range } = body;

    if (!nickname || typeof nickname !== "string" || nickname.trim().length < 2) {
      return NextResponse.json({ error: "Invalid nickname" }, { status: 400 });
    }

    if (!Array.isArray(preferred_sports) || preferred_sports.length === 0) {
      return NextResponse.json({ error: "Select at least one sport" }, { status: 400 });
    }

    if (!gender || !VALID_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "Select gender" }, { status: 400 });
    }

    if (!age_range || !VALID_AGE_RANGES.includes(age_range)) {
      return NextResponse.json({ error: "Select age range" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();
    const player: Player = {
      id: auth.uid,
      nickname: nickname.trim(),
      preferred_sports,
      avatar_color: avatar_color ?? "#22c55e",
      gender,
      age_range,
      games_played: 0,
      no_shows: 0,
      is_verified: true,
      phone_number: auth.phone || null,
      email: auth.email || null,
      created_at: now,
      is_banned: false,
    };

    const existing = await db.collection("players").doc(auth.uid).get();
    if (existing.exists) {
      const prev = docData<Player>(existing)!;
      if (prev.is_banned) {
        return NextResponse.json({ error: "Account suspended" }, { status: 403 });
      }
      player.games_played = prev.games_played;
      player.no_shows = prev.no_shows;
      player.created_at = prev.created_at;
      player.phone_number = auth.phone || prev.phone_number;
      player.email = auth.email || prev.email;
    }

    await db.collection("players").doc(auth.uid).set(player);
    return NextResponse.json(player);
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
