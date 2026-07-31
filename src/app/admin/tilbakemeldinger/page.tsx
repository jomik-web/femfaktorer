"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Betatilbakemeldinger i panelet (v2.46, 31.07.2026) -- erstatter å måtte
 * logge inn i Google Forms for å lese dem.
 *
 * Sortert nyeste først, med versjonsnummer godt synlig på hver post. Uten
 * versjonen er en gammel klage umulig å tolke: gjelder den noe som allerede
 * er rettet, eller står den fortsatt?
 */

interface FeedbackEntry {
  submittedAt: string;
  rating: number | null;
  message: string;
  area: string;
  appVersion: string;
  device: string;
  durationSeconds: number | null;
}

const AREA_LABELS: Record<string, string> = {
  testen: "Selve testen",
  resultatet: "Resultatet",
  spir: "Spir",
  spraket: "Språket",
  teknisk: "Noe teknisk",
  annet: "Annet",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminFeedbackPage() {
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string>("alle");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/feedback");
        if (!res.ok) {
          setError("Klarte ikke hente tilbakemeldingene.");
          return;
        }
        const data = await res.json();
        setEntries(data.entries ?? []);
      } catch {
        setError("Klarte ikke hente tilbakemeldingene.");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    return areaFilter === "alle" ? entries : entries.filter((e) => e.area === areaFilter);
  }, [entries, areaFilter]);

  const averageRating = useMemo(() => {
    if (!entries) return null;
    const rated = entries.filter((e) => e.rating !== null);
    if (rated.length === 0) return null;
    return (rated.reduce((sum, e) => sum + (e.rating ?? 0), 0) / rated.length).toFixed(1);
  }, [entries]);

  return (
    <AdminShell>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!entries && !error && (
        <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Henter …</p>
      )}

      {entries && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {["alle", ...Object.keys(AREA_LABELS)].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAreaFilter(key)}
                  className={
                    areaFilter === key
                      ? "rounded-full bg-holo-sky px-3 py-1 text-xs font-medium text-indigo"
                      : "rounded-full border border-lavender-400 px-3 py-1 text-xs text-indigo/60 dark:border-white/15 dark:text-lavender-400/60"
                  }
                >
                  {key === "alle" ? "Alle" : AREA_LABELS[key]}
                </button>
              ))}
            </div>
            {averageRating && (
              <span className="text-xs text-indigo/50 dark:text-lavender-400/50">
                Snittvurdering {averageRating} av 5
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-lavender-400 p-8 text-center text-sm text-indigo/50 dark:border-white/15 dark:text-lavender-400/50">
              {entries.length === 0
                ? "Ingen tilbakemeldinger ennå. De dukker opp her så snart noen sender inn fra resultatsiden."
                : "Ingen tilbakemeldinger i denne kategorien."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {filtered.map((entry, i) => (
                <li
                  key={`${entry.submittedAt}-${i}`}
                  className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-4 dark:border-white/10"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-holo-sky/30 px-2 py-0.5 font-medium text-indigo dark:text-white">
                      {AREA_LABELS[entry.area] ?? entry.area}
                    </span>
                    {entry.rating !== null && (
                      <span className="text-indigo/60 dark:text-lavender-400/60">
                        {entry.rating}/5
                      </span>
                    )}
                    <span className="text-indigo/45 dark:text-lavender-400/45">
                      v{entry.appVersion} · {entry.device}
                      {entry.durationSeconds !== null &&
                        ` · ${Math.round(entry.durationSeconds / 60)} min på testen`}
                    </span>
                    <span className="ml-auto text-indigo/40 dark:text-lavender-400/40">
                      {formatDate(entry.submittedAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-indigo/85 dark:text-lavender-400/85">
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AdminShell>
  );
}
