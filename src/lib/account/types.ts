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
  /**
   * ISO 8601-tidspunkt satt av den planlagte funksjonen
   * (netlify/functions/account-retention.mts) når påminnelses-e-posten om
   * forestående sletting er sendt -- forhindrer at samme påminnelse sendes
   * på nytt hver dag fram til slettedato. Nullstilles automatisk hver gang
   * brukeren lagrer/oppdaterer resultatet (nytt `savedAt` skriver over hele
   * posten), som starter en ny 12-månedersperiode. Skal ALDRI settes eller
   * leses av klienten -- kun brukt server-side.
   */
  reminderSentAt?: string;
}

/** Hvor lenge et lagret kontoresultat beholdes før automatisk sletting (v2.7). */
export const ACCOUNT_RESULT_TTL_MONTHS = 12;

/** Hvor mange dager før sletting påminnelses-e-posten sendes ut. */
export const ACCOUNT_RESULT_REMINDER_DAYS_BEFORE = 30;

/** Beregner når et lagret resultat utløper, gitt tidspunktet det sist ble lagret. */
export function computeAccountResultExpiry(savedAt: string): Date {
  const expiry = new Date(savedAt);
  expiry.setMonth(expiry.getMonth() + ACCOUNT_RESULT_TTL_MONTHS);
  return expiry;
}
