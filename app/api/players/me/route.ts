import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import type { Player } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const snap = await getAdminDb().collection("players").doc(auth.uid).get();
    const player = docData<Player>(snap);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (player.is_banned) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    return NextResponse.json({ ...player, avatar_url: player.avatar_url ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
