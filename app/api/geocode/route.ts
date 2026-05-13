import { NextResponse } from "next/server";
import { DB_TABLES } from "@/db";
import { geocodeAddress, buildOpenStreetMapLink } from "@/lib/geocoding";
import { getDb } from "@/lib/sqlite";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { address?: string };
  const address = body.address?.trim();

  if (!address) {
    return NextResponse.json({ status: "invalid_address" }, { status: 400 });
  }

  const db = await getDb();
  const cachedResult = await db.execute({
    sql: `SELECT lat, lng FROM ${DB_TABLES.geocodingCache} WHERE address = ?`,
    args: [address],
  });
  const cached = cachedResult.rows[0] as { lat: number; lng: number } | undefined;

  if (cached) {
    return NextResponse.json({
      status: "ok",
      source: "cache",
      lat: cached.lat,
      lng: cached.lng,
      mapLink: buildOpenStreetMapLink(cached.lat, cached.lng),
    });
  }

  const geo = await geocodeAddress(address);
  if (!geo) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  await db.execute({
    sql: `INSERT INTO ${DB_TABLES.geocodingCache}(address, lat, lng, cached_at)
          VALUES(?, ?, ?, ?)`,
    args: [address, geo.lat, geo.lng, new Date().toISOString()],
  });

  return NextResponse.json({
    status: "ok",
    source: "api",
    lat: geo.lat,
    lng: geo.lng,
    mapLink: buildOpenStreetMapLink(geo.lat, geo.lng),
  });
}
