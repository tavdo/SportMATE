import { randomUUID } from "crypto";
import { getAdminBucket } from "@/lib/firebase-admin";
import { avatarExtensionForMime } from "@/lib/avatar-constants";

function buildDownloadUrl(bucketName: string, path: string, token: string): string {
  const encoded = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`;
}

export async function uploadPlayerAvatar(
  uid: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  const ext = avatarExtensionForMime(mime)!;
  const path = `avatars/${uid}.${ext}`;
  const bucket = getAdminBucket();
  const file = bucket.file(path);
  const token = randomUUID();

  await deletePlayerAvatarFiles(uid);

  await file.save(buffer, {
    metadata: {
      contentType: mime,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return buildDownloadUrl(bucket.name, path, token);
}

export async function deletePlayerAvatarFiles(uid: string): Promise<void> {
  const bucket = getAdminBucket();
  const [files] = await bucket.getFiles({ prefix: `avatars/${uid}` });
  await Promise.all(files.map((f) => f.delete().catch(() => undefined)));
}
