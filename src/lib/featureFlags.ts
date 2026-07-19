/**
 * Enkle funksjonsbrytere (v2.16, 15.07.2026) -- samlet ett sted slik at det
 * er raskt og trygt å slå ting av/på uten å lete gjennom hele kodebasen.
 *
 * Bakgrunn (produkteiers eksplisitte ønske 15.07.2026): under betatesting
 * skal fokus være på språk, tilbakemeldingstekster og Spir-samtalen -- ikke
 * på kontofunksjonen. Kontolagring (e-postkode-innlogging, lagre/hente
 * resultat) settes derfor midlertidig PÅ VENT, og et nytt, synlig
 * CSV-verktøy (last ned/last opp svarsett) tar over som betatesternes måte
 * å slippe å svare på alle 290 spørsmålene på nytt etter hver oppdatering.
 * Begge deler er ment å være midlertidige tilstander -- ikke fjern koden
 * bak flaggene, bare flipp verdien her når betatestingen er over.
 */

/**
 * Kontolagring (innlogging, "lagre resultatet mitt", /logg-inn) --
 * REAKTIVERT 19.07.2026 (v2.28, kvalitetsrevisjon): innlogging med
 * e-post + engangskode trengs nå ikke bare for å hente lagrede resultater,
 * men også som inngang til admin-panelet (se lib/admin/roles.ts) --
 * innloggingen er derfor lagt i toppmenyen (SiteNav), ikke bare i
 * bunnteksten. Planen om å gjenbruke denne til 3-nivå-prismodellen (se
 * FemFaktorer_Forretnings-og-prismodell_v1.2.docx del 6.1) står fortsatt.
 */
export const ACCOUNT_SAVE_ENABLED = true;

/**
 * Selve "lagre resultatet mitt PÅ KONTO"-knappen/skjemaet på resultatsiden --
 * SATT PÅ PAUSE 19.07.2026 (v2.29, på produkteiers ønske), atskilt fra
 * ACCOUNT_SAVE_ENABLED over. Under betatestingen skal CSV-verktøyet
 * (BETA_ANSWER_SET_TOOLS_ENABLED) være den ene, fungerende måten å ta vare
 * på svarene sine på -- ikke kontolagring, som ellers ville gitt to
 * parallelle "lagre"-veier samtidig. Innlogging i seg selv (nødvendig for
 * admin-tilgang, se ACCOUNT_SAVE_ENABLED) er IKKE påvirket av dette flagget.
 */
export const RESULT_ACCOUNT_SAVE_ENABLED = false;

/** Synlige last ned/last opp-knapper for svarsett på resultatsiden -- KUN for betatestperioden. */
export const BETA_ANSWER_SET_TOOLS_ENABLED = true;
