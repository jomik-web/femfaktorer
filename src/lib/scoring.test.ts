import { describe, it, expect } from "vitest";
import { QUESTIONS } from "@/data/questions";
import {
  scoreItem,
  computeDomainRawScores,
  rescaleLinear,
  computeTestResult,
  type AnswerMap,
} from "@/lib/scoring";

function fillDomain(answers: AnswerMap, domain: string, value: 1 | 2 | 3 | 4 | 5) {
  for (const q of QUESTIONS) {
    if (q.domain === domain) answers[q.id] = value;
  }
}

function fillAll(value: 1 | 2 | 3 | 4 | 5): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) answers[q.id] = value;
  return answers;
}

describe("questions.ts", () => {
  it("har nøyaktig 30 spørsmål, 6 per domene", () => {
    const counts: Record<string, number> = {};
    for (const q of QUESTIONS) counts[q.domain] = (counts[q.domain] ?? 0) + 1;
    expect(QUESTIONS.length).toBe(30);
    expect(Object.values(counts)).toEqual([6, 6, 6, 6, 6]);
  });

  it("har unike id-er", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(QUESTIONS.length);
  });
});

describe("scoreItem (reversert skåring, Dokument 03 §9.2)", () => {
  it("returnerer rå verdi uendret for ikke-reverserte item", () => {
    const q = QUESTIONS[0];
    expect(q.reverse).toBe(false);
    expect(scoreItem(q, 4)).toBe(4);
  });

  it("reverserer korrekt (6 - svar) dersom et item er markert reverse", () => {
    const reversedQuestion = { ...QUESTIONS[0], reverse: true };
    expect(scoreItem(reversedQuestion, 1)).toBe(5);
    expect(scoreItem(reversedQuestion, 5)).toBe(1);
    expect(scoreItem(reversedQuestion, 3)).toBe(3);
  });
});

describe("computeDomainRawScores", () => {
  it("markerer et domene som ufullstendig dersom ikke alle 6 er besvart", () => {
    const answers: AnswerMap = {};
    fillDomain(answers, "N", 3);
    // Fjern ett svar i N-domenet igjen
    const firstN = QUESTIONS.find((q) => q.domain === "N")!;
    delete answers[firstN.id];

    const result = computeDomainRawScores(answers);
    expect(result.N.complete).toBe(false);
    expect(result.N.answeredCount).toBe(5);
  });

  it("gir riktig råskår-sum for et fullstendig domene", () => {
    const answers: AnswerMap = {};
    fillDomain(answers, "E", 4);
    const result = computeDomainRawScores(answers);
    expect(result.E.complete).toBe(true);
    expect(result.E.raw).toBe(24); // 6 spørsmål x 4
  });

  it("kaster feil ved ugyldig svarverdi (f.eks. 0 eller 6) i stedet for å stille inn et standardsvar", () => {
    const answers: AnswerMap = { [QUESTIONS[0].id]: 0 as never };
    expect(() => computeDomainRawScores(answers)).toThrow();
  });
});

describe("rescaleLinear (lineær 0-100-omregning, besluttet v1.7 -- IKKE en persentil)", () => {
  it("gir 0 for minimum råskår (6)", () => {
    expect(rescaleLinear(6)).toBe(0);
  });
  it("gir 100 for maksimum råskår (30)", () => {
    expect(rescaleLinear(30)).toBe(100);
  });
  it("gir 50 for midtpunktet (18)", () => {
    expect(rescaleLinear(18)).toBe(50);
  });
  it("klemmer verdier utenfor forventet område til [0, 100]", () => {
    expect(rescaleLinear(0)).toBe(0);
    expect(rescaleLinear(100)).toBe(100);
  });
});

describe("computeTestResult", () => {
  it("gir complete: false og lister ufullstendige domener når testen ikke er ferdig", () => {
    const result = computeTestResult({});
    expect(result.complete).toBe(false);
    expect(result.incompleteDomains.sort()).toEqual(["A", "C", "E", "N", "O"]);
  });

  it("beregner alle fem faktorer når testen er fullført med nøytrale svar (3)", () => {
    const result = computeTestResult(fillAll(3));
    expect(result.complete).toBe(true);
    expect(result.factors).toHaveLength(5);
    for (const f of result.factors!) {
      expect(f.score).toBe(50);
    }
  });

  it("emosjonell stabilitet er INVERTERT nevrotisisme (Dokument 03 §12.1)", () => {
    // Alle N-spørsmål besvart med 5 ("helt enig i bekymring/sinne/etc.")
    // skal gi en LAV emosjonell stabilitet-skår, ikke høy.
    const answers = fillAll(3);
    fillDomain(answers, "N", 5);
    const result = computeTestResult(answers);
    const stability = result.factors!.find((f) => f.factor === "stability")!;
    expect(stability.score).toBe(0);

    const answersCalm = fillAll(3);
    fillDomain(answersCalm, "N", 1);
    const resultCalm = computeTestResult(answersCalm);
    const stabilityCalm = resultCalm.factors!.find((f) => f.factor === "stability")!;
    expect(stabilityCalm.score).toBe(100);
  });

  it("bruker faste norske faktornavn (Dokument 01 §2.1)", () => {
    const result = computeTestResult(fillAll(3));
    const labels = result.factors!.map((f) => f.label).sort();
    expect(labels).toEqual(
      [
        "Emosjonell stabilitet",
        "Ekstroversjon",
        "Medmenneskelighet",
        "Planmessighet",
        "Åpenhet for erfaring",
      ].sort()
    );
  });
});
