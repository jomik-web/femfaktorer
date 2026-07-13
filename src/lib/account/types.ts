import type { FactorResult, FacetResult } from "@/lib/scoring";

/**
 * Det som faktisk lagres per konto (nøklet på e-post i accountStore(), se
 * lib/account/blobs.ts). KUN ferdig beregnede skårer -- se filhode i
 * blobs.ts for personvernbegrunnelsen for hvorfor de 120 rå svarene
 * bevisst IKKE lagres her.
 */
export interface StoredAccountResult {
  factors: FactorResult[];
  facets: FacetResult[];
  o6Score: number | null;
  /** ISO 8601-tidspunkt for når resultatet sist ble lagret/oppdatert. */
  savedAt: string;
}
