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
 * Dine_Fasetter_Forretnings-og-prismodell_v1.2.docx del 6.1) står fortsatt.
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

/**
 * Deling av meme-kort (v2.53, 02.08.2026, produkteiers ønske) -- AV under
 * betatestingen.
 *
 * Grunnen er ikke at delingen ikke virker, men HVOR den peker: kortene har
 * "dinefasetter.no" malt inn i footeren, og det domenet er ikke registrert
 * ennå. Deler noen et kort nå, havner den som blir nysgjerrig på en død
 * adresse -- den dårligst tenkelige førstekontakten med produktet.
 *
 * Seksjonen VISES fortsatt, med vilje: vi vil vite om folk i det hele tatt
 * prøver å dele. Knappene sier fra at funksjonen kommer, og hvert forsøk
 * telles som `share_attempted` i statistikken. Er tallet null når betaen er
 * over, vet du at kortene ikke er verdt mer arbeid.
 *
 * SKRU PÅ når domenet er registrert og koblet til Netlify. Det kan gjøres
 * fra adminpanelet uten ny utrulling.
 */
export const SHARING_ENABLED = false;

/**
 * Synlig bryter på resultatsiden mellom gratis- og betalt visning (v2.65) --
 * KUN for demo- og betatestperioden.
 *
 * Produkteier fikk aldri se gratisversjonen: alle tar nå 120 spørsmål og
 * havner dermed alltid i den detaljerte visningen. Uten en bryter er
 * gratisproduktet umulig å vurdere -- og det er nettopp gratisproduktet som
 * avgjør om noen i det hele tatt kommer til å betale.
 *
 * Bryteren skriver til URL-en (`?visning=gratis`), ikke til lagret tilstand.
 * Det gjør demoen delbar: send lenken til en tester, og de ser nøyaktig
 * samme versjon, også på mobil, uten innlogging.
 *
 * DETTE ER IKKE EN BETALINGSMUR, og må aldri forveksles med en. En
 * URL-parameter er ingen sperre. Her er den harmløs fordi den bare kan gi
 * deg MINDRE innhold enn du allerede har rett på. Når ekte betaling kommer,
 * MÅ tilgangen avgjøres på serveren -- og da skal dette flagget settes til
 * false, slik at ingen betalende bruker møter en knapp som ser ut som om den
 * skrur av det de nettopp betalte for.
 */
export const DEMO_VIEW_SWITCH_ENABLED = true;
