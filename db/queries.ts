import { DB_TABLES } from "@/db";

export const createCompaniesCacheTableQuery = `
CREATE TABLE IF NOT EXISTS ${DB_TABLES.companiesCache} (
  ico TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  cached_at TEXT NOT NULL
);
`;

export const createGeocodingCacheTableQuery = `
CREATE TABLE IF NOT EXISTS ${DB_TABLES.geocodingCache} (
  address TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  cached_at TEXT NOT NULL
);
`;

export const createSavedCompaniesTableQuery = `
CREATE TABLE IF NOT EXISTS ${DB_TABLES.savedCompanies} (
  ico TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL
);
`;
