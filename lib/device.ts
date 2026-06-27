const DEVICE_ID_KEY = "sportmate_device_id";
const NICKNAME_KEY = "sportmate_nickname";
const SPORTS_KEY = "sportmate_preferred_sports";
const COLOR_KEY = "sportmate_avatar_color";

export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NICKNAME_KEY);
}

export function setStoredNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function getStoredPreferredSports(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SPORTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredPreferredSports(sports: string[]): void {
  localStorage.setItem(SPORTS_KEY, JSON.stringify(sports));
}

export function getStoredAvatarColor(): string {
  if (typeof window === "undefined") return "#22c55e";
  return localStorage.getItem(COLOR_KEY) ?? "#22c55e";
}

export function setStoredAvatarColor(color: string): void {
  localStorage.setItem(COLOR_KEY, color);
}

export function clearPlayerStorage(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(NICKNAME_KEY);
  localStorage.removeItem(SPORTS_KEY);
  localStorage.removeItem(COLOR_KEY);
}
