"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { filterChipClassNames } from "@/components/ui/Badge";

/**
 * Betatilbakemeldinger i panelet (v2.46, 31.07.2026) -- erstatter å måtte
 * logge inn i Google Forms for å lese dem.
 *
 * Sortert nyeste først, med versjonsnummer godt synlig på hver post. Uten
 * versjonen er en gammel klage umulig å tolke: gjelder den noe som allerede
 * er rettet, eller står den fortsatt?
 */

type RatedArea = "testen" | "resultatet" | "spir";

interface FeedbackEntry {
  submittedAt: string;
  /** v2.51: én karakter per område. `null` = ikke besvart, ALDRI "dårlig". */
  ratings: Record<RatedArea, number | null>;
  message: string;
  appVersion: string;
  device: string;
  durationSeconds: number | null;
}

const AREA_LABELS: Record<RatedArea, string> = {
  testen: "Testen",
  resultatet: "Teksten om deg",
  spir: "Spir",
};

const RATED_AREAS = Object.keys(AREA_LABELS) as RatedArea[];

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

  // Filteret betyr nå "poster som har en karakter på dette området", siden
  // hver post kan dekke flere områder.
  const filtered = useMemo(() => {
    if (!entries) return [];
    if (areaFilter === "alle") return entries;
    if (areaFilter === "medtekst") return entries.filter((e) => e.message.trim().length > 0);
    return entries.filter((e) => e.ratings?.[areaFilter as RatedArea] !== null);
  }, [entries, areaFilter]);

  /**
   * Ett snitt PER OMRÅDE. Ubesvarte (null) holdes utenfor -- teller man dem
   * som 0, ser Spir kunstig dårlig ut bare fordi mange ikke brukte den.
   */
  const averages = useMemo(() => {
    if (!entries) return null;
    return RATED_AREAS.map((area) => {
      const values = entries
        .map((e) => e.ratings?.[area])
        .filter((v): v is number => typeof v === "number");
      return {
        area,
        average: values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null,
        count: values.length,
      };
    });
  }, [entries]);

  return (
    <AdminShell>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!entries && !error && (
        <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Henter …</p>
      )}

      {entries && (
        <>
          {averages && (
            <div className="grid gap-3 sm:grid-cols-3">
              {averages.map(({ area, average, count }) => (
                <div
                  key={area}
                  className="flex flex-col gap-0.5 rounded-xl border border-lavender-400 p-4 dark:border-white/10"
                >
                  <span className="text-xs text-indigo/60 dark:text-lavender-400/60">
                    {AREA_LABELS[area]}
                  </span>
                  <span className="font-display text-2xl font-semibold text-indigo dark:text-white">
                    {average ?? "–"}
                    {average && (
                      <span className="text-sm font-normal text-indigo/50 dark:text-lavender-400/50">
                        {" "}
                        av 5
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-indigo/45 dark:text-lavender-400/45">
                    {count === 0 ? "ingen svar ennå" : `${count} svar`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {["alle", ...RATED_AREAS, "medtekst"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAreaFilter(key)}
                className={filterChipClassNames(areaFilter === key)}
              >
                {key === "alle"
                  ? "Alle"
                  : key === "medtekst"
                    ? "Med tekst"
                    : AREA_LABELS[key as RatedArea]}
              </button>
            ))}
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
                    {RATED_AREAS.map((area) => {
                      const value = entry.ratings?.[area];
                      return (
                        <span
                          key={area}
                          className={
                            typeof value === "number"
                              ? "rounded-full bg-holo-sky/30 px-2 py-0.5 font-medium text-indigo dark:text-white"
                              : "rounded-full border border-lavender-400 px-2 py-0.5 text-indigo/40 dark:border-white/15 dark:text-lavender-400/40"
                          }
                        >
                          {AREA_LABELS[area]} {typeof value === "number" ? `${value}/5` : "–"}
                        </span>
                      );
                    })}
                    <span className="text-indigo/45 dark:text-lavender-400/45">
                      v{entry.appVersion} · {entry.device}
                      {entry.durationSeconds !== null &&
                        ` · ${Math.round(entry.durationSeconds / 60)} min på testen`}
                    </span>
                    <span className="ml-auto text-indigo/40 dark:text-lavender-400/40">
                      {formatDate(entry.submittedAt)}
                    </span>
                  </div>
                  {entry.message.trim().length > 0 ? (
                    <p className="whitespace-pre-wrap text-sm text-indigo/85 dark:text-lavender-400/85">
                      {entry.message}
                    </p>
                  ) : (
                    <p className="text-sm italic text-indigo/40 dark:text-lavender-400/40">
                      Ingen fritekst -- bare karakterer.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AdminShell>
  );
}
