/**
 * Delt per-IP rate limiter (v2.46, Kvalitetsrevisjon 31.07.2026, kap. 8,
 * funn #1 -- høy, og funn #2 -- middels).
 *
 * Bevisst enkel fast-vindu-teller i Netlify Blobs, samme
 * les->øk->skriv-mønster som admin/aiUsage.ts og account/otp.ts sine
 * attempts-felt: IKKE atomisk/transaksjonell på tvers av samtidige
 * forespørsler fra samme IP innenfor samme millisekund -- en kjent,
 * akseptert unøyaktighet i denne kodebasen (se aiUsage.ts sitt filhode for
 * samme resonnement). Formålet er å stoppe grovt misbruk/spam (skript som
 * banker løs på en endepunkt), ikke å være en vanntett sperre.
 *
 * Hvert kall til `checkRateLimit` er scoped til en `bucket` (f.eks.
 * "submit-norm" eller "request-code") + klient-IP, slik at ulike endepunkter
 * ikke deler tak med hverandre.
 */
import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function rateLimitStore() {
  return getStore({ name: RATE_LIMIT_STORE_NAME, consistency: "strong", ...manualConfig() });
}

/**
 * Henter klientens IP fra Netlify sine forwarding-headere.
 * `x-nf-client-connection-ip` er Netlify-spesifikk og pekes på som den
 * pålitelige kilden i deres dokumentasjon; `x-forwarded-for` er en generisk
 * reserve. Faller til "unknown" i lokal dev/utenfor Netlify -- i praksis
 * deler da alle lokale forespørsler samme bøtte, som er greit siden dette
 * kun er en misbruksbrems, ikke en sikkerhetsgrense.
 */
export function getClientIp(request: Request): string {
  const nfIp = request.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp;
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return (forwardedFor.split(",")[0] ?? forwardedFor).trim();
  return "unknown";
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

/**
 * Sjekker og teller ett kall mot taket. `windowMs` er vinduets lengde,
 * `limit` er maks antall kall per vindu per (bucket, ip)-par.
 *
 * Ved Blobs-feil åpnes det heller enn å blokkere (samme "beste
 * innsats"-filosofi som aiUsage.ts) -- en infrastrukturfeil et annet sted
 * skal ikke gjøre at f.eks. innlogging slutter å virke.
 */
export async function checkRateLimit(
  request: Request,
  bucket: string,
  { windowMs, limit }: { windowMs: number; limit: number }
): Promise<RateLimitResult> {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const windowIndex = Math.floor(now / windowMs);

    const store = rateLimitStore();
    const currentKey = rateLimitKey(bucket, ip, windowIndex);
    const previousKey = rateLimitKey(bucket, ip, windowIndex - 1);

    const [current, previous] = await Promise.all([
      store.get(currentKey, { type: "json" }) as Promise<number | null>,
      store.get(previousKey, { type: "json" }) as Promise<number | null>,
    ]);

    /**
     * GLIDENDE VINDU (v2.50, kvalitetsrevisjon 01.08.2026, funn 5.3).
     *
     * Tidligere ble bare inneværende faste vindu talt. Fordi vinduene er
     * justert mot epoken (et døgnvindu starter ved midnatt UTC), betydde det
     * at hele kvoten kunne brukes rett før vinduskiftet og hele neste kvote
     * rett etter -- altså det dobbelte av taket på noen få sekunder, som er
     * nøyaktig det mønsteret en misbruksbrems skal fange.
     *
     * Løsningen er standard «sliding window counter»: vi teller inneværende
     * vindu fullt, og tar med en ANDEL av forrige vindu som svarer til hvor
     * langt inn i det nye vi har kommet. Er vi 20 % inn i vinduet, teller de
     * siste 80 % av forrige vindu fortsatt med.
     *
     * Dette er en tilnærming, ikke en eksakt telling over de siste N
     * millisekundene -- den forutsetter at kallene i forrige vindu var jevnt
     * fordelt. Den er valgt fordi den koster to oppslag og ingen ny
     * lagringsstruktur, mens en eksakt logg ville krevd at vi lagret et
     * tidsstempel per forespørsel per IP. For formålet -- stoppe grovt
     * misbruk, ikke telle presist -- er tilnærmingen riktig avveining, og
     * den er strengere enn det gamle faste vinduet i alle tilfeller.
     */
    const elapsedInWindow = now - windowIndex * windowMs;
    const previousWeight = 1 - elapsedInWindow / windowMs;
    const estimated = (current ?? 0) + (previous ?? 0) * previousWeight;

    if (estimated >= limit) {
      // Vent til nok av forrige vindu har glidd ut til at det er plass igjen.
      const retryAfterMs = windowMs - elapsedInWindow;
      return { ok: false, retryAfterMs: Math.max(retryAfterMs, 0) };
    }

    await store.setJSON(currentKey, (current ?? 0) + 1);
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/**
 * Nøkkelformatet, eksportert slik at oppryddingen kan tolke det.
 *
 * v2.50 (kvalitetsrevisjon 01.08.2026, funn 5.2): butikken skrev tidligere
 * nøkler som ALDRI ble slettet. Hver (bøtte, IP, vindu)-kombinasjon ble
 * liggende for alltid, også lenge etter at vinduet var passert og verdien
 * aldri kunne leses igjen. Se netlify/functions/account-retention.mts, som
 * nå rydder dem.
 *
 * Endrer du formatet her, MÅ `parseRateLimitKey` endres i samme slengen --
 * ellers slutter oppryddingen stille å finne noe å rydde.
 */
export function rateLimitKey(bucket: string, ip: string, windowIndex: number): string {
  return `${bucket}:${ip}:${windowIndex}`;
}

/**
 * Motstykket til `rateLimitKey`. Returnerer null for nøkler som ikke passer
 * formatet -- de lar vi i så fall stå heller enn å slette noe vi ikke forstår.
 */
export function parseRateLimitKey(
  key: string
): { bucket: string; ip: string; windowIndex: number } | null {
  const lastColon = key.lastIndexOf(":");
  if (lastColon === -1) return null;
  const windowIndex = Number.parseInt(key.slice(lastColon + 1), 10);
  if (!Number.isFinite(windowIndex)) return null;
  const rest = key.slice(0, lastColon);
  const firstColon = rest.indexOf(":");
  if (firstColon === -1) return null;
  return {
    bucket: rest.slice(0, firstColon),
    ip: rest.slice(firstColon + 1),
    windowIndex,
  };
}

/** Butikknavnet, eksportert for oppryddingsfunksjonen. */
export const RATE_LIMIT_STORE_NAME = "femfaktorer-rate-limit";
