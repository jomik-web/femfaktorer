/**
 * Netlify Blobs-tilkobling for ANONYM normtall-statistikk (v2.8).
 *
 * VIKTIG PERSONVERNGRENSE: denne butikken skal ALDRI inneholde en
 * identifiserbar enkeltpost -- kun løpende, aggregerte tellere (histogrammer)
 * per hovedfaktor og fasett. Ingen e-post, IP, øktinformasjon eller
 * tidsstempel per innsending skal noensinne lagres her. Se
 * src/app/api/stats/submit-norm/route.ts, som bevisst IKKE leser cookies
 * eller økt -- ruten har ingen måte å vite hvem som sender inn på.
 *
 * Formål: bygge et empirisk normgrunnlag over tid (jf. metode-og-kilder-
 * siden, som per i dag bruker en enkel lineær skalering uten normgruppe),
 * slik at resultatet etter hvert kan vises som en ekte persentil i stedet
 * for bare et nivåbånd.
 */
import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

export function normStatsStore() {
  return getStore({ name: "femfaktorer-norm-stats", consistency: "strong", ...manualConfig() });
}
