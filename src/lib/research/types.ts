/**
 * Anonyme svarsett til psykometrisk kvalitetskontroll (v2.45, 31.07.2026).
 *
 * FORMÅL, OG HVORFOR DETTE FINNES I DET HELE TATT
 * Fram til nå har systemet bevisst kastet svarene på enkeltspørsmål: kontoen
 * lagrer kun ferdig beregnede skårer, og normstatistikken kun histogrammer.
 * Det gjør personvernet enkelt, men gjør det samtidig UMULIG å oppdage at et
 * spørsmål er dårlig oversatt, tvetydig, eller ikke måler det samme som de
 * andre spørsmålene i sin fasett. Uten leddnivådata kan man ikke regne ut
 * ledd-total-korrelasjon eller intern konsistens (alfa) -- altså ikke gjøre
 * den løpende kvalitetskontrollen ITCs retningslinjer forutsetter av en
 * testutgiver.
 *
 * PERSONVERNGRENSEN -- LES DETTE FØR DU ENDRER NOE HER
 * Denne posten skal ALDRI kunne knyttes til en person. Konkret betyr det:
 *
 *  - Ingen e-post, ingen bruker-id, ingen økt-id, ingen IP, ingen
 *    informasjonskapsel. API-ruten leser bevisst ikke cookies i det hele
 *    tatt (samme prinsipp som stats/submit-norm).
 *  - Ingen tidsstempel finere enn ISO-UKE. Grunn: et fullt 290-svars mønster
 *    er høydimensjonalt nok til å fungere som et fingeravtrykk. Et nøyaktig
 *    klokkeslett ville gitt en nesten unik nøkkel å koble mot andre kilder
 *    (f.eks. en serverlogg). Uke er grovt nok til å ødelegge den koblingen,
 *    og fint nok til å se utvikling over tid.
 *  - Lagres i en EGEN blob-butikk, aldri sammen med kontodata. Så lenge de
 *    to aldri ligger i samme butikk, finnes det ingen nøkkel å koble dem på.
 *
 * Legger du til et felt her: still spørsmålet "kan dette, sammen med
 * svarmønsteret, peke tilbake på én person?" Er svaret ja eller kanskje --
 * ikke legg det til.
 *
 * SAMTYKKE
 * Innsamlingen skjer bare når brukeren har latt avkrysningen på
 * "Før du starter"-skjermen stå på (se src/lib/storage.ts,
 * loadResearchConsent). Den er avkrysset på forhånd etter produkteiers valg
 * 31.07.2026, med synlig forklaring på samme skjerm.
 */

/** Svarverdi på Likert-skalaen, 1-5. Samme skala som resten av appen. */
export type ResearchAnswerValue = 1 | 2 | 3 | 4 | 5;

/** Grov enhetskategori -- utledet av skjermbredde, ikke av brukeragent. */
export type ResearchDevice = "mobil" | "nettbrett" | "desktop" | "ukjent";

export interface ResearchAnswerSet {
  /** Hvilket nivå testen ble fullført på. "free" samles ikke inn -- for få ledd per fasett. */
  tier: "full" | "extended";
  /** Se src/data/questionSetVersion.ts. Uten dette er dataene ubrukelige til leddanalyse. */
  questionSetVersion: string;
  /** Appversjonen slik den sto da testen ble fullført, f.eks. "2.45". */
  appVersion: string;
  /** ISO-uke, f.eks. "2026-W31". BEVISST grovt -- se filhodet. */
  week: string;
  /** Spørsmål-id -> svarverdi. */
  answers: Record<string, ResearchAnswerValue>;
  /**
   * Spørsmål-id -> millisekunder brukt på det spørsmålet. Kan mangle helt
   * eller delvis (f.eks. hvis siden ble lastet på nytt midt i testen) --
   * analysen må tåle det. Svartid per ledd er den mest effektive enkeltmarkøren
   * for skjødesløs svargiving, som ellers blåser opp itemvarians og trekker
   * gjennomsnitt mot midten av skalaen.
   */
  responseMs: Record<string, number>;
  device: ResearchDevice;
}

/** Øvre grense for hvor mange millisekunder som lagres per ledd. */
const MAX_RESPONSE_MS = 10 * 60 * 1000; // 10 minutter

/**
 * Klemmer en rå svartid til noe fornuftig. En fane som har ligget åpen over
 * natten skal ikke registreres som 14 timers betenkningstid -- da forsvinner
 * signalet vi faktisk er ute etter i støyen.
 */
export function clampResponseMs(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.min(Math.round(value), MAX_RESPONSE_MS);
}

export function isValidResearchAnswerValue(value: unknown): value is ResearchAnswerValue {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function isValidResearchDevice(value: unknown): value is ResearchDevice {
  return value === "mobil" || value === "nettbrett" || value === "desktop" || value === "ukjent";
}

/**
 * ISO-8601-ukenummer, f.eks. "2026-W31". Egen implementasjon fordi
 * JavaScript ikke har det innebygd, og fordi et bibliotek for én funksjon
 * ikke er verdt avhengigheten.
 *
 * ISO-regelen: uke 1 er den uken som inneholder årets første torsdag.
 */
export function isoWeek(date: Date = new Date()): string {
  // Kopier og normaliser til midnatt UTC, så sommertid ikke flytter datoen.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Flytt til torsdagen i samme uke (ISO: mandag = 1 ... søndag = 7).
  const dayNumber = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - dayNumber);
  const year = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstDayNumber = firstThursday.getUTCDay() === 0 ? 7 : firstThursday.getUTCDay();
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - firstDayNumber);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}
