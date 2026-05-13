import type { GeocodingRecord } from "@/types";

interface NominatimResult {
  lat: string;
  lon: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingRecord | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "FirmaCheck/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];
  if (!first) return null;

  return {
    address,
    lat: Number(first.lat),
    lng: Number(first.lon),
    source: "api",
  };
}

export function buildOpenStreetMapLink(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}
