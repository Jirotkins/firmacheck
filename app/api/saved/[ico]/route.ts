import { NextResponse } from "next/server";
import { DB_TABLES } from "@/db";
import { getDb } from "@/lib/sqlite";

export const runtime = "nodejs";

export async function DELETE(_: Request, context: { params: Promise<{ ico: string }> }) {
  const { ico } = await context.params;
  const db = await getDb();
  await db.execute({
    sql: `DELETE FROM ${DB_TABLES.savedCompanies} WHERE ico = ?`,
    args: [ico],
  });
  return NextResponse.json({ status: "deleted" });
}
