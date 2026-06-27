"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionFeed, Player } from "@/lib/types";
import { ka } from "@/lib/i18n/ka";
import { apiFetch } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { SessionCard } from "@/components/session/SessionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GamesResponse {
  player: Player;
  upcoming: (SessionFeed & { is_host?: boolean })[];
  past: (SessionFeed & { is_host?: boolean })[];
}

export default function MyGamesPage() {
  const { player, loading: playerLoading } = usePlayer();
  const [data, setData] = useState<GamesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    setLoading(true);
    try {
      const result = await apiFetch<GamesResponse>(
        `/api/players/${deviceId}/games`
      );
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!playerLoading && player) {
      fetchGames();
    }
  }, [fetchGames, player, playerLoading]);

  if (playerLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center pb-safe">
        {ka.common.loading}
      </div>
    );
  }

  const reliability = data?.player ?? player;

  return (
    <div className="min-h-dvh pb-safe">
      <header className="border-b px-4 py-4">
        <h1 className="text-xl font-bold">{ka.myGames.title}</h1>
        {reliability && (
          <p className="mt-1 text-sm text-muted-foreground">
            {ka.myGames.reliability}: {reliability.games_played} ·{" "}
            {ka.myGames.noShows}: {reliability.no_shows}
          </p>
        )}
      </header>

      <div className="p-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">
              {ka.myGames.upcoming}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              {ka.myGames.past}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {data?.upcoming.length === 0 ? (
              <EmptyState />
            ) : (
              data?.upcoming.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {data?.past.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {ka.myGames.empty}
              </p>
            ) : (
              data?.past.map((s) => (
                <SessionCard key={s.id} session={s} compact />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="font-medium">{ka.myGames.empty}</p>
      <p className="mt-1 text-sm text-muted-foreground">{ka.myGames.emptyHint}</p>
    </div>
  );
}
