import type { CompanyRecord } from "@/types";

const CSV_SEPARATOR = ",";

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(CSV_SEPARATOR) || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildSavedCompaniesCsv(companies: CompanyRecord[]): string {
  const header = [
    "ICO",
    "Business Name",
    "Legal Form",
    "Subject Status",
    "Address",
    "Established At",
    "Last Verified At",
    "Last Data Source",
    "Latitude",
    "Longitude",
  ];

  const rows = companies.map((company) => [
    company.ico,
    company.businessName,
    company.legalForm ?? "",
    company.subjectStatus ?? "",
    company.address.fullText,
    company.establishedAt ?? "",
    company.fetchedAt,
    company.source,
    company.coordinates?.lat?.toString() ?? "",
    company.coordinates?.lng?.toString() ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(CSV_SEPARATOR))
    .join("\n");
}
