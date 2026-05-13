interface MapWidgetProps {
  lat?: number;
  lng?: number;
  mapLink?: string;
}

export function MapWidget({ lat, lng, mapLink }: MapWidgetProps) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
        Souřadnice sídla zatím nejsou dostupné.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-800">
        Souřadnice: {lat}, {lng}
      </p>
      <iframe
        title="Mapa sídla firmy"
        className="mt-3 h-64 w-full rounded-lg border border-zinc-200"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
      />
      {mapLink ? (
        <a className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline" href={mapLink} target="_blank" rel="noreferrer">
          Otevřít adresu v mapě
        </a>
      ) : null}
    </section>
  );
}
