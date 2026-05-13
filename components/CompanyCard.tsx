import type { CompanyRecord } from "@/types";

interface CompanyCardProps {
  company: CompanyRecord;
  onSave?: () => void;
}

export function CompanyCard({ company, onSave }: CompanyCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{company.businessName}</h2>
      <div className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
        <p>
          <span className="font-medium text-zinc-900">IČO:</span> {company.ico}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Právní forma:</span> {company.legalForm ?? "neuvedeno"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Datum vzniku:</span> {company.establishedAt ?? "neuvedeno"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Stav subjektu:</span> {company.subjectStatus ?? "neuvedeno"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">DIČ:</span> {company.dic ?? "neuvedeno"}
        </p>
        <p>
          <span className="font-medium text-zinc-900">Sídlo:</span> {company.address.fullText}
        </p>
      </div>
      <p className="mt-3 text-xs text-zinc-500">Zdroj dat: {company.source}</p>
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          className="mt-4 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Uložit firmu
        </button>
      ) : null}
    </article>
  );
}
