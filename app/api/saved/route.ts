import { NextResponse } from "next/server";
import { DB_TABLES } from "@/db";
import { getDb } from "@/lib/sqlite";
import type { CompanyRecord } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const result = await db.execute(`SELECT payload FROM ${DB_TABLES.savedCompanies} ORDER BY saved_at DESC`);
  const rows = result.rows as { payload: string }[];
  const companies = rows.map((row) => JSON.parse(row.payload) as CompanyRecord);
  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { company?: CompanyRecord };
  if (!body.company) {
    return NextResponse.json({ status: "invalid_payload" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO ${DB_TABLES.savedCompanies}(ico, payload, saved_at, last_verified_at)
          VALUES(?, ?, ?, ?)
          ON CONFLICT(ico) DO UPDATE SET payload = excluded.payload, last_verified_at = excluded.last_verified_at`,
    args: [
      body.company.ico,
      JSON.stringify(body.company),
      new Date().toISOString(),
      body.company.fetchedAt,
    ],
  });

  return NextResponse.json({ status: "saved" });
}
