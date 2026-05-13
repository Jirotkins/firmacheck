export type DataSource = "api" | "cache";

export interface CompanyAddress {
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  fullText: string;
}

export interface CompanyRecord {
  ico: string;
  businessName: string;
  legalForm?: string;
  establishedAt?: string;
  subjectStatus?: string;
  dic?: string;
  address: CompanyAddress;
  coordinates?: {
    lat: number;
    lng: number;
  };
  fetchedAt: string;
  source: DataSource;
}

export interface GeocodingRecord {
  address: string;
  lat: number;
  lng: number;
  source: DataSource;
}

export type NameMatchResult = "exact" | "partial" | "mismatch";
