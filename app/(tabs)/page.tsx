"use client";

import { useCallback, useEffect, useState } from "react";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { SessionFeed, SportType, SkillLevel } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { apiFetch } from "@/lib/api";
import { getDateRange } from "@/lib/utils";
import { getFirestoreDb } from "@/lib/firebase-client";
import { collection, onSnapshot } from "firebase/firestore";
import { FilterBar } from "@/components/map/FilterBar";
import { MapLoading } from "@/components/map/MapLoading";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/hooks/usePlayer";

const MapView = dynamicImport(
  () => import("@/components/map/MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapPage() {
  const { player, loading: playerLoading } = usePlayer();
  const t = useT();
  const [sessions, setSessions] = useState<SessionFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState<SportType | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "tomorrow" | "week">("week");
  const [skill, setSkill] = useState<SkillLevel | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange(dateFilter);
      const params = new URLSearchParams({ date_from: from, date_to: to });
      if (sport) params.set("sport", sport);
      if (skill) params.set("skill", skill);

      const data = await apiFetch<SessionFeed[]>(`/api/sessions?${params}`);
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [sport, dateFilter, skill]);

  useEffect(() => {
    if (!playerLoading && player) {
      fetchSessions();
    }
  }, [fetchSessions, player, playerLoading]);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) return;

    const unsub = onSnapshot(collection(db, "sessions"), () => fetchSessions());
    return () => unsub();
  }, [fetchSessions]);

  if (playerLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full">
      <div className="absolute left-0 right-0 top-0 z-[1000] p-3">
        <FilterBar
          sport={sport}
          dateFilter={dateFilter}
          skill={skill}
          onSportChange={setSport}
          onDateChange={setDateFilter}
          onSkillChange={setSkill}
        />
      </div>

      <MapView sessions={sessions} loading={loading} />

      {!loading && sessions.length === 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000] rounded-2xl bg-background/95 p-4 text-center text-sm shadow-lg backdrop-blur">
          {t.map.emptyFilter}
        </div>
      )}

      <div className="absolute bottom-20 left-0 right-0 z-[1000] flex justify-center px-4">
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/create">
            <Plus className="mr-2 h-5 w-5" />
            {t.map.createGame}
          </Link>
        </Button>
      </div>
    </div>
  );
}
