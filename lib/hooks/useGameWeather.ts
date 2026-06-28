"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameWeather } from "@/lib/weather";

interface UseGameWeatherOptions {
  lat?: number;
  lng?: number;
  at?: string | Date | null;
  enabled?: boolean;
}

const clientCache = new Map<string, GameWeather | null>();

function buildRequestKey(
  lat: number,
  lng: number,
  at: string | Date
): string | null {
  const atDate = typeof at === "string" ? new Date(at) : at;
  if (Number.isNaN(atDate.getTime())) return null;

  const hourBucket = Math.floor(atDate.getTime() / (60 * 60 * 1000));
  return `${lat.toFixed(4)},${lng.toFixed(4)},${hourBucket}`;
}

function normalizeAtValue(at: string | Date | null | undefined): string | null {
  if (!at) return null;
  if (typeof at === "string") return at;
  return Number.isNaN(at.getTime()) ? null : at.toISOString();
}

export function useGameWeather({
  lat,
  lng,
  at,
  enabled = true,
}: UseGameWeatherOptions) {
  const [weather, setWeather] = useState<GameWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  const atValue = normalizeAtValue(at);

  const requestKey = useMemo(() => {
    if (!enabled || lat == null || lng == null || !atValue) return null;
    return buildRequestKey(lat, lng, atValue);
  }, [enabled, lat, lng, atValue]);

  useEffect(() => {
    if (!requestKey || !atValue) {
      lastKeyRef.current = null;
      setWeather(null);
      setLoading(false);
      return;
    }

    const atDate = new Date(atValue);
    if (atDate.getTime() < Date.now() - 60 * 60 * 1000) {
      lastKeyRef.current = null;
      setWeather(null);
      setLoading(false);
      return;
    }

    if (clientCache.has(requestKey)) {
      lastKeyRef.current = requestKey;
      setWeather(clientCache.get(requestKey) ?? null);
      setLoading(false);
      return;
    }

    const isSameRequest = lastKeyRef.current === requestKey;
    lastKeyRef.current = requestKey;

    if (!isSameRequest) {
      setLoading(true);
    }

    const controller = new AbortController();

    fetch(
      `/api/weather?lat=${lat}&lng=${lng}&at=${encodeURIComponent(atDate.toISOString())}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GameWeather | null) => {
        clientCache.set(requestKey, data);
        setWeather(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        clientCache.set(requestKey, null);
        setWeather(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [requestKey, atValue, lat, lng]);

  return { weather, loading };
}
