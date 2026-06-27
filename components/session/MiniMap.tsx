"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.divIcon({
  className: "venue-marker",
  html: `<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MiniMapProps {
  lat: number;
  lng: number;
}

export function MiniMap({ lat, lng }: MiniMapProps) {
  useEffect(() => {}, []);

  return (
    <div className="h-32 overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
