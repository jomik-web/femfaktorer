import type { FactorResult, FacetResult, ResultTier } from "@/lib/scoring";

/**
 * Det som faktisk lagres per konto (nøklet på e-post i accountStore(), se
 * lib/account/blobs.ts). KUN ferdig beregnede skårer -- se filhode i
 * blobs.ts for personvernbegrunnelsen for hvorfor de rå svarene
 * bevisst IKKE lagres her.
 */
export interface StoredAccountResult {
  factors: FactorResult[];
  facets: FacetResult[];
  /**
   * Hvilken testversjon resultatet er basert på (v2.11) -- "full" (120
   * spørsmål) eller "extended" (290, "Utvidet versjon"). Vises til brukeren
   * ved gjeninnlogging, etter produkteiers eksplisitte ønske om at dette
   * skal fremgå tydelig.
   */
  tier: Extract<ResultTier, "full" | "extended">;
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

/**
 * v2.27 (produkteiers ønske om "utvikling over tid" for Premium/utvidet
 * versjon, se FemFaktorer_Forretnings-og-prismodell_v1.2.docx del 6.3): en
 * konto lagrer nå en HISTORIKK av resultater (eldst -> nyest) i stedet for
 * bare det siste. Reglene for hvordan historikken vokser ligger i
 * api/account/save-result/route.ts, ikke her -- kort oppsummert: lagrer man
 * et "extended"-resultat (290 spm, Premium-nivå), legges det til historikken;
 * lagrer man et "full"-resultat (120 spm, Standard-nivå), erstattes HELE
 * historikken med bare dét ene resultatet (Standard er bevisst ikke ment å
 * bygge opp en utviklingshistorikk, kun "siste resultat i skya").
 */
export const MAX_ACCOUNT_HISTORY_ENTRIES = 24;

/**
 * Gjør om en rå, ikke-typesjekket blob-verdi til en gyldig historikkliste.
 * Håndterer tre tilfeller: (1) allerede en liste (nytt format), (2) et enkelt
 * gammelt kontoresultat lagret FØR historikk-endringen (v2.4-v2.26 -- hadde
 * `factors` direkte på rot-objektet, ikke i en liste) -- pakkes inn som et
 * ett-elements historikk, (3) `null`/ugyldig -- gir tom liste. Kaster ALDRI --
 * ukjente/korrupte data gir bare en tom liste, aldri en krasj (samme prinsipp
 * som resten av lagringskoden i prosjektet).
 */
export function normalizeAccountHistory(value: unknown): StoredAccountResult[] {
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is StoredAccountResult =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Record<string, unknown>).savedAt === "string" &&
        Array.isArray((entry as Record<string, unknown>).factors)
    );
  }
  if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).savedAt === "string" &&
    Array.isArray((value as Record<string, unknown>).factors)
  ) {
    return [value as StoredAccountResult];
  }
  return [];
}
