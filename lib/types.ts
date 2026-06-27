export type SportType = "football" | "basketball" | "volleyball";
export type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";
export type SessionStatus = "open" | "full" | "cancelled" | "done";
export type ParticipantStatus = "going" | "cancelled";

export interface Player {
  id: string;
  nickname: string;
  avatar_color: string;
  preferred_sports: SportType[];
  games_played: number;
  no_shows: number;
  is_verified: boolean;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sports: SportType[];
  district: string | null;
  surface: string | null;
  is_indoor: boolean;
  is_free: boolean;
  photo_url: string | null;
  note: string | null;
}

export interface Session {
  id: string;
  venue_id: string;
  sport: SportType;
  host_id: string;
  starts_at: string;
  max_players: number;
  skill: SkillLevel;
  status: SessionStatus;
  note: string | null;
  created_at: string;
}

export interface SessionFeed extends Session {
  venue_name: string;
  lat: number;
  lng: number;
  district: string | null;
  photo_url: string | null;
  host_nickname: string;
  current_players: number;
}

export interface Participant {
  id: string;
  session_id: string;
  player_id: string;
  status: ParticipantStatus;
  joined_at: string;
}

export interface ParticipantWithPlayer extends Participant {
  player: Pick<Player, "id" | "nickname" | "avatar_color" | "games_played" | "no_shows" | "is_verified">;
}

export interface SessionDetail extends SessionFeed {
  venue: Venue;
  participants: ParticipantWithPlayer[];
}

export const SPORT_COLORS: Record<SportType, string> = {
  football: "#22c55e",
  basketball: "#f97316",
  volleyball: "#3b82f6",
};

export const SPORT_EMOJI: Record<SportType, string> = {
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
};

export const AVATAR_COLORS = [
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#ef4444",
];

export function effectiveSessionStatus(
  session: Pick<Session, "status" | "starts_at">
): SessionStatus {
  if (session.status === "cancelled") return "cancelled";
  if (new Date(session.starts_at) < new Date()) return "done";
  return session.status;
}

export function reliabilityColor(gamesPlayed: number, noShows: number): string {
  if (gamesPlayed === 0) return "#94a3b8";
  const ratio = noShows / gamesPlayed;
  if (ratio <= 0.1) return "#22c55e";
  if (ratio <= 0.3) return "#eab308";
  return "#ef4444";
}
