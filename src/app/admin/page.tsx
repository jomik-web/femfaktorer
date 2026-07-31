"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Adminpanelets forside (v2.46, 31.07.2026).
 *
 * UTFORMINGEN FØLGER TO REGLER FRA DASHBOARD-FORSKNINGEN:
 *
 *  1. Få tall, øverst. Brukere skanner i et F-mønster og bruker mesteparten
 *     av oppmerksomheten øverst til venstre. Derfor ligger de fem viktigste
 *     tallene i én rad på toppen, og alt annet under.
 *  2. Trakten som liste, ikke som kake- eller søylediagram. Poenget med en
 *     trakt er å se HVOR folk faller av -- da er avstanden mellom to tall det
 *     interessante, og en enkel, sammenlignbar rad leser man raskere enn en
 *     graf.
 *
 * Alt her er anonyme aggregater, ingen persondata. Se
 * api/admin/overview/route.ts for hvorfor det er et bevisst valg.
 */

interface Overview {
  days: number;
  appVersion: string;
  questionSet: { version: string; revision: number };
  funnel: {
    started: number;
    reached50: number;
    reached120: number;
    completedFree: number;
    completedFull: number;
    completedExtended: number;
    resultViewed: number;
    spirOpened: number;
    feedbackSubmitted: number;
  };
  completionRate: number | null;
  medianMinutes: { full: number | null; extended: number | null };
  consent: { consented: number; declined: number };
  totals: {
    researchAnswerSets: number;
    normSubmissionsFull: number;
    normSubmissionsExtended: number;
    aiCallsUsed: number;
    aiGlobalCap: number;
  };
  series: Array<{ day: string; started: number; completed: number }>;
}

const RANGES = [
  { days: 7, label: "7 dager" },
  { days: 30, label: "30 dager" },
  { days: 90, label: "90 dager" },
] as const;

function KeyNumber({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-lavender-400 p-4 dark:border-white/10">
      <span className="font-display text-2xl font-semibold text-indigo dark:text-white">{value}</span>
      <span className="text-xs font-medium text-indigo/70 dark:text-lavender-400/70">{label}</span>
      {hint && <span className="text-[11px] text-indigo/45 dark:text-lavender-400/45">{hint}</span>}
    </div>
  );
}

