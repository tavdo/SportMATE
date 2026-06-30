"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import Link from "next/link";
import type { SessionFeed, SportType } from "@/lib/types";
import { SPORT_COLORS, SPORT_EMOJI, SPORT_TYPES } from "@/lib/types";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

const BATUMI_CENTER: [number, number] = [41.64, 41.63];

function createSportIcon(sport: SportType) {
  const color = SPORT_COLORS[sport];
  const emoji = SPORT_EMOJI[sport];
  return L.divIcon({
    className: "sport-marker",
    html: `<div style="
      background:${color};
      width:36px;height:36px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:16px">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface MapViewProps {
  sessions: SessionFeed[];
  loading?: boolean;
}

export function MapView({ sessions, loading }: MapViewProps) {
  const t = useT();
  const { locale } = useLocale();

  const icons = useMemo(
    () =>
      Object.fromEntries(
        SPORT_TYPES.map((sport) => [sport, createSportIcon(sport)])
      ) as Record<SportType, L.DivIcon>,
    []
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={BATUMI_CENTER}
        zoom={13}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        <MarkerClusterGroup chunkedLoading>
          {sessions.map((session) => (
            <Marker
              key={session.id}
              position={[session.lat, session.lng]}
              icon={icons[session.sport]}
            >
              <Popup>
                <div className="min-w-[180px] space-y-2 p-1">
                  <div className="font-semibold">
                    {SPORT_EMOJI[session.sport]} {t.sports[session.sport]}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(session.starts_at, locale)}
                  </div>
                  <div className="text-sm font-medium">
                    {session.current_players}/{session.max_players} {t.map.players}
                  </div>
                  <div className="text-sm">{session.venue_name}</div>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/session/${session.id}`}>{t.map.details}</Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {loading && (
        <div className="absolute inset-x-0 top-20 z-[1000] flex justify-center">
          <span className="rounded-full bg-background/90 px-4 py-2 text-sm shadow">
            {t.map.loading}
          </span>
        </div>
      )}
    </div>
  );
}
