"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { MapOperator } from "@/app/api/operators/route";
import { MaidenheadGridLayer } from "@/components/home/MaidenheadGridLayer";
import { latLngToMaidenhead } from "@/lib/maidenhead";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "qrz-map-marker",
  html: `<div class="qrz-map-marker__pin"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

type OperatorsMapProps = {
  operators: MapOperator[];
  className?: string;
};

export function OperatorsMap({ operators, className }: OperatorsMapProps) {
  const center = useMemo(() => {
    if (operators.length === 0) return { lat: 50, lng: 5 };
    const lat =
      operators.reduce((sum, o) => sum + o.latitude, 0) / operators.length;
    const lng =
      operators.reduce((sum, o) => sum + o.longitude, 0) / operators.length;
    return { lat, lng };
  }, [operators]);

  const initialZoom = useMemo(() => {
    if (operators.length === 0) return 4;
    if (operators.length === 1) return 6;
    return 4;
  }, [operators.length]);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [operators.length]);

  return (
    <div
      className={`maidenhead-map rounded-xl overflow-hidden border border-gray-200 z-0 ${className ?? "h-56"}`}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={initialZoom}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full maidenhead-map__leaflet"
        style={{ minHeight: "220px", background: "#c8dff0" }}
      >
        <ZoomControl position="bottomright" />
        {/* Light land / blue water, no street labels — like locator charts */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <MaidenheadGridLayer />
        {operators.map((op) => {
          const grid = latLngToMaidenhead(op.latitude, op.longitude, 6);
          return (
            <Marker
              key={op.id}
              position={[op.latitude, op.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-ham-purple">{op.callsign}</p>
                  <p className="text-gray-600">{op.name}</p>
                  <p className="text-xs text-gray-500">{op.location}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    Grid: {grid}
                  </p>
                  <Link
                    href={`/profile/${op.callsign}`}
                    className="text-xs text-ham-purple underline mt-1 inline-block"
                  >
                    View profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="maidenhead-map__caption">
        Maidenhead Grid Locator Map
      </div>
    </div>
  );
}
