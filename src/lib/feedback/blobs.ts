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

export interface FeedbackEntry {
  /** ISO 8601. Her er nøyaktig tidspunkt greit -- posten er ikke koblet til noe svarmønster. */
  submittedAt: string;
  /** 1-5, der 5 er best. Valgfritt -- noen vil bare skrive. */
  rating: number | null;
  /** Selve tilbakemeldingen. */
  message: string;
  /** Hvilken del av nettstedet det gjelder. */
  area: string;
  appVersion: string;
  device: string;
  /** Tidsbruk på testen i sekunder, om det er kjent. */
  durationSeconds: number | null;
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
    return entries.filter((e): e is FeedbackEntry => e !== null);
  } catch {
    return [];
  }
}
