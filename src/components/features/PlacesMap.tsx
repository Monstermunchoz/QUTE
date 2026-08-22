"use client";

import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Lieu } from "@/types";

const LYON: [number, number] = [45.764, 4.8357];

const markerIcon = L.divIcon({
  className: "qute-marker",
  html: '<span class="qute-marker-dot"></span>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8],
});

type PlacesMapProps = {
  lieux: Lieu[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
};

export function PlacesMap({
  lieux,
  center = LYON,
  zoom = 12,
  interactive = true,
}: PlacesMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="relative z-0 h-56 w-full overflow-hidden rounded-[16px] border border-[#1E1E1E]"
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      attributionControl
    >
      <TileLayer
        attribution="CartoDB"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {lieux
        .filter((lieu) => lieu.latitude != null && lieu.longitude != null)
        .map((lieu) => (
          <Marker
            key={lieu.id}
            position={[Number(lieu.latitude), Number(lieu.longitude)]}
            icon={markerIcon}
          >
            <Popup>
              <p className="font-bold text-white">{lieu.nom}</p>
              {lieu.categorie ? (
                <p className="text-xs text-[#FF2D87]">{lieu.categorie}</p>
              ) : null}
              <Link
                href={`/lieux/${lieu.id}`}
                className="mt-2 inline-block text-sm font-bold text-white underline"
              >
                Voir
              </Link>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
