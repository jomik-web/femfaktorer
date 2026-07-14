/**
 * Aggregert, anonym normtall-statistikk (v2.8). Kun løpende tellere -- se
 * lib/stats/blobs.ts for personvernbegrunnelsen.
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
