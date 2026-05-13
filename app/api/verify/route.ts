import { NextResponse } from "next/server";
import { DB_TABLES } from "@/db";
import { fetchCompanyFromAres, compareCompanyName, validateIco } from "@/lib/company";
import { geocodeAddress } from "@/lib/geocoding";
import { getDb } from "@/lib/sqlite";

export const runtime = "nodejs";

interface VerifyBody {
  ico?: string;
  companyName?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyBody;
  const ico = body.ico?.trim() ?? "";
  const inputName = body.companyName?.trim();

  if (!validateIco(ico)) {
    return NextResponse.json({ status: "invalid_ico" }, { status: 400 });
  }

  const db = await getDb();
  const cachedCompanyResult = await db.execute({
    sql: `SELECT payload FROM ${DB_TABLES.companiesCache} WHERE ico = ?`,
    args: [ico],
  });
  const cachedCompany = cachedCompanyResult.rows[0] as { payload: string } | undefined;

  let company = cachedCompany ? (JSON.parse(cachedCompany.payload) as ReturnType<typeof JSON.parse>) : null;
  let companySource: "api" | "cache" = cachedCompany ? "cache" : "api";

  if (!company) {
    const freshCompany = await fetchCompanyFromAres(ico);
    if (!freshCompany) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }
    await db.execute({
      sql: `INSERT INTO ${DB_TABLES.companiesCache}(ico, payload, cached_at)
            VALUES(?, ?, ?)
            ON CONFLICT(ico) DO UPDATE SET payload = excluded.payload, cached_at = excluded.cached_at`,
      args: [ico, JSON.stringify(freshCompany), new Date().toISOString()],
    });
    company = freshCompany;
  }

  const address = company.address.fullText;
  const cachedGeoResult = await db.execute({
    sql: `SELECT lat, lng FROM ${DB_TABLES.geocodingCache} WHERE address = ?`,
    args: [address],
  });
  const cachedGeo = cachedGeoResult.rows[0] as { lat: number; lng: number } | undefined;
  let geocodingSource: "api" | "cache" = cachedGeo ? "cache" : "api";

  if (cachedGeo) {
    company.coordinates = { lat: cachedGeo.lat, lng: cachedGeo.lng };
  } else {
    const freshGeo = await geocodeAddress(address);
    if (freshGeo) {
      company.coordinates = { lat: freshGeo.lat, lng: freshGeo.lng };
      await db.execute({
        sql: `INSERT INTO ${DB_TABLES.geocodingCache}(address, lat, lng, cached_at)
              VALUES(?, ?, ?, ?)
              ON CONFLICT(address) DO UPDATE SET lat = excluded.lat, lng = excluded.lng, cached_at = excluded.cached_at`,
        args: [address, freshGeo.lat, freshGeo.lng, new Date().toISOString()],
      });
    } else {
      geocodingSource = "api";
    }
  }

  company.source = companySource;
  company.fetchedAt = new Date().toISOString();

  const nameMatch = inputName ? compareCompanyName(inputName, company.businessName) : null;

  return NextResponse.json({
    status: "found",
    company,
    nameMatch,
    dataSources: {
      ares: companySource,
      geocoding: geocodingSource,
    },
  });
}
