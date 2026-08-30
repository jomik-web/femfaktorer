/**
 * Aggregert, anonym normtall-statistikk (v2.8). Kun løpende tellere -- se
 * lib/stats/blobs.ts for personvernbegrunnelsen.
 *
 * RETNING PÅ TALLENE -- LES DETTE FØR DU SAMMENLIGNER MED PUBLISERTE NORMER
 * (dokumentert v2.60, 04.08.2026)
 *
 * Histogrammene her lagrer skårene slik de VISES i tjenesten, ikke slik de
 * er definert i IPIP/NEO-litteraturen. For nevrotisisme-domenet og alle seks
 * N-fasettene er tallet speilvendt (`100 - scaled`, se scoring.ts linje 177
 * og 240), fordi tjenesten viser "Emosjonell stabilitet" i stedet for
 * "Nevrotisisme" -- en bevisst produktbeslutning, jf. Dokument 03 §12.1.
 *
 * Konkret: en person som i IPIP ville hatt N = 87 (svært nevrotisk) ligger
 * her i bøtte 13. Sammenligner du disse histogrammene mot publiserte
 * Big Five-normer UTEN å snu N-tallene tilbake, får du motsatt konklusjon av
 * hva dataene faktisk sier.
 *
 * De fire øvrige domenene (E, O, A, C) og deres fasetter er IKKE snudd og
 * kan sammenlignes direkte.
 *
 * MERK at dette IKKE gjelder forskningsdataene i lib/research/: der lagres
 * råsvarene per spørsmål (1-5), som er retningsnøytrale. Leddanalyse --
 * ledd-total-korrelasjon og intern konsistens per fasett -- er derfor trygg
 * uansett hva som skjer med visningen.
 */

/** Antall bøtter i hvert histogram: én per hele poengsum, 0 til 100. */
export const NORM_BUCKET_COUNT = 101;

export function emptyHistogram(): number[] {
  return new Array(NORM_BUCKET_COUNT).fill(0);
}

export interface NormStats {
  updatedAt: string;
  /** Antall fullførte 120-tester som er talt med totalt. */
  totalSubmissions: number;
  /** Histogram per hovedfaktor (nøklet på DisplayFactor, f.eks. "openness"). */
  domains: Record<string, number[]>;
  /** Histogram per fasett (nøklet på fasettkode, f.eks. "N1"). */
  facets: Record<string, number[]>;
}

export function emptyNormStats(): NormStats {
  return { updatedAt: new Date().toISOString(), totalSubmissions: 0, domains: {}, facets: {} };
}

/** Klemmer en skår til gyldig bøtte-indeks (0-100) -- forsvarer mot uventede verdier. */
export function bucketIndexFor(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}
