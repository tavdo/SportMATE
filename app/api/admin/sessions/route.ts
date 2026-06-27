import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import { effectiveSessionStatus } from "@/lib/types";
import type { SessionFeed } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const snap = await getAdminDb().collection("sessions").get();
    const sessions = snap.docs
      .map((d) => docData<SessionFeed>(d)!)
      .map((s) => ({
        ...s,
        effective_status: effectiveSessionStatus(s),
      }))
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    return NextResponse.json(sessions);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
