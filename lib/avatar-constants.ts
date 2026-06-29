export const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const AVATAR_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function avatarExtensionForMime(mime: string): string | null {
  return AVATAR_MIME_TO_EXT[mime] ?? null;
}

export function validateAvatarUpload(
  size: number,
  mime: string
): "too_large" | "invalid_type" | null {
  if (size > MAX_AVATAR_BYTES) return "too_large";
  if (!avatarExtensionForMime(mime)) return "invalid_type";
  return null;
}
