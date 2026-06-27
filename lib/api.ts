import { getIdToken } from "./auth-client";
import type { Player } from "./types";

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const locale =
    typeof window !== "undefined"
      ? localStorage.getItem("sportmate_locale") ?? "ka"
      : "ka";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept-Language": locale,
    ...(options?.headers ?? {}),
  };

  const token = await getIdToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
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
}): Promise<Player> {
  return apiFetch<Player>("/api/players", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
