import type { CompanyAddress, CompanyRecord, NameMatchResult } from "@/types";

interface AresAddress {
  nazevUlice?: string;
  cisloDomovni?: string;
  cisloOrientacni?: string;
  nazevObce?: string;
  psc?: string;
}

interface AresBody {
  ico: string;
  obchodniJmeno: string;
  pravniForma?: string;
  datumVzniku?: string;
  stavSubjektu?: string;
  dic?: string;
  sidlo?: AresAddress;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[\s.,/#!$%^&*;:{}=\-_`~()]/g, "");
}

export function compareCompanyName(input: string, aresName: string): NameMatchResult {
  const left = normalizeName(input);
  const right = normalizeName(aresName);

  if (!left || !right) return "mismatch";
  if (left === right) return "exact";
  if (right.includes(left) || left.includes(right)) return "partial";
  return "mismatch";
}

export function validateIco(ico: string): boolean {
  return /^\d{8}$/.test(ico);
}

function formatAddress(address?: AresAddress): CompanyAddress {
  const streetParts = [address?.nazevUlice, address?.cisloDomovni, address?.cisloOrientacni]
    .filter(Boolean)
    .join(" ");
  const fullText = [streetParts, address?.nazevObce, address?.psc, "CZ"].filter(Boolean).join(", ");
  return {
    street: streetParts || undefined,
    city: address?.nazevObce,
    zip: address?.psc,
    country: "CZ",
    fullText: fullText || "Adresa nedostupna",
  };
}

export async function fetchCompanyFromAres(ico: string): Promise<CompanyRecord | null> {
  const response = await fetch(
    `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`ARES request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AresBody;
  return {
    ico: payload.ico,
    businessName: payload.obchodniJmeno,
    legalForm: payload.pravniForma,
    establishedAt: payload.datumVzniku,
    subjectStatus: payload.stavSubjektu,
    dic: payload.dic,
    address: formatAddress(payload.sidlo),
    fetchedAt: new Date().toISOString(),
    source: "api",
  };
}
