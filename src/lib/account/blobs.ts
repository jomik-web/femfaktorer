/**
 * Netlify Blobs-tilkobling for kontofunksjonen (innlogging med e-post +
 * engangskode, og lagring av fullversjon-resultatet på tvers av enheter).
 * Lagt til v2.4 etter produkteiers ønske ("resultatene mine blir husket
 * mellom de ulike versjonene" / "lagre dataene for senere bruk").
 *
 * VIKTIG, samme begrensning som ble dokumentert i src/lib/admin/store.ts:
 * dette prosjektet kjører på Netlifys serverless/edge-funksjoner, som IKKE
 * deler filsystem på tvers av forespørsler. Netlify Blobs er derfor brukt
 * her i stedet for en lokal fil -- det er Netlifys egen anbefalte,
 * innebygde nøkkel-verdi-lagring (ingen egen database å sette opp).
 *
 * `getStore({ name })` får site-kontekst (site-ID/token) AUTOMATISK når
 * koden faktisk kjører i en Netlify Function -- altså i produksjon på
 * Netlify, eller lokalt via `netlify dev` (IKKE vanlig `next dev`). Kjøres
 * appen med vanlig `next dev` uten Netlify CLI, vil disse kallene feile med
 * mindre NETLIFY_BLOBS_SITE_ID og NETLIFY_BLOBS_TOKEN er satt manuelt i
 * .env.local (valgfritt fallback for lokal utvikling, se .env.example).
 */
import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

/** Korttlevde engangskoder (10 min TTL) -- se lib/account/otp.ts. */
export function otpStore() {
  return getStore({ name: "femfaktorer-otp-codes", consistency: "strong", ...manualConfig() });
}

/**
 * Lagrede fullversjon-resultater, nøklet på normalisert e-post. Lagrer KUN
 * ferdig beregnede skårer (FactorResult[]/FacetResult[]/O6-skår) -- ALDRI
 * de 120 rå svarene. Dette er et bevisst personvernvalg (dataminimering,
 * GDPR art. 5(1)(c)): de rå svarene sier mer om enkeltpåstander brukeren har
 * tatt stilling til, mens de beregnede skårene er det som faktisk trengs for
 * å vise resultatet på nytt.
 */
export function accountStore() {
  return getStore({ name: "femfaktorer-accounts", consistency: "strong", ...manualConfig() });
}

/** Innloggingsøkter -- opake tokens, ikke signerte cookies, slik at en økt kan slettes/tilbakekalles server-side (logg ut). */
export function sessionStore() {
  return getStore({ name: "femfaktorer-sessions", consistency: "strong", ...manualConfig() });
}
