/**
 * Lagring for de anonyme brukstellerne (v2.45, 31.07.2026).
 * Se lib/metrics/types.ts for hva som telles og hvorfor.
 *
 * Én blob per DAG, ikke per hendelse: det holder lagringen liten og gjør at
 * adminpanelet kan hente "siste 30 dager" med 30 oppslag i stedet for å
 * liste tusenvis av poster.
 */
import { getStore } from "@netlify/blobs";
import { metricsDayKey, type DailyMetrics } from "@/lib/metrics/types";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function metricsStore() {
  return getStore({ name: "femfaktorer-metrics", consistency: "strong", ...manualConfig() });
}

/**
 * Øker én eller flere tellere for dagen i dag.
 *
 * Kaster aldri. Telling er bakgrunnsinfrastruktur -- den skal ikke kunne
 * ødelegge et svar til brukeren, uansett hva som er galt med lagringen.
 */
export async function incrementMetrics(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    const store = metricsStore();
    const day = metricsDayKey();
    const existing = ((await store.get(day, { type: "json" })) as DailyMetrics | null) ?? {};
    for (const key of keys) {
      existing[key] = (existing[key] ?? 0) + 1;
    }
    await store.setJSON(day, existing);
  } catch {
    // Stille -- se doc-kommentaren over.
  }
}

/** Tellerne for én bestemt dag. Tom post om dagen ikke finnes. */
export async function readDay(day: string): Promise<DailyMetrics> {
  try {
    return ((await metricsStore().get(day, { type: "json" })) as DailyMetrics | null) ?? {};
  } catch {
    return {};
  }
}

/**
 * Summerer tellerne over de siste `days` dagene, inkludert i dag.
 * Henter dagene parallelt -- 30 små oppslag mot Blobs går fort nok, og
 * alternativet (ett samledokument) ville tapt skrivinger ved samtidighet.
 */
export async function readRange(days: number): Promise<DailyMetrics> {
  const now = new Date();
  const dayKeys: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(metricsDayKey(d));
  }

  const records = await Promise.all(dayKeys.map(readDay));
  const total: DailyMetrics = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      total[key] = (total[key] ?? 0) + value;
    }
  }
  return total;
}

/**
 * Tellerne per dag for de siste `days` dagene, nyeste sist -- brukt til
 * å tegne en enkel utviklingskurve i panelet.
 */
export async function readDailySeries(days: number): Promise<Array<{ day: string; metrics: DailyMetrics }>> {
  const now = new Date();
  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(metricsDayKey(d));
  }
  const records = await Promise.all(dayKeys.map(readDay));
  return dayKeys.map((day, i) => ({ day, metrics: records[i] ?? {} }));
}
