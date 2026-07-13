/**
 * Valideringshjelpere for kontolagring -- v2.4. Bevisst en liten, egen kopi
 * av samme mønster som brukes i api/spir/route.ts (ikke en delt import
 * derfra), for å holde de to funksjonsområdene uavhengige av hverandre.
 */
import type { FactorResult, FacetResult } from "@/lib/scoring";

export function isValidFactorResult(value: unknown): value is FactorResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.factor === "string" &&
    typeof v.label === "string" &&
    typeof v.score === "number" &&
    v.score >= 0 &&
    v.score <= 100
  );
}

export function isValidFacetResult(value: unknown): value is FacetResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.facet === "string" &&
    typeof v.facetName === "string" &&
    typeof v.domain === "string" &&
    typeof v.score === "number" &&
    v.score >= 0 &&
    v.score <= 100
  );
}
