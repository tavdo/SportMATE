"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Venue, SportType } from "@/lib/types";
import { SPORT_EMOJI } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VenueMap = dynamic(() => import("./VenueMap").then((m) => m.VenueMap), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted" />,
});

interface VenuePickerProps {
  venues: Venue[];
  selectedSport?: SportType;
  selectedVenueId?: string;
  onSelect: (venue: Venue) => void;
}

export function VenuePicker({
  venues,
  selectedSport,
  selectedVenueId,
  onSelect,
}: VenuePickerProps) {
  const t = useT();
  const [view, setView] = useState<"list" | "map">("list");

  const filtered = selectedSport
    ? venues.filter((v) => v.sports.includes(selectedSport))
    : venues;

  return (
    <div className="space-y-3">
      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
        <TabsList className="w-full">
          <TabsTrigger value="list" className="flex-1">
            {t.create.listView}
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1">
            {t.create.mapView}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "map" ? (
        <VenueMap
          venues={filtered}
          selectedVenueId={selectedVenueId}
          onSelect={onSelect}
        />
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {filtered.map((venue) => (
            <Card
              key={venue.id}
              className={cn(
                "cursor-pointer transition-colors",
                selectedVenueId === venue.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelect(venue)}
            >
              <CardContent className="p-3">
                <div className="font-medium">{venue.name}</div>
                <div className="text-sm text-muted-foreground">
                  {venue.district} · {venue.sports.map((s) => SPORT_EMOJI[s]).join(" ")}
                </div>
                {venue.note && (
                  <p className="mt-1 text-xs text-muted-foreground">{venue.note}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
