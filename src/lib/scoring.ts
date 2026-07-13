/**
 * Skåringsmotor for korttesten. Autoritativ kilde for reglene: Dokument 03
 * (Teststruktur, skåring og resultatformidling, v1.1) §9-§12.
 *
 * Grunnregler som IKKE skal brytes (se §9.3, Dokument 09 §10.3):
 *  - Manglende svar erstattes ALDRI med et nøytralt standardsvar (f.eks. 3).
 *  - Et resultat skal ikke kunne beregnes for en ufullført test.
 *  - Reversert skåring: reversert verdi = 6 - avgitt svar.
 *
 * Om 0-100-skalaen (besluttet v1.7, se Grunnlagsdokumentet §7 og Dokument 03 §10.4):
 * dette er EN REN LINEÆR OMREGNING av råskår, IKKE en normbasert persentil.
 * Riktig normdata finnes ikke ennå for akkurat dette 6-spørsmål-per-faktor-utvalget
 * (se Dokument 06 §9 for hvilket datasett som skal brukes når normer bygges).
 * Tekst i grensesnittet skal derfor ALDRI hevde sammenligning med andre brukere.
 */

import { QUESTIONS, type Domain, type Question } from "@/data/questions";

export type AnswerValue = 1 | 2 | 3 | 4 | 5;

/** Svar nøkles på spørsmålets stabile id (se questions.ts). */
export type AnswerMap = Partial<Record<string, AnswerValue>>;

const MIN_RAW_PER_DOMAIN = 6; // 6 spørsmål x min. svar 1
const MAX_RAW_PER_DOMAIN = 30; // 6 spørsmål x maks. svar 5
const QUESTIONS_PER_DOMAIN = 6;

export function isValidAnswerValue(value: unknown): value is AnswerValue {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

/** reversert verdi = 6 - avgitt svar (Dokument 03 §9.2). */
export function scoreItem(question: Question, rawAnswer: AnswerValue): number {
  return question.reverse ? 6 - rawAnswer : rawAnswer;
}

export interface DomainRawResult {
  domain: Domain;
  raw: number;
  answeredCount: number;
  complete: boolean;
}

/**
 * Beregner råskår per domene. Et domene er `complete: false` hvis ikke alle
 * 6 spørsmål i domenet er besvart -- da er `raw` udefinert (NaN) med vilje,
 * slik at feil bruk ikke gir et stille galt tall.
 */
export function computeDomainRawScores(answers: AnswerMap): Record<Domain, DomainRawResult> {
  const byDomain: Record<Domain, Question[]> = { N: [], E: [], O: [], A: [], C: [] };
  for (const q of QUESTIONS) byDomain[q.domain].push(q);

  const result = {} as Record<Domain, DomainRawResult>;
  for (const domain of Object.keys(byDomain) as Domain[]) {
    const questions = byDomain[domain];
    let sum = 0;
    let answeredCount = 0;
    for (const q of questions) {
      const raw = answers[q.id];
      if (raw === undefined) continue;
      if (!isValidAnswerValue(raw)) {
        throw new Error(`Ugyldig svarverdi for spørsmål ${q.id}: ${String(raw)}`);
      }
      sum += scoreItem(q, raw);
      answeredCount++;
    }
    const complete = answeredCount === QUESTIONS_PER_DOMAIN;
    result[domain] = {
      domain,
      raw: complete ? sum : NaN,
      answeredCount,
      complete,
    };
  }
  return result;
}

/**
 * Ren lineær omregning råskår -> 0-100. IKKE en persentil (se filhode).
 * Klemmes til [0, 100] som en forsvarssperre mot avrundingsfeil i ytterpunktene.
 */
export function rescaleLinear(raw: number): number {
  const scaled = ((raw - MIN_RAW_PER_DOMAIN) / (MAX_RAW_PER_DOMAIN - MIN_RAW_PER_DOMAIN)) * 100;
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

export type DisplayFactor =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "stability";

const DOMAIN_TO_DISPLAY: Record<Domain, DisplayFactor> = {
  O: "openness",
  C: "conscientiousness",
  E: "extraversion",
  A: "agreeableness",
  N: "stability", // vises som Emosjonell stabilitet -- se invertering under
};

export const DISPLAY_FACTOR_LABELS_NO: Record<DisplayFactor, string> = {
  openness: "Åpenhet for erfaring",
  conscientiousness: "Planmessighet",
  extraversion: "Ekstroversjon",
  agreeableness: "Medmenneskelighet",
  stability: "Emosjonell stabilitet",
};

export interface FactorResult {
  factor: DisplayFactor;
  label: string;
  /** 0-100, allerede snudd riktig vei for visning (høy = mer av det norske faktornavnet). */
  score: number;
}

export interface TestResult {
  complete: boolean;
  /** Populert bare når complete === true. */
  factors?: FactorResult[];
  /** Domener som mangler minst ett svar -- brukes til å styre "hopp til ubesvart". */
  incompleteDomains: Domain[];
}

/**
 * Hovedfunksjon: tar rå svarkart og gir et ferdig resultatobjekt, eller
 * `complete: false` dersom testen ikke kan beregnes ennå. Kaster ALDRI en
 * gjetning -- ufullstendig data gir eksplisitt `complete: false`, aldri et
 * stille default-resultat (jf. Dokument 09 §10.3).
 */
export function computeTestResult(answers: AnswerMap): TestResult {
  const domainScores = computeDomainRawScores(answers);
  const incompleteDomains = (Object.values(domainScores) as DomainRawResult[])
    .filter((d) => !d.complete)
    .map((d) => d.domain);

  if (incompleteDomains.length > 0) {
    return { complete: false, incompleteDomains };
  }

  const factors: FactorResult[] = (Object.keys(domainScores) as Domain[]).map((domain) => {
    const { raw } = domainScores[domain];
    const scaled = rescaleLinear(raw);
    const displayFactor = DOMAIN_TO_DISPLAY[domain];
    // Emosjonell stabilitet = 100 - nevrotisisme-skår (Dokument 03 §12.1, Dokument 06).
    const score = domain === "N" ? 100 - scaled : scaled;
    return { factor: displayFactor, label: DISPLAY_FACTOR_LABELS_NO[displayFactor], score };
  });

  return { complete: true, factors, incompleteDomains: [] };
}
