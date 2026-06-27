import { getDeviceId } from "./device";
import type { Player } from "./types";

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const deviceId = getDeviceId();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };
  if (deviceId) {
    (headers as Record<string, string>)["x-device-id"] = deviceId;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }

  return data as T;
}

export async function createOrUpdatePlayer(body: {
  nickname: string;
  preferred_sports: string[];
  avatar_color: string;
  device_id?: string;
}): Promise<Player> {
  return apiFetch<Player>("/api/players", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
