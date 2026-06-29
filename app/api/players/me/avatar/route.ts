import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { docData } from "@/lib/firestore/helpers";
import {
  deletePlayerAvatarFiles,
  uploadPlayerAvatar,
} from "@/lib/avatar-storage";
import { validateAvatarUpload } from "@/lib/avatar-constants";
import { requireUser, isAuthUser } from "@/lib/request-auth";
import { tFromRequest } from "@/lib/i18n/server";
import type { Player } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const t = tFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: t.profile.invalidPhotoType }, { status: 400 });
    }

    const validation = validateAvatarUpload(file.size, file.type);
    if (validation === "too_large") {
      return NextResponse.json({ error: t.profile.photoTooLarge }, { status: 400 });
    }
    if (validation === "invalid_type") {
      return NextResponse.json({ error: t.profile.invalidPhotoType }, { status: 400 });
    }

    const db = getAdminDb();
    const playerRef = db.collection("players").doc(auth.uid);
    const existing = docData<Player>(await playerRef.get());

    if (!existing || existing.is_banned) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const avatar_url = await uploadPlayerAvatar(auth.uid, buffer, file.type);

    await playerRef.update({ avatar_url });
    const updated: Player = { ...existing, avatar_url };

    return NextResponse.json(updated);
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

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!isAuthUser(auth)) return auth;

    const db = getAdminDb();
    const playerRef = db.collection("players").doc(auth.uid);
    const existing = docData<Player>(await playerRef.get());

    if (!existing || existing.is_banned) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    await deletePlayerAvatarFiles(auth.uid);
    await playerRef.update({ avatar_url: null });
    const updated: Player = { ...existing, avatar_url: null };

    return NextResponse.json(updated);
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
