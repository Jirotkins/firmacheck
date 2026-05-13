import type { CompanyRecord } from "@/types";

interface SavedListProps {
  companies: CompanyRecord[];
  onSelect: (ico: string) => void;
  onDelete: (ico: string) => void;
}

export function SavedList({ companies, onSelect, onDelete }: SavedListProps) {
  function formatVerificationDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("cs-CZ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  if (companies.length === 0) {
    return <p className="text-sm text-zinc-600">Zatím nemáš uložené žádné firmy.</p>;
  }

  return (
    <ul className="space-y-3">
      {companies.map((company) => (
        <li key={company.ico} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <button type="button" onClick={() => onSelect(company.ico)} className="w-full text-left">
            <p className="font-medium text-zinc-900">{company.businessName}</p>
            <p className="text-sm text-zinc-700">IČO: {company.ico}</p>
            <p className="text-xs text-zinc-500">{company.address.fullText}</p>
            <p className="text-xs text-zinc-500">
              Datum posledního ověření: {formatVerificationDate(company.fetchedAt)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onDelete(company.ico)}
            className="mt-2 text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
          >
            Odebrat
          </button>
        </li>
      ))}
    </ul>
  );
}
