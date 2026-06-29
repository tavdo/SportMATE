import { getIdToken } from "./auth-client";
import type { Player, PublicPlayer } from "./types";

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

async function apiFetchMultipart<T>(url: string, formData: FormData): Promise<T> {
  const locale =
    typeof window !== "undefined"
      ? localStorage.getItem("sportmate_locale") ?? "ka"
      : "ka";

  const headers: HeadersInit = {
    Accept: "application/json",
    "Accept-Language": locale,
  };

  const token = await getIdToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { method: "POST", headers, body: formData });
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
  gender: string;
  age_range: string;
}): Promise<Player> {
  return apiFetch<Player>("/api/players", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function uploadPlayerAvatar(file: File): Promise<Player> {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiFetchMultipart<Player>("/api/players/me/avatar", formData);
}

export async function deletePlayerAvatar(): Promise<Player> {
  return apiFetch<Player>("/api/players/me/avatar", { method: "DELETE" });
}

export async function fetchPublicPlayer(id: string): Promise<PublicPlayer> {
  return apiFetch<PublicPlayer>(`/api/players/${id}/profile`);
}
