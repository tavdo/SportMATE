"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SessionDetail, ParticipantWithPlayer } from "@/lib/types";
import { SPORT_COLORS, SPORT_EMOJI } from "@/lib/types";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { getFirestoreDb } from "@/lib/firebase-client";
import { collection, onSnapshot } from "firebase/firestore";
import { formatDateTime } from "@/lib/utils";
import { PlayerList } from "@/components/session/PlayerList";
import { JoinButton } from "@/components/session/JoinButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MiniMap = dynamic(
  () => import("@/components/session/MiniMap").then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-xl bg-muted" /> }
);

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const t = useT();
  const { locale } = useLocale();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNoShows, setSelectedNoShows] = useState<string[]>([]);
  const [markingNoShow, setMarkingNoShow] = useState(false);

  const sessionId = params.id as string;
  const uid = user?.uid ?? null;

  const fetchSession = useCallback(async () => {
    try {
      const data = await apiFetch<SessionDetail>(`/api/sessions/${sessionId}`);
      setSession(data);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) return;

    const unsub = onSnapshot(
      collection(db, "sessions", sessionId, "participants"),
      () => fetchSession()
    );
    return () => unsub();
  }, [sessionId, fetchSession]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        {t.common.loading}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <p>{t.common.error}</p>
        <Button onClick={() => router.push("/")}>{t.common.back}</Button>
      </div>
    );
  }

  const isJoined = uid
    ? session.participants.some((p) => p.player_id === uid && p.status === "going")
    : false;
  const isHost = uid ? session.host_id === uid : false;
  const isPast = new Date(session.starts_at) < new Date();

  const participants = session.participants.filter(
    (p) => p.status === "going"
  ) as ParticipantWithPlayer[];

  async function handleMarkNoShows() {
    if (!uid || selectedNoShows.length === 0) return;
    setMarkingNoShow(true);
    try {
      await apiFetch(`/api/players/me/games`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          player_ids: selectedNoShows,
        }),
      });
      setSelectedNoShows([]);
      fetchSession();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingNoShow(false);
    }
  }

  function toggleNoShow(playerId: string) {
    setSelectedNoShows((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }

  return (
    <div className="min-h-dvh pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">
          {SPORT_EMOJI[session.sport]} {t.sports[session.sport]}
        </h1>
      </header>

      <div className="space-y-4 p-4">
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: SPORT_COLORS[session.sport] }}
        />

        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <div className="text-sm text-muted-foreground">{t.session.venue}</div>
              <div className="font-semibold">{session.venue_name}</div>
              {session.venue?.note && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.venue.note}
                </p>
              )}
            </div>

            {session.venue && (
              <MiniMap lat={session.venue.lat} lng={session.venue.lng} />
            )}

            <div>
              <div className="text-sm text-muted-foreground">{t.session.dateTime}</div>
              <div className="font-medium">
                {formatDateTime(session.starts_at, locale)}
              </div>
            </div>

            <div className="flex gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t.create.skill}</div>
                <div>{t.skill[session.skill]}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t.map.players}</div>
                <div className="text-lg font-bold">
                  {session.current_players}/{session.max_players}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t.session.host}</div>
              <div>{session.host_nickname}</div>
            </div>

            {session.note && (
              <div>
                <div className="text-sm text-muted-foreground">{t.session.note}</div>
                <p>{session.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 font-semibold">{t.session.players}</h2>
          <PlayerList
            participants={participants}
            hostId={session.host_id}
            selectedNoShows={selectedNoShows}
            onToggleNoShow={toggleNoShow}
            showNoShowPicker={isHost && isPast && session.status !== "cancelled"}
          />
        </div>

        {isHost && isPast && session.status !== "cancelled" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMarkNoShows}
            disabled={markingNoShow || selectedNoShows.length === 0}
          >
            {t.session.markNoShow}
          </Button>
        )}

        <JoinButton
          session={session}
          isJoined={isJoined}
          isHost={isHost}
          onUpdate={fetchSession}
        />
      </div>
    </div>
  );
}
