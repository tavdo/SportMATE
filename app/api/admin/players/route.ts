import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import type { Player } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const snap = await getAdminDb().collection("players").get();
    const players = snap.docs
      .map((d) => docData<Player>(d)!)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(players);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
