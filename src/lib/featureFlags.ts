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

/** Kontolagring (innlogging, "lagre resultatet mitt", /logg-inn) -- PÅ VENT under betatesting. */
export const ACCOUNT_SAVE_ENABLED = false;

/** Synlige last ned/last opp-knapper for svarsett på resultatsiden -- KUN for betatestperioden. */
export const BETA_ANSWER_SET_TOOLS_ENABLED = true;
