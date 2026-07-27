"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapOperator } from "@/app/api/operators/route";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type OperatorsMapProps = {
  operators: MapOperator[];
  className?: string;
};

export function OperatorsMap({ operators, className }: OperatorsMapProps) {
  const center = useMemo(() => {
    if (operators.length === 0) return { lat: 20, lng: 0 };
    const lat =
      operators.reduce((sum, o) => sum + o.latitude, 0) / operators.length;
    const lng =
      operators.reduce((sum, o) => sum + o.longitude, 0) / operators.length;
    return { lat, lng };
  }, [operators]);

  useEffect(() => {
    // Leaflet needs explicit dimensions after mount in some layouts
    window.dispatchEvent(new Event("resize"));
  }, [operators.length]);

  if (operators.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-500 ${className ?? "h-44"}`}
      >
        No operator locations yet. Register with your location to appear on the map.
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-100 z-0 ${className ?? "h-44"}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={operators.length === 1 ? 6 : 2}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: "176px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {operators.map((op) => (
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
                <Link
                  href={`/profile/${op.callsign}`}
                  className="text-xs text-ham-purple underline mt-1 inline-block"
                >
                  View profile
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
