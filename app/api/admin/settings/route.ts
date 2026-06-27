import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin, isAuthUser } from "@/lib/request-auth";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/types";

const SETTINGS_DOC = "site";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

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

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await req.json();
    const db = getAdminDb();
    const ref = db.collection("settings").doc(SETTINGS_DOC);
    const existing = (await ref.get()).data() as SiteSettings | undefined;
    const prev = existing ?? DEFAULT_SITE_SETTINGS;

    const settings: SiteSettings = {
      app_name: typeof body.app_name === "string" ? body.app_name.trim() : prev.app_name,
      tagline: typeof body.tagline === "string" ? body.tagline.trim() : prev.tagline,
      contact_phone: body.contact_phone !== undefined ? body.contact_phone : prev.contact_phone,
      contact_email: body.contact_email !== undefined ? body.contact_email : prev.contact_email,
      about: body.about !== undefined ? body.about : prev.about,
      updated_at: new Date().toISOString(),
    };

    await ref.set(settings);
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
