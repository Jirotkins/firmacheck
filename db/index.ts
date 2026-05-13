/**
 * DB vrstva je oddělena do samostatného modulu, aby bylo možné
 * snadno přepnout mezi browser SQLite a server/cloud variantou.
 */
export const DB_TABLES = {
  companiesCache: "companies_cache",
  geocodingCache: "geocoding_cache",
  savedCompanies: "saved_companies",
} as const;
