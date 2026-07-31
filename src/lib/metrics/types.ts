/**
 * Anonyme bruksteller (v2.45, 31.07.2026) -- grunnlaget for trakten og
 * nøkkeltallene i adminpanelet.
 *
 * HVA DETTE ER, OG HVA DET IKKE ER
 * Dette er RENE TELLERE per dag: "37 personer startet testen 31. juli".
 * Ingen økt-id, ingen bruker-id, ingen IP, ingen kobling mellom to hendelser
 * fra samme person. Vi kan altså se at 100 startet og 60 fullførte, men ikke
 * HVEM av de 100 som var blant de 60. Det er en reell begrensning -- ekte
 * kohortanalyse er umulig -- og den er valgt med vilje: alternativet krever
 * en identifikator per besøkende, og dermed en helt annen personvernprofil
 * enn resten av dette systemet har.
 *
 * HVORFOR FRAFALLSPUNKTER ER VERDT Å MÅLE
 * Trakten (startet -> 50 -> 120 -> 290 -> resultat lest) er det klareste
 * produktsignalet som finnes: den peker rett på hvor testen er for lang
 * eller for kjedelig. Jf. Googles HEART-rammeverk hører dette under
 * "Task Success" -- klarer folk faktisk å komme gjennom det de startet på?
 *
 * KJENT UNØYAKTIGHET
 * Les-endre-skriv, ikke atomisk (samme "beste innsats"-tilnærming som
 * lib/admin/aiUsage.ts og lib/account/otp.ts). To personer som utløser samme
 * hendelse i samme millisekund kan gi én telling i stedet for to. For
 * formålet -- se retninger og størrelsesordener -- er det uten betydning.
 * Disse tallene skal aldri brukes som fasit i noe som krever nøyaktighet.
 */

/**
 * Hendelser vi teller. BEVISST EN LUKKET LISTE, ikke fri tekst: endepunktet
 * som tar imot tellinger er åpent (det må det være -- det kalles fra
 * nettleseren før noen er innlogget), og uten en fast liste kunne hvem som
 * helst fylt lagringen med vilkårlige nøkler.
 */
export const METRIC_EVENTS = [
  /** Brukeren kom inn på /test og fikk se første spørsmål. */
  "test_started",
  /** Nådde sjekkpunktet etter de 50 første spørsmålene. */
  "reached_checkpoint_50",
  /** Nådde sjekkpunktet etter 120 spørsmål. */
  "reached_checkpoint_120",
  /** Valgte å stoppe på gratisnivået og se det foreløpige resultatet. */
  "completed_free",
  /** Fullførte 120 spørsmål og gikk til resultatet. */
  "completed_full",
  /** Fullførte alle 290 spørsmålene. */
  "completed_extended",
  /** Resultatsiden ble faktisk vist. Skiller "fullførte" fra "leste resultatet". */
  "result_viewed",
  /** Startet en samtale med Spir. */
  "spir_opened",
  /** Sendte inn en betatilbakemelding. */
  "feedback_submitted",
  /** Lot avkrysningen for anonym forskningsdata stå på. */
  "research_consented",
  /** Fjernet haken for anonym forskningsdata. */
  "research_declined",
] as const;

export type MetricEvent = (typeof METRIC_EVENTS)[number];

const METRIC_EVENT_SET = new Set<string>(METRIC_EVENTS);

export function isValidMetricEvent(value: unknown): value is MetricEvent {
  return typeof value === "string" && METRIC_EVENT_SET.has(value);
}

/**
 * Én dags tellere: hendelsesnavn -> antall. Inneholder i tillegg
 * tidsbruksbøtter på formen `dur:<tier>:<minutter>`, se `durationKey`.
 */
export type DailyMetrics = Record<string, number>;

/** Dato på formatet "2026-07-31" (UTC). Dagen er den fineste oppløsningen vi lagrer. */
export function metricsDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Øvre grense for tidsbruksbøttene. Alt over havner i samme "60+"-bøtte. */
export const MAX_DURATION_BUCKET_MINUTES = 60;

/**
 * Nøkkel for tidsbruk, f.eks. "dur:extended:23". Lagres som histogram over
 * hele minutter i stedet for som en liste av enkeltmålinger -- da kan
 * medianen fortsatt regnes ut, uten at vi trenger å lagre noe per person.
 */
export function durationKey(tier: "full" | "extended", minutes: number): string {
  const bucket = Math.min(Math.max(Math.round(minutes), 0), MAX_DURATION_BUCKET_MINUTES);
  return `dur:${tier}:${bucket}`;
}

/**
 * Regner ut medianen fra et tidsbruks-histogram. Returnerer null når det
 * ikke finnes målinger -- en median av ingenting er ikke null minutter, den
 * finnes ikke, og forskjellen betyr noe når tallet vises i panelet.
 */
export function medianFromDurationBuckets(
  metrics: DailyMetrics,
  tier: "full" | "extended"
): number | null {
  const prefix = `dur:${tier}:`;
  const buckets: Array<[number, number]> = [];
  let total = 0;
  for (const [key, count] of Object.entries(metrics)) {
    if (!key.startsWith(prefix) || count <= 0) continue;
    const minutes = Number.parseInt(key.slice(prefix.length), 10);
    if (!Number.isFinite(minutes)) continue;
    buckets.push([minutes, count]);
    total += count;
  }
  if (total === 0) return null;
  buckets.sort((a, b) => a[0] - b[0]);
  const middle = total / 2;
  let seen = 0;
  for (const [minutes, count] of buckets) {
    seen += count;
    if (seen >= middle) return minutes;
  }
  return buckets[buckets.length - 1]?.[0] ?? null;
}
