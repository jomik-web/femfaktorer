/**
 * Skåringsmotor for testen. Autoritativ kilde for reglene: Dokument 03
 * (Teststruktur, skåring og resultatformidling, v1.1) §9-§12.
 *
 * Grunnregler som IKKE skal brytes (se §9.3, Dokument 09 §10.3):
 *  - Manglende svar erstattes ALDRI med et nøytralt standardsvar (f.eks. 3).
 *  - Et resultat skal ikke kunne beregnes for en ufullført test.
 *  - Reversert skåring: reversert verdi = 6 - avgitt svar.
 *
 * Om 0-100-skalaen (besluttet v1.7, se Grunnlagsdokumentet §7 og Dokument 03 §10.4):
 * dette er EN REN LINEÆR OMREGNING av råskår, IKKE en normbasert persentil.
 * Riktig normdata finnes ikke ennå (se Dokument 06 §9 for hvilket datasett som
 * skal brukes når normer bygges). Tekst i grensesnittet skal derfor ALDRI
 * hevde sammenligning med andre brukere.
 *
 * TO-TRINNS TEST (v2.0, se Grunnlagsdokumentet og Dokument 03 §7/§20):
 * spørsmålssettet har nå to gyldige "fullførings-punkter" -- de første 50
 * spørsmålene (foreløpig resultat) og alle 120 (presist resultat). Antall
 * spørsmål per domene er derfor IKKE lenger en fast konstant -- det regnes ut
 * fra hvilket spørsmålssett (`questionSet`) som faktisk ble brukt, slik at
 * samme skåringslogikk fungerer korrekt for begge trinn.
 */

import type { Domain, OptionalQuestion, Question } from "@/data/questions";

export type AnswerValue = 1 | 2 | 3 | 4 | 5;

/** Svar nøkles på spørsmålets stabile id (se questions.ts). */
export type AnswerMap = Partial<Record<string, AnswerValue>>;

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
  /** Antall spørsmål i DETTE domenet i det gjeldende spørsmålssettet. */
  expectedCount: number;
  complete: boolean;
}

/**
 * Beregner råskår per domene for et gitt spørsmålssett (enten `FREE_QUESTIONS`
 * eller `ALL_QUESTIONS`, se questions.ts). Et domene er `complete: false` hvis
 * ikke alle spørsmål i domenet -- for DETTE settet -- er besvart. Da er `raw`
 * udefinert (NaN) med vilje, slik at feil bruk ikke gir et stille galt tall.
 */
export function computeDomainRawScores(
  answers: AnswerMap,
  questionSet: readonly Question[]
): Record<Domain, DomainRawResult> {
  const byDomain: Record<Domain, Question[]> = { N: [], E: [], O: [], A: [], C: [] };
  for (const q of questionSet) byDomain[q.domain].push(q);

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
    const expectedCount = questions.length;
    const complete = answeredCount === expectedCount;
    result[domain] = {
      domain,
      raw: complete ? sum : NaN,
      answeredCount,
      expectedCount,
      complete,
    };
  }
  return result;
}

/**
 * Ren lineær omregning råskår -> 0-100. IKKE en persentil (se filhode).
 * `itemCount` er antall spørsmål som faktisk inngår i domenet for dette
 * spørsmålssettet -- min. mulig råskår er `itemCount x 1`, maks er `itemCount x 5`.
 * Klemmes til [0, 100] som en forsvarssperre mot avrundingsfeil i ytterpunktene.
 */
