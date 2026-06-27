import type {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { SessionFeed, Session, Player, Venue } from "@/lib/types";

export function docData<T extends { id: string }>(
  snap: DocumentSnapshot | QueryDocumentSnapshot
): T | null {
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export function sessionToFeed(session: SessionFeed): SessionFeed {
  return session;
}

export function filterSessionFeed(
  sessions: SessionFeed[],
  filters: {
    sport?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    skill?: string | null;
  }
): SessionFeed[] {
  const now = new Date().toISOString();
  return sessions
    .filter((s) => ["open", "full"].includes(s.status))
    .filter((s) => s.starts_at >= now)
    .filter((s) => !filters.sport || s.sport === filters.sport)
    .filter((s) => !filters.dateFrom || s.starts_at >= filters.dateFrom)
    .filter((s) => !filters.dateTo || s.starts_at < filters.dateTo)
    .filter(
      (s) =>
        !filters.skill || filters.skill === "any" || s.skill === filters.skill
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
}

export type PlayerDoc = Player;
export type VenueDoc = Venue;
export type SessionDoc = SessionFeed;