/** Én rad i trakten, med andel av utgangspunktet vist som stolpe. */
function FunnelRow({ label, value, base }: { label: string; value: number; base: number }) {
  const share = base > 0 ? Math.round((value / base) * 100) : null;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-52 shrink-0 text-sm text-indigo/80 dark:text-lavender-400/80">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-lavender-400/40 dark:bg-white/10">
        <div className="h-full rounded-full bg-holo-sky" style={{ width: `${share ?? 0}%` }} aria-hidden />
      </div>
      <span className="w-24 shrink-0 text-right text-sm tabular-nums text-indigo dark:text-white">
        {value}
        {share !== null && (
          <span className="ml-1.5 text-xs text-indigo/45 dark:text-lavender-400/45">{share}%</span>
        )}
      </span>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (range: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/overview?days=${range}`);
      if (!res.ok) {
        setError("Klarte ikke hente tallene.");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Klarte ikke hente tallene.");
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  const consentTotal = data ? data.consent.consented + data.consent.declined : 0;

  return (
    <AdminShell>
      <div className="flex items-center gap-2">
        {RANGES.map((range) => (
          <button
            key={range.days}
            type="button"
            onClick={() => setDays(range.days)}
            className={
              days === range.days
                ? "rounded-full bg-holo-sky px-3 py-1 text-xs font-medium text-indigo"
                : "rounded-full border border-lavender-400 px-3 py-1 text-xs text-indigo/60 dark:border-white/15 dark:text-lavender-400/60"
            }
          >
            {range.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!data && !error && (
        <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Henter tall …</p>
      )}

      {data && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <KeyNumber
              value={String(data.funnel.started)}
              label="Startet testen"
              hint={`siste ${data.days} dager`}
            />
            <KeyNumber
              value={String(
                data.funnel.completedFree + data.funnel.completedFull + data.funnel.completedExtended
              )}
              label="Fullførte"
              hint={data.completionRate !== null ? `${data.completionRate} % av dem som startet` : "—"}
            />
            <KeyNumber
              value={
                data.medianMinutes.extended !== null
                  ? `${data.medianMinutes.extended} min`
                  : data.medianMinutes.full !== null
                    ? `${data.medianMinutes.full} min`
                    : "—"
              }
              label="Median tidsbruk"
              hint={data.medianMinutes.extended !== null ? "Utvidet (290)" : "Full (120)"}
            />
            <KeyNumber
              value={String(data.totals.researchAnswerSets)}
              label="Svarsett samlet"
              hint="til leddanalyse, totalt"
            />
            <KeyNumber
              value={`${data.totals.aiCallsUsed} / ${data.totals.aiGlobalCap}`}
              label="AI-kall brukt"
              hint="av globalt tak"
            />
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
            <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
              Hvor faller folk av?
            </h2>
            <p className="mb-2 text-xs text-indigo/50 dark:text-lavender-400/50">
              Prosenten er andel av dem som startet testen i perioden. Tallene er anonyme tellere --
              vi kan se at 100 startet og 60 fullførte, men ikke hvem av de 100 som var blant de 60.
            </p>
            <FunnelRow label="Startet testen" value={data.funnel.started} base={data.funnel.started} />
            <FunnelRow label="Nådde spørsmål 50" value={data.funnel.reached50} base={data.funnel.started} />
            <FunnelRow label="Nådde spørsmål 120" value={data.funnel.reached120} base={data.funnel.started} />
            <FunnelRow
              label="Fullførte Utvidet (290)"
              value={data.funnel.completedExtended}
              base={data.funnel.started}
            />
            <FunnelRow label="Leste resultatet" value={data.funnel.resultViewed} base={data.funnel.started} />
            <FunnelRow label="Åpnet Spir" value={data.funnel.spirOpened} base={data.funnel.started} />
            <FunnelRow
              label="Ga tilbakemelding"
              value={data.funnel.feedbackSubmitted}
              base={data.funnel.started}
            />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
              <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
                Samtykke til anonym forskningsdata
              </h2>
              {consentTotal === 0 ? (
                <p className="text-sm text-indigo/50 dark:text-lavender-400/50">
                  Ingen har vært innom veiledningsskjermen i perioden.
                </p>
              ) : (
                <p className="text-sm text-indigo/80 dark:text-lavender-400/80">
                  <strong>{Math.round((data.consent.consented / consentTotal) * 100)} %</strong> lot
                  haken stå ({data.consent.consented} av {consentTotal}).
                </p>
              )}
              <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
                Er andelen lav, er det haken som er problemet -- ikke trafikken. Da er det teksten på
                skjermen som må endres, ikke innsamlingen.
              </p>
            </section>

            <section className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
              <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
                Normgrunnlag
              </h2>
              <p className="text-sm text-indigo/80 dark:text-lavender-400/80">
                {data.totals.normSubmissionsFull} fullversjon (120) ·{" "}
                {data.totals.normSubmissionsExtended} utvidet (290)
              </p>
              <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
                Totalt siden tellingen ble slått på. Under ca. 200 per nivå er tallene for ustabile
                til å bygge normer på.
              </p>
            </section>
          </div>

          <section className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
            <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
              Dag for dag
            </h2>
            <div className="flex items-end gap-1 overflow-x-auto pt-2">
              {data.series.map((entry) => {
                const max = Math.max(1, ...data.series.map((e) => e.started));
                return (
                  <div key={entry.day} className="flex min-w-[14px] flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-holo-sky"
                      style={{ height: `${Math.max(2, (entry.started / max) * 80)}px` }}
                      title={`${entry.day}: ${entry.started} startet, ${entry.completed} fullførte`}
                    />
                    <span className="text-[9px] text-indigo/35 dark:text-lavender-400/35">
                      {entry.day.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
              Høyden viser antall som startet testen. Hold musepekeren over en søyle for tall.
            </p>
          </section>

          <p className="text-xs text-indigo/40 dark:text-lavender-400/40">
            Appversjon {data.appVersion} · spørsmålssett {data.questionSet.version}
          </p>
        </>
      )}
    </AdminShell>
  );
}
