"use client";

import { useEffect, useState } from "react";
import type { GameWeather } from "@/lib/weather";

interface UseGameWeatherOptions {
  lat?: number;
  lng?: number;
  at?: string | Date | null;
  enabled?: boolean;
}

export function useGameWeather({
  lat,
  lng,
  at,
  enabled = true,
}: UseGameWeatherOptions) {
  const [weather, setWeather] = useState<GameWeather | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || lat == null || lng == null || !at) {
      setWeather(null);
      setLoading(false);
      return;
    }

    const atDate = typeof at === "string" ? new Date(at) : at;
    if (Number.isNaN(atDate.getTime()) || atDate.getTime() < Date.now() - 60 * 60 * 1000) {
      setWeather(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(
      `/api/weather?lat=${lat}&lng=${lng}&at=${encodeURIComponent(atDate.toISOString())}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GameWeather | null) => setWeather(data))
      .catch(() => setWeather(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lat, lng, at, enabled]);

  return { weather, loading };
}
