"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const BATUMI_CENTER: [number, number] = [41.64, 41.63];

const pickIcon = L.divIcon({
  className: "venue-pick-marker",
  html: `<div style="
    background:#22c55e;width:28px;height:28px;border-radius:50%;
    border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const existingIcon = L.divIcon({
  className: "venue-existing-marker",
  html: `<div style="
    background:#94a3b8;width:18px;height:18px;border-radius:50%;
    border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({
  lat,
  lng,
  flyKey,
}: {
  lat: number;
  lng: number;
  flyKey: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (flyKey === 0) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [flyKey, lat, lng, map]);
  return null;
}

export interface VenueLocationPickerLabels {
  mapLocation: string;
  pickHint: string;
  existingHint: string;
  useMyLocation: string;
  locationError: string;
}

interface VenueLocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  existingVenues?: Venue[];
  excludeVenueId?: string | null;
  centerTrigger?: number;
  labels: VenueLocationPickerLabels;
}

function roundCoord(n: number) {
  return Math.round(n * 1_000_000) / 1_000_000;
}

export function VenueLocationPicker({
  lat,
  lng,
  onChange,
  existingVenues = [],
  excludeVenueId = null,
  centerTrigger = 0,
  labels,
}: VenueLocationPickerProps) {
  const [flyKey, setFlyKey] = useState(0);

  useEffect(() => {
    if (centerTrigger > 0) setFlyKey(centerTrigger);
  }, [centerTrigger]);

  const others = useMemo(
    () => existingVenues.filter((v) => v.id !== excludeVenueId),
    [existingVenues, excludeVenueId]
  );

  const validCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const position: [number, number] = validCoords ? [lat, lng] : BATUMI_CENTER;

  function pick(nextLat: number, nextLng: number) {
    onChange(roundCoord(nextLat), roundCoord(nextLng));
    setFlyKey((k) => k + 1);
  }

  function handleMyLocation() {
    if (!navigator.geolocation) {
      alert(labels.locationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => pick(pos.coords.latitude, pos.coords.longitude),
      () => alert(labels.locationError),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <p className="text-sm font-medium">{labels.mapLocation}</p>
      <div className="h-72 overflow-hidden rounded-xl border sm:h-96">
        <MapContainer
          center={position}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapResizeFix />
          <MapClickHandler onPick={pick} />
          {validCoords && (
            <>
              <MapFlyTo lat={lat} lng={lng} flyKey={flyKey} />
              <Marker
                position={position}
                icon={pickIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    pick(ll.lat, ll.lng);
                  },
                }}
              />
            </>
          )}
          {others.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={existingIcon}
            >
              <Popup>
                <span className="text-sm font-medium">{venue.name}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {labels.pickHint}
        {others.length > 0 ? ` ${labels.existingHint}` : ""}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={handleMyLocation}>
        <MapPin className="mr-2 h-4 w-4" />
        {labels.useMyLocation}
      </Button>
    </div>
  );
}
