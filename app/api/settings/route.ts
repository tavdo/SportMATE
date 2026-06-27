import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/types";

const SETTINGS_DOC = "site";

export async function GET() {
  try {
    const snap = await getAdminDb().collection("settings").doc(SETTINGS_DOC).get();
    if (!snap.exists) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS);
    }
    return NextResponse.json((snap.data() as SiteSettings) ?? DEFAULT_SITE_SETTINGS);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
