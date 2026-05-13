"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanyCard } from "@/components/CompanyCard";
import { MapWidget } from "@/components/MapWidget";
import { SavedList } from "@/components/SavedList";
import { buildSavedCompaniesCsv } from "@/lib/exportUtils";
import type { CompanyRecord, NameMatchResult } from "@/types";

function getNameMatchLabel(value: NameMatchResult | null) {
  if (value === "exact") return "Shoda názvu";
  if (value === "partial") return "Částečná shoda názvu";
  if (value === "mismatch") return "Neshoda názvu";
  return null;
}

export default function Home() {
  const [ico, setIco] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState("Zadej IČO a klikni na Ověřit firmu.");
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [nameMatch, setNameMatch] = useState<NameMatchResult | null>(null);
  const [dataSources, setDataSources] = useState<{ ares: string; geocoding: string } | null>(null);
  const [savedCompanies, setSavedCompanies] = useState<CompanyRecord[]>([]);
  const [heroSrc, setHeroSrc] = useState("/ai-hero.png");

  const mapLink = useMemo(() => {
    if (!company?.coordinates) return undefined;
    const { lat, lng } = company.coordinates;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  }, [company]);

  async function loadSavedCompanies() {
    const response = await fetch("/api/saved");
    if (!response.ok) return;
    const payload = (await response.json()) as { companies: CompanyRecord[] };
    setSavedCompanies(payload.companies);
  }

  useEffect(() => {
    void loadSavedCompanies();
  }, []);

  async function verifyCompany() {
    setIsLoading(true);
    setStatus("Probíhá ověření firmy...");
    setCompany(null);
    setNameMatch(null);
    setDataSources(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ico, companyName }),
      });
      const payload = (await response.json()) as {
        status: string;
        company?: CompanyRecord;
        nameMatch?: NameMatchResult | null;
        dataSources?: { ares: string; geocoding: string };
      };

      if (!response.ok) {
        if (payload.status === "invalid_ico") {
          setStatus("IČO musí mít přesně 8 číslic.");
          return;
        }
        if (payload.status === "not_found") {
          setStatus("Firma nebyla nalezena.");
          return;
        }
        setStatus("Chyba při načítání dat.");
        return;
      }

      const verified = payload.company ?? null;
      setCompany(verified);
      setNameMatch(payload.nameMatch ?? null);
      setDataSources(payload.dataSources ?? null);

      if (verified && savedCompanies.some((c) => c.ico === verified.ico)) {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: verified }),
        });
        await loadSavedCompanies();
        setStatus("Firma nalezena. U uložené firmy byl aktualizován datum posledního ověření.");
      } else {
        setStatus("Firma nalezena.");
      }
    } catch {
      setStatus("Chyba při načítání dat.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveCurrentCompany() {
    if (!company) return;
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company }),
    });
    setStatus("Firma byla uložena.");
    await loadSavedCompanies();
  }

  async function deleteSavedCompany(selectedIco: string) {
    await fetch(`/api/saved/${selectedIco}`, { method: "DELETE" });
    await loadSavedCompanies();
  }

  function selectSavedCompany(selectedIco: string) {
    const found = savedCompanies.find((item) => item.ico === selectedIco);
    if (!found) return;
    setCompany(found);
    setStatus("Zobrazen detail uložené firmy.");
  }

  function exportCsv() {
    if (savedCompanies.length === 0) {
      setStatus("Seznam uložených firem je prázdný.");
      return;
    }
    const csv = buildSavedCompaniesCsv(savedCompanies);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "firmacheck_saved_companies.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">FirmaCheck</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Ověření firmy podle IČO přes ARES API. Jednoduché, rychlé a s přehledným výstupem.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <img
              src={heroSrc}
              alt="AI vizuál pro aplikaci FirmaCheck"
              className="h-48 w-full object-cover md:h-52"
              onError={() => setHeroSrc("/ai-hero-placeholder.svg")}
            />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            value={ico}
            onChange={(event) => setIco(event.target.value)}
            placeholder="IČO (povinné)"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Název firmy (volitelné)"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={verifyCompany}
          className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Ověřuji..." : "Ověřit firmu"}
        </button>
        <p className="mt-4 text-sm font-medium text-zinc-800">{status}</p>
        {dataSources ? (
          <p className="text-xs text-zinc-500">
            ARES data: {dataSources.ares} | Geokódování: {dataSources.geocoding}
          </p>
        ) : null}
        {getNameMatchLabel(nameMatch) ? <p className="mt-1 text-sm text-zinc-700">{getNameMatchLabel(nameMatch)}</p> : null}
      </section>

      {company ? (
        <section className="grid gap-4 md:grid-cols-2">
          <CompanyCard company={company} onSave={saveCurrentCompany} />
          <MapWidget lat={company.coordinates?.lat} lng={company.coordinates?.lng} mapLink={mapLink} />
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Uložené firmy</h2>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
          >
            Export CSV
          </button>
        </div>
        <SavedList companies={savedCompanies} onSelect={selectSavedCompany} onDelete={deleteSavedCompany} />
      </section>
    </main>
  );
}
