export type SportType =
  | "football"
  | "basketball"
  | "volleyball"
  | "karting"
  | "airsoft"
  | "paintball"
  | "billiards";

export const SPORT_TYPES: SportType[] = [
  "football",
  "basketball",
  "volleyball",
  "karting",
  "airsoft",
  "paintball",
  "billiards",
];
export type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type SessionStatus = "open" | "full" | "cancelled" | "done";
export type ParticipantStatus = "going" | "cancelled";

export const GENDER_OPTIONS: Gender[] = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
];

export type AgeRange = "18_24" | "25_34" | "35_44" | "45_54" | "55_plus";

export const AGE_RANGE_OPTIONS: AgeRange[] = [
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_plus",
];

export interface Player {
  id: string;
  nickname: string;
  avatar_color: string;
  avatar_url: string | null;
  preferred_sports: SportType[];
  gender: Gender | null;
  age_range: AgeRange | null;
  games_played: number;
  no_shows: number;
  is_verified: boolean;
  phone_number: string | null;
  email: string | null;
  created_at: string;
  is_banned?: boolean;
}

export type PublicPlayer = Pick<
  Player,
  | "id"
  | "nickname"
  | "avatar_color"
  | "avatar_url"
  | "preferred_sports"
  | "gender"
  | "age_range"
  | "games_played"
  | "no_shows"
  | "is_verified"
  | "created_at"
>;

export function toPublicPlayer(player: Player): PublicPlayer {
  return {
    id: player.id,
    nickname: player.nickname,
    avatar_color: player.avatar_color,
    avatar_url: player.avatar_url ?? null,
    preferred_sports: player.preferred_sports,
    gender: player.gender,
    age_range: player.age_range,
    games_played: player.games_played,
    no_shows: player.no_shows,
    is_verified: player.is_verified,
    created_at: player.created_at,
  };
}

export type EmbeddedPlayer = Pick<
  Player,
  | "id"
  | "nickname"
  | "avatar_color"
  | "avatar_url"
  | "games_played"
  | "no_shows"
  | "is_verified"
>;

export interface SiteSettings {
  app_name: string;
  tagline: string;
  contact_phone: string | null;
  contact_email: string | null;
  about: string | null;
  updated_at: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  app_name: "SportMate Batumi",
  tagline: "Find pickup games in Batumi",
  contact_phone: null,
  contact_email: null,
  about: null,
  updated_at: new Date().toISOString(),
};

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
  player: EmbeddedPlayer;
}

export interface SessionDetail extends SessionFeed {
  venue: Venue;
  participants: ParticipantWithPlayer[];
}

export interface SessionMessage {
  id: string;
  session_id: string;
  player_id: string;
  nickname: string;
  avatar_color: string;
  avatar_url?: string | null;
  text: string;
  created_at: string;
}

export const SPORT_COLORS: Record<SportType, string> = {
  football: "#22c55e",
  basketball: "#f97316",
  volleyball: "#3b82f6",
  karting: "#dc2626",
  airsoft: "#65a30d",
  paintball: "#a855f7",
  billiards: "#0f766e",
};

export const SPORT_EMOJI: Record<SportType, string> = {
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  karting: "🏎️",
  airsoft: "🎯",
  paintball: "💥",
  billiards: "🎱",
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
