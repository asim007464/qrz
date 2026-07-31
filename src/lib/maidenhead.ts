/** Maidenhead Locator helpers and viewport grid generation. */

export type MaidenheadField = {
  code: string;
  south: number;
  west: number;
  north: number;
  east: number;
};

export type MaidenheadSquare = MaidenheadField & {
  field: string;
};

const FIELD_LON = "ABCDEFGHIJKLMNOPQR";
const FIELD_LAT = "ABCDEFGHIJKLMNOPQR";
const SUB_LON = "abcdefghijklmnopqrstuvwx";
const SUB_LAT = "abcdefghijklmnopqrstuvwx";

export function latLngToMaidenhead(lat: number, lng: number, precision = 6): string {
  const lon = Math.min(179.999999, Math.max(-180, lng));
  const la = Math.min(89.999999, Math.max(-90, lat));

  let lonAdj = lon + 180;
  let latAdj = la + 90;

  const fieldLon = Math.floor(lonAdj / 20);
  const fieldLat = Math.floor(latAdj / 10);
  lonAdj -= fieldLon * 20;
  latAdj -= fieldLat * 10;

  const squareLon = Math.floor(lonAdj / 2);
  const squareLat = Math.floor(latAdj / 1);
  lonAdj -= squareLon * 2;
  latAdj -= squareLat * 1;

  const subLon = Math.floor(lonAdj * 12);
  const subLat = Math.floor(latAdj * 24);

  let out = FIELD_LON[fieldLon] + FIELD_LAT[fieldLat];
  if (precision >= 4) out += String(squareLon) + String(squareLat);
  if (precision >= 6) out += SUB_LON[Math.min(23, subLon)] + SUB_LAT[Math.min(23, subLat)];
  return out;
}

export function fieldsInBounds(
  south: number,
  west: number,
  north: number,
  east: number,
): MaidenheadField[] {
  const fields: MaidenheadField[] = [];
  const lonStart = Math.max(0, Math.floor((west + 180) / 20));
  const lonEnd = Math.min(17, Math.floor((east + 180) / 20));
  const latStart = Math.max(0, Math.floor((south + 90) / 10));
  const latEnd = Math.min(17, Math.floor((north + 90) / 10));

  for (let i = lonStart; i <= lonEnd; i++) {
    for (let j = latStart; j <= latEnd; j++) {
      const w = i * 20 - 180;
      const s = j * 10 - 90;
      fields.push({
        code: FIELD_LON[i] + FIELD_LAT[j],
        west: w,
        south: s,
        east: w + 20,
        north: s + 10,
      });
    }
  }
  return fields;
}

export function squaresInBounds(
  south: number,
  west: number,
  north: number,
  east: number,
): MaidenheadSquare[] {
  const squares: MaidenheadSquare[] = [];
  const fields = fieldsInBounds(south, west, north, east);

  for (const field of fields) {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const w = field.west + x * 2;
        const s = field.south + y * 1;
        const e = w + 2;
        const n = s + 1;
        if (e < west || w > east || n < south || s > north) continue;
        squares.push({
          field: field.code,
          code: `${field.code}${x}${y}`,
          west: w,
          south: s,
          east: e,
          north: n,
        });
      }
    }
  }
  return squares;
}

export function subsquaresInBounds(
  south: number,
  west: number,
  north: number,
  east: number,
): MaidenheadSquare[] {
  const out: MaidenheadSquare[] = [];
  const squares = squaresInBounds(south, west, north, east);
  for (const sq of squares) {
    for (let x = 0; x < 24; x++) {
      for (let y = 0; y < 24; y++) {
        const w = sq.west + x / 12;
        const s = sq.south + y / 24;
        const e = w + 1 / 12;
        const n = s + 1 / 24;
        if (e < west || w > east || n < south || s > north) continue;
        out.push({
          field: sq.field,
          code: `${sq.code}${SUB_LON[x]}${SUB_LAT[y]}`,
          west: w,
          south: s,
          east: e,
          north: n,
        });
      }
    }
  }
  return out;
}
