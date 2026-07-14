/**
 * Netlify Blobs-tilkobling for ANONYM normtall-statistikk (v2.8, utvidet i
 * v2.11 med en egen pott for den utvidede 290-versjonen).
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
 *
 * EGEN POTT FOR UTVIDET VERSJON (v2.11, produkteiers eksplisitte valg):
 * fasettskårer fra den utvidede testen (10 spørsmål/fasett) er statistisk
 * mer pålitelige enn fra fullversjonen (4-5 spørsmål/fasett), så de to
 * blandes IKKE sammen i samme histogram-pott -- det ville kunne gi en litt
 * skjev normfordeling. To helt separate Netlify Blobs-butikker brukes
 * derfor, valgt ut fra hvilket tier innsendingen kommer fra.
 */
import { getStore } from "@netlify/blobs";
import type { ResultTier } from "@/lib/scoring";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

/** Tier som er gyldige å sende normtall inn for -- "free" har for få item per fasett til å være meningsfullt. */
export type NormStatsTier = Extract<ResultTier, "full" | "extended">;

const STORE_NAME_BY_TIER: Record<NormStatsTier, string> = {
  full: "femfaktorer-norm-stats",
  extended: "femfaktorer-norm-stats-extended",
};

export function normStatsStore(tier: NormStatsTier) {
  return getStore({ name: STORE_NAME_BY_TIER[tier], consistency: "strong", ...manualConfig() });
}
