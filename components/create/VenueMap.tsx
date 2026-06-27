"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import type { Venue } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const BATUMI_CENTER: [number, number] = [41.64, 41.63];

const venueIcon = L.divIcon({
  className: "venue-marker",
  html: `<div style="
    background:#64748b;width:24px;height:24px;border-radius:50%;
    border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface VenueMapProps {
  venues: Venue[];
  selectedVenueId?: string;
  onSelect: (venue: Venue) => void;
}

export function VenueMap({ venues, selectedVenueId, onSelect }: VenueMapProps) {
  return (
    <div className="h-64 overflow-hidden rounded-xl">
      <MapContainer center={BATUMI_CENTER} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResizeFix />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.lat, venue.lng]}
            icon={venueIcon}
            eventHandlers={{ click: () => onSelect(venue) }}
            opacity={selectedVenueId && selectedVenueId !== venue.id ? 0.5 : 1}
          />
        ))}
      </MapContainer>
    </div>
  );
}
