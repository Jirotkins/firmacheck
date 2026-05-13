import { createClient, type Client } from "@libsql/client";
import {
  createCompaniesCacheTableQuery,
  createGeocodingCacheTableQuery,
  createSavedCompaniesTableQuery,
} from "@/db/queries";

let database: Client | null = null;
let initialized = false;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export async function getDb() {
  if (!database) {
    database = createClient({
      url: getEnv("TURSO_DATABASE_URL"),
      authToken: getEnv("TURSO_AUTH_TOKEN"),
    });
  }

  if (!initialized) {
    await database.execute(createCompaniesCacheTableQuery);
    await database.execute(createGeocodingCacheTableQuery);
    await database.execute(createSavedCompaniesTableQuery);
    initialized = true;
  }

  return database;
}
