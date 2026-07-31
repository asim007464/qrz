"use client";

import { useEffect, useMemo, useState } from "react";
import { useMap, Rectangle, Marker, Pane } from "react-leaflet";
import L from "leaflet";
import {
  fieldsInBounds,
  squaresInBounds,
  type MaidenheadField,
  type MaidenheadSquare,
} from "@/lib/maidenhead";

function labelIcon(text: string, kind: "field" | "square"): L.DivIcon {
  const isField = kind === "field";
  return L.divIcon({
    className: "maidenhead-label",
    html: `<div class="maidenhead-label__inner maidenhead-label__inner--${kind}">${text}</div>`,
    iconSize: isField ? [48, 28] : [36, 18],
    iconAnchor: isField ? [24, 14] : [18, 9],
  });
}

function centerOf(box: { south: number; west: number; north: number; east: number }) {
  return {
    lat: (box.south + box.north) / 2,
    lng: (box.west + box.east) / 2,
  };
}

export function MaidenheadGridLayer() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [bounds, setBounds] = useState(() => map.getBounds());

  useEffect(() => {
    const sync = () => {
      setZoom(map.getZoom());
      setBounds(map.getBounds());
    };
    map.on("moveend", sync);
    map.on("zoomend", sync);
    sync();
    return () => {
      map.off("moveend", sync);
      map.off("zoomend", sync);
    };
  }, [map]);

  const pad = 0.5;
  const south = bounds.getSouth() - pad;
  const west = bounds.getWest() - pad;
  const north = bounds.getNorth() + pad;
  const east = bounds.getEast() + pad;

  const fields = useMemo(
    () => fieldsInBounds(south, west, north, east),
    [south, west, north, east],
  );

  const squares = useMemo(() => {
    if (zoom < 5) return [] as MaidenheadSquare[];
    return squaresInBounds(south, west, north, east).slice(0, 400);
  }, [south, west, north, east, zoom]);

  return (
    <Pane name="maidenhead-grid" style={{ zIndex: 350 }}>
      {fields.map((f) => (
        <FieldCell key={f.code} field={f} showLabel={zoom < 7} />
      ))}
      {squares.map((sq) => (
        <SquareCell key={sq.code} square={sq} showLabel={zoom >= 5 && zoom < 10} />
      ))}
    </Pane>
  );
}

function FieldCell({ field, showLabel }: { field: MaidenheadField; showLabel: boolean }) {
  const center = centerOf(field);
  return (
    <>
      <Rectangle
        bounds={[
          [field.south, field.west],
          [field.north, field.east],
        ]}
        pathOptions={{
          color: "#111827",
          weight: 2.5,
          fill: false,
          opacity: 0.85,
          interactive: false,
        }}
      />
      {showLabel && (
        <Marker
          position={[center.lat, center.lng]}
          icon={labelIcon(field.code, "field")}
          interactive={false}
          keyboard={false}
        />
      )}
    </>
  );
}

function SquareCell({
  square,
  showLabel,
}: {
  square: MaidenheadSquare;
  showLabel: boolean;
}) {
  const center = centerOf(square);
  const digits = square.code.slice(2);
  return (
    <>
      <Rectangle
        bounds={[
          [square.south, square.west],
          [square.north, square.east],
        ]}
        pathOptions={{
          color: "#1f2937",
          weight: 0.8,
          fill: false,
          opacity: 0.55,
          interactive: false,
        }}
      />
      {showLabel && (
        <Marker
          position={[center.lat, center.lng]}
          icon={labelIcon(digits, "square")}
          interactive={false}
          keyboard={false}
        />
      )}
    </>
  );
}
