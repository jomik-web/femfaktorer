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
 * GJENAKTIVERT 18.07.2026 (v2.26): produkteier har besluttet å gjenbruke og
 * videreutvikle denne fremfor å bygge en ny løsning, som en del av
 * 3-nivå-prismodellen (skylagring på Standard/Premium-nivå, se
 * FemFaktorer_Forretnings-og-prismodell_v1.2.docx del 6.1). Ingen
 * betalingssperre er lagt inn ennå -- funksjonen er tilgjengelig for alle,
 * uavhengig av nivå, inntil en eventuell betalingsløsning bygges i fase 2.
 */
export const ACCOUNT_SAVE_ENABLED = true;

/** Synlige last ned/last opp-knapper for svarsett på resultatsiden -- KUN for betatestperioden. */
export const BETA_ANSWER_SET_TOOLS_ENABLED = true;