export function rescaleLinear(raw: number, itemCount: number): number {
  const min = itemCount * 1;
  const max = itemCount * 5;
  const scaled = ((raw - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

export type DisplayFactor =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "stability";

export const DOMAIN_TO_DISPLAY: Record<Domain, DisplayFactor> = {
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

export type ResultTier = "free" | "full";

export interface TestResult {
  complete: boolean;
  /** Populert bare når complete === true. */
  factors?: FactorResult[];
  /** "free" = basert på de første 50 (foreløpig), "full" = alle 120 (presist). */
  tier?: ResultTier;
  /** Domener som mangler minst ett svar -- brukes til å styre "hopp til ubesvart". */
  incompleteDomains: Domain[];
}

/**
 * Hovedfunksjon: tar rå svarkart og et spørsmålssett (FREE_QUESTIONS eller
 * ALL_QUESTIONS, se questions.ts), og gir et ferdig resultatobjekt -- eller
 * `complete: false` dersom testen ikke kan beregnes ennå for DETTE settet.
 * Kaster ALDRI en gjetning -- ufullstendig data gir eksplisitt
 * `complete: false`, aldri et stille default-resultat (jf. Dokument 09 §10.3).
 */
export function computeTestResult(
  answers: AnswerMap,
  questionSet: readonly Question[],
  tier: ResultTier
): TestResult {
  const domainScores = computeDomainRawScores(answers, questionSet);
  const incompleteDomains = (Object.values(domainScores) as DomainRawResult[])
    .filter((d) => !d.complete)
    .map((d) => d.domain);

  if (incompleteDomains.length > 0) {
    return { complete: false, incompleteDomains };
  }

  const factors: FactorResult[] = (Object.keys(domainScores) as Domain[]).map((domain) => {
    const { raw, expectedCount } = domainScores[domain];
    const scaled = rescaleLinear(raw, expectedCount);
    const displayFactor = DOMAIN_TO_DISPLAY[domain];
    // Emosjonell stabilitet = 100 - nevrotisisme-skår (Dokument 03 §12.1, Dokument 06).
    const score = domain === "N" ? 100 - scaled : scaled;
    return { factor: displayFactor, label: DISPLAY_FACTOR_LABELS_NO[displayFactor], score };
  });

  return { complete: true, factors, tier, incompleteDomains: [] };
}

export interface FacetResult {
  /** IPIP-fasettkode, f.eks. "N1". */
  facet: string;
  /** Engelsk IPIP-navn (f.eks. "Anxiety") -- se facetInterpretations.ts for norsk visningsnavn og tolkningstekst. */
  facetName: string;
  domain: Domain;
  /** 0-100, allerede snudd riktig vei for visning (N-fasetter speilvendes, som for hoveddomenet). */
  score: number;
}

/**
 * Beregner skår per FASETT (underkategori) -- kun meningsfullt for den fulle
 * testen (120 spørsmål, 4-5 item per fasett). Fasettvisning var opprinnelig
 * utsatt til "fase 2" (Grunnlagsdokumentet §7.1, Dokument 03 §7/§20.1), men
 * produkteier har nå bedt om at det vises i stortesten (v2.1).
 *
 * N-fasetter regnes om til samme visningsretning som hoveddomenet
 * (Emosjonell stabilitet = 100 - nevrotisisme), slik at bånd og tekst
 * samsvarer med hvordan hovedfaktoren allerede presenteres.
 *
 * En fasett som ikke er fullt besvart utelates helt fra resultatet -- aldri
 * en gjetning (samme prinsipp som computeTestResult, jf. Dokument 09 §10.3).
 */
export function computeFacetResults(
  answers: AnswerMap,
  questionSet: readonly Question[]
): FacetResult[] {
  const byFacet = new Map<string, Question[]>();
  for (const q of questionSet) {
    const list = byFacet.get(q.facet) ?? [];
    list.push(q);
    byFacet.set(q.facet, list);
  }

  const results: FacetResult[] = [];
  for (const [facet, questions] of byFacet) {
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
    if (answeredCount !== questions.length) continue; // ikke fullført -- utelates, ingen gjetning

    const scaled = rescaleLinear(sum, questions.length);
    const domain = questions[0].domain;
    const score = domain === "N" ? 100 - scaled : scaled;
    results.push({ facet, facetName: questions[0].facetName, domain, score });
  }

  return results.sort((a, b) => a.facet.localeCompare(b.facet));
}

/**
 * Skårer den valgfrie O6-tilleggsseksjonen (se questions.ts) HELT ISOLERT --
 * blandes ALDRI inn i de fem hovedfaktorskårene. Krever alle 4 item besvart.
 * Returnerer `null` dersom seksjonen ikke er fullført (aldri en gjetning).
 */
export function computeOptionalO6Score(
  answers: AnswerMap,
  questions: readonly OptionalQuestion[]
): number | null {
  let sum = 0;
  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined || !isValidAnswerValue(raw)) return null;
    sum += q.reverse ? 6 - raw : raw;
  }
  return rescaleLinear(sum, questions.length);
}
