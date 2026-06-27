import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData, filterSessionFeed } from "@/lib/firestore/helpers";
import { effectiveSessionStatus } from "@/lib/types";
import type { Player, SessionFeed, Venue } from "@/lib/types";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import { tFromRequest } from "@/lib/i18n/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sport = searchParams.get("sport");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const skill = searchParams.get("skill");

    const snap = await getAdminDb().collection("sessions").get();
    const sessions = snap.docs.map((d) => docData<SessionFeed>(d)!);
    const filtered = filterSessionFeed(sessions, { sport, dateFrom, dateTo, skill });

    return NextResponse.json(
      filtered.map((s) => ({
        ...s,
        effective_status: effectiveSessionStatus(s),
      }))
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const body = await req.json();
    const { venue_id, sport, starts_at, max_players, skill, note } = body;

    if (!venue_id || !sport || !starts_at || !max_players) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (new Date(starts_at) <= new Date()) {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 });
    }

    if (max_players < 2 || max_players > 30) {
      return NextResponse.json({ error: "Invalid max_players" }, { status: 400 });
    }

    const db = getAdminDb();
    const playerSnap = await db.collection("players").doc(auth.uid).get();
    if (!playerSnap.exists) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    const host = docData<Player>(playerSnap)!;

    if (host.is_banned) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const venueSnap = await db.collection("venues").doc(venue_id).get();
    if (!venueSnap.exists) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }
    const venue = docData<Venue>(venueSnap)!;

    const sessionRef = db.collection("sessions").doc();
    const now = new Date().toISOString();
    const session: SessionFeed = {
      id: sessionRef.id,
      venue_id,
      sport,
      host_id: auth.uid,
      starts_at,
      max_players,
      skill: skill ?? "any",
      status: "open",
      note: note ?? null,
      created_at: now,
      venue_name: venue.name,
      lat: venue.lat,
      lng: venue.lng,
      district: venue.district,
      photo_url: venue.photo_url,
      host_nickname: host.nickname,
      current_players: 1,
    };

    const batch = db.batch();
    batch.set(sessionRef, session);
    batch.set(sessionRef.collection("participants").doc(auth.uid), {
      session_id: sessionRef.id,
      player_id: auth.uid,
      status: "going",
      joined_at: now,
      player: {
        id: host.id,
        nickname: host.nickname,
        avatar_color: host.avatar_color,
        games_played: host.games_played,
        no_shows: host.no_shows,
        is_verified: host.is_verified,
      },
    });
    await batch.commit();

    return NextResponse.json(session, { status: 201 });
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
