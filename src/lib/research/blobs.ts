/**
 * Blob-butikk for anonyme svarsett (v2.45, 31.07.2026).
 *
 * EGEN BUTIKK, IKKE DELT MED NOE ANNET. Dette er ikke en tilfeldighet:
 * så lenge svarsettene ligger for seg selv, uten noen felles nøkkel med
 * kontobutikken (lib/account/blobs.ts), finnes det ingen teknisk måte å
 * koble et svarmønster til en e-postadresse på -- heller ikke for oss.
 * Legg ALDRI kontodata inn her, og legg aldri svarsett inn i kontobutikken.
 *
 * ÉN BLOB PER INNSENDING, ikke ett stort samledokument. Grunnen er dels
 * praktisk (leddanalyse trenger enkeltposter, ikke summer), dels teknisk:
 * les-endre-skriv på ett delt dokument taper skrivinger når to personer
 * fullfører testen samtidig. Med én blob per innsending finnes ikke det
 * problemet.
 *
 * Nøkkelformat: `<uke>/<tilfeldig id>`, f.eks. "2026-W31/9f3c...".
 * Uken først gjør det mulig å hente ut ett tidsrom om gangen med prefiks,
 * i stedet for å liste alt.
 */
import { getStore } from "@netlify/blobs";
import { isoWeek, type ResearchAnswerSet } from "@/lib/research/types";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

export function researchStore() {
  return getStore({ name: "femfaktorer-research-answersets", consistency: "strong", ...manualConfig() });
}

/**
 * Lagrer ett svarsett. Kaster ikke -- innsamling skal aldri kunne påvirke
 * brukeropplevelsen, samme prinsipp som normtellingen.
 */
export async function storeAnswerSet(record: ResearchAnswerSet): Promise<boolean> {
  try {
    const key = `${record.week}/${crypto.randomUUID()}`;
    await researchStore().setJSON(key, record);
    return true;
  } catch {
    return false;
  }
}

/**
 * Henter svarsett, eventuelt avgrenset til én uke. `limit` finnes for at
 * adminpanelet ikke skal kunne dra ned hele datasettet ved et uhell når det
 * en gang blir stort -- selve analysen skal kjøres bevisst, ikke som en
 * bieffekt av å åpne en side.
 */
export async function listAnswerSets(
  options: { week?: string; limit?: number } = {}
): Promise<ResearchAnswerSet[]> {
  const { week, limit = 500 } = options;
  try {
    const store = researchStore();
    const { blobs } = await store.list(week ? { prefix: `${week}/` } : {});
    const selected = blobs.slice(0, limit);
    const records = await Promise.all(
      selected.map(async (blob) => {
        try {
          return (await store.get(blob.key, { type: "json" })) as ResearchAnswerSet | null;
        } catch {
          return null;
        }
      })
    );
    return records.filter((r): r is ResearchAnswerSet => r !== null);
  } catch {
    return [];
  }
}

/**
 * Teller svarsett uten å laste innholdet. Brukt av adminpanelets forside,
 * der vi bare trenger tallet.
 */
export async function countAnswerSets(week?: string): Promise<number> {
  try {
    const { blobs } = await researchStore().list(week ? { prefix: `${week}/` } : {});
    return blobs.length;
  } catch {
    return 0;
  }
}

/** Uken vi er i nå -- praktisk snarvei for kallsteder som ikke vil importere types.ts. */
export function currentWeek(): string {
  return isoWeek();
}
