/**
 * Betatilbakemeldinger (v2.46, 31.07.2026).
 *
 * ERSTATTER GOOGLE FORMS. Tre grunner til at det er verdt bytte:
 *  1. Versjon, enhet og tidsbruk følger automatisk med, i stedet for å måtte
 *     limes inn i et skjult felt som kan miste synkroniseringen.
 *  2. Tilbakemeldingene vises i adminpanelet, ved siden av tallene de
 *     handler om -- i stedet for i en helt annen tjeneste.
 *  3. Testernes ord om produktet ligger hos oss, ikke hos Google.
 *
 * FORTSATT ANONYMT, som Google-skjemaet var. Ingen e-post, intet navn, ingen
 * IP. Det betyr at du IKKE kan svare en tester som melder en feil -- en reell
 * ulempe. Skal det endres, må et frivillig kontaktfelt legges til her OG
 * beskrives i personvernerklæringen, siden en e-postadresse i fritekst gjør
 * posten til en personopplysning.
 *
 * MERK: fritekstfeltet kan likevel inneholde personopplysninger dersom en
 * tester selv skriver navnet sitt der. Det er ikke til å unngå i et
 * fritekstfelt, og er grunnen til at oppbevaringstiden er begrenset (se
 * FEEDBACK_TTL_DAYS) i stedet for evig.
 */
import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function feedbackStore() {
  return getStore({ name: "femfaktorer-feedback", consistency: "strong", ...manualConfig() });
}

/** Hvor lenge tilbakemeldinger beholdes. Se filhodet for hvorfor det er begrenset. */
export const FEEDBACK_TTL_DAYS = 365;

/**
 * Områdene det gis karakter på (v2.48). Bevisst kort liste -- se
 * FeedbackPrompt.tsx for hvorfor "språket", "teknisk" og "layout" IKKE har
 * egne tall lenger.
 */
export const RATED_AREAS = ["testen", "resultatet", "spir"] as const;
export type RatedArea = (typeof RATED_AREAS)[number];

export interface FeedbackEntry {
  /** ISO 8601. Her er nøyaktig tidspunkt greit -- posten er ikke koblet til noe svarmønster. */
  submittedAt: string;
  /**
   * Karakter 1-5 per område, der 5 er best. `null` betyr IKKE "dårlig", men
   * "ikke besvart" -- for spir betyr det konkret at testeren ikke brukte den.
   * Skillet er viktig når snittet regnes ut: en ubesvart post skal ikke telle
   * som en lav skår.
   */
  ratings: Record<RatedArea, number | null>;
  /** Fritekst. Valgfri fra v2.48 -- obligatorisk fritekst ganget frafallet. */
  message: string;
  appVersion: string;
  device: string;
  /** Tidsbruk på testen i sekunder, om det er kjent. */
  durationSeconds: number | null;

  /**
   * v2.46-format, beholdt KUN for å kunne lese poster som allerede ligger i
   * lagringen. Den gamle formen var én karakter + ett valgt område; den nye
   * er én karakter per område. Skriv aldri disse feltene på nytt -- se
   * normalizeFeedbackEntry under.
   */
  rating?: number | null;
  area?: string;
}

/**
 * Gjør en post fra hvilken som helst versjon lesbar med den nye formen.
 * Gamle poster hadde ett tall knyttet til ett valgt område -- det tallet
 * legges der det hørte hjemme, og resten står som ubesvart. Poster fra
 * områder som ikke lenger har egen karakter ("språket", "teknisk", "annet")
 * mister tallet sitt, men beholder teksten, som er det som faktisk var verdt
 * noe i dem.
 */
export function normalizeFeedbackEntry(entry: FeedbackEntry): FeedbackEntry {
  if (entry.ratings) return entry;
  const ratings: Record<RatedArea, number | null> = { testen: null, resultatet: null, spir: null };
  if (entry.area && (RATED_AREAS as readonly string[]).includes(entry.area)) {
    ratings[entry.area as RatedArea] = entry.rating ?? null;
  }
  return { ...entry, ratings };
}

export async function storeFeedback(entry: FeedbackEntry): Promise<boolean> {
  try {
    // Tidspunkt først i nøkkelen gjør at listen kommer omtrent kronologisk,
    // og at gamle poster kan ryddes med et prefiksoppslag senere.
    const key = `${entry.submittedAt}-${crypto.randomUUID().slice(0, 8)}`;
    await feedbackStore().setJSON(key, entry);
    return true;
  } catch {
    return false;
  }
}

/** Nyeste først. `limit` hindrer at panelet drar ned alt når listen vokser. */
export async function listFeedback(limit = 100): Promise<FeedbackEntry[]> {
  try {
    const store = feedbackStore();
    const { blobs } = await store.list();
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, limit);
    const entries = await Promise.all(
      keys.map(async (key) => {
        try {
          return (await store.get(key, { type: "json" })) as FeedbackEntry | null;
        } catch {
          return null;
        }
      })
    );
    return entries.filter((e): e is FeedbackEntry => e !== null).map(normalizeFeedbackEntry);
  } catch {
    return [];
  }
}
