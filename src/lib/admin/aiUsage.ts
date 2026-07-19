/**
 * Globalt AI-bruksteller (v2.28, kvalitetsrevisjon 19.07.2026 -- kritisk
 * teknisk/sikkerhetsfunn).
 *
 * FØR denne filen: `aiGlobalQuestionCap` (adminpanelets "globale AI-tak")
 * ble lest og lagret, men ALDRI faktisk håndhevet i /api/spir/route.ts --
 * kun det klientrapporterte, per-økt-taket ble sjekket. Et globalt tak
 * produkteier trodde beskyttet mot uventet Anthropic-kostnad hadde altså
 * ingen reell effekt.
 *
 * Denne telleren er bevisst enkel (les -> øk -> skriv i Netlify Blobs,
 * samme mønster som ellers i koden, f.eks. otp.ts sine attempts-felt) --
 * IKKE atomisk/transaksjonell på tvers av samtidige forespørsler. Under høy
 * samtidighet kan noen ekstra forespørsler slippe gjennom rett før taket
 * treffes (en kjent, akseptert unøyaktighet -- se f.eks. samme
 * "beste innsats"-tilnærming i lib/account/otp.ts). Formålet er å stoppe
 * ukontrollert, vedvarende vekst i kostnad -- ikke å være en økonomisk
 * vanntett sperre til enhver millisekund.
 *
 * Telleren er "for alltid" (nullstilles ikke automatisk) -- resetGlobalAiUsage
 * finnes for når produkteier vil nullstille den manuelt (f.eks. fra en
 * fremtidig admin-UI, eller direkte via dette modulet), som matcher at
 * aiGlobalQuestionCap i dag beskrives i panelet som et engangs
 * "gratis utprøving"-tak.
 */
import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function usageStore() {
  return getStore({ name: "femfaktorer-ai-usage", consistency: "strong", ...manualConfig() });
}

const COUNT_KEY = "global-count";

/** Antall AI-kall (Spir-utvekslinger) gjort totalt så langt. */
export async function getGlobalAiUsage(): Promise<number> {
  try {
    const value = (await usageStore().get(COUNT_KEY, { type: "json" })) as number | null;
    return typeof value === "number" ? value : 0;
  } catch {
    // Blobs utilgjengelig -- fall tilbake til 0 (åpner heller enn å blokkere
    // Spir helt ved en infrastrukturfeil et annet sted).
    return 0;
  }
}

/** Øker telleren med 1 og returnerer den nye verdien. Kalles ETTER et faktisk Anthropic-kall. */
export async function incrementGlobalAiUsage(): Promise<number> {
  try {
    const current = await getGlobalAiUsage();
    const next = current + 1;
    await usageStore().setJSON(COUNT_KEY, next);
    return next;
  } catch {
    return -1; // signaliserer "klarte ikke å telle" uten å kaste -- skal ikke blokkere selve Spir-svaret
  }
}

export async function resetGlobalAiUsage(): Promise<void> {
  await usageStore().setJSON(COUNT_KEY, 0);
}
