import { describe, it, expect } from "vitest";
import {
  ALL_QUESTIONS,
  ALL_QUESTIONS_EXTENDED,
  FREE_QUESTIONS,
  assertQuestionSetIntegrity,
  assertExtendedQuestionSetIntegrity,
} from "@/data/questions";
import {
  scoreItem,
  computeDomainRawScores,
  rescaleLinear,
  computeTestResult,
  computeFacetResults,
  type AnswerMap,
} from "@/lib/scoring";

function fillDomain(
  answers: AnswerMap,
  questionSet: typeof ALL_QUESTIONS,
  domain: string,
  value: 1 | 2 | 3 | 4 | 5
) {
  for (const q of questionSet) {
    if (q.domain === domain) answers[q.id] = value;
  }
}

function fillAll(questionSet: typeof ALL_QUESTIONS, value: 1 | 2 | 3 | 4 | 5): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of questionSet) answers[q.id] = value;
  return answers;
}

describe("questions.ts (120-spørsmål-utvidelsen)", () => {
  it("har nøyaktig 120 spørsmål, 24 per domene", () => {
    const counts: Record<string, number> = {};
    for (const q of ALL_QUESTIONS) counts[q.domain] = (counts[q.domain] ?? 0) + 1;
    expect(ALL_QUESTIONS.length).toBe(120);
    expect(Object.values(counts).sort()).toEqual([24, 24, 24, 24, 24]);
  });

  it("de første 50 (FREE_QUESTIONS) har nøyaktig 10 per domene", () => {
    const counts: Record<string, number> = {};
    for (const q of FREE_QUESTIONS) counts[q.domain] = (counts[q.domain] ?? 0) + 1;
    expect(FREE_QUESTIONS.length).toBe(50);
    expect(Object.values(counts).sort()).toEqual([10, 10, 10, 10, 10]);
  });

  it("har unike id-er og unike order-verdier", () => {
    const ids = new Set(ALL_QUESTIONS.map((q) => q.id));
    const orders = new Set(ALL_QUESTIONS.map((q) => q.order));
    expect(ids.size).toBe(ALL_QUESTIONS.length);
    expect(orders.size).toBe(ALL_QUESTIONS.length);
  });

  it("inneholder ingen O6-item (Liberalism er utelatt av personvernhensyn)", () => {
    expect(ALL_QUESTIONS.some((q) => q.facet === "O6")).toBe(false);
  });

  it("assertQuestionSetIntegrity() kaster ikke feil for gjeldende datasett", () => {
    expect(() => assertQuestionSetIntegrity()).not.toThrow();
  });
});

describe("questions.ts (utvidet 290-spørsmål-versjon, v2.11)", () => {
  it("har nøyaktig 290 spørsmål, 60 per domene unntatt Åpenhet (50)", () => {
    const counts: Record<string, number> = {};
    for (const q of ALL_QUESTIONS_EXTENDED) counts[q.domain] = (counts[q.domain] ?? 0) + 1;
    expect(ALL_QUESTIONS_EXTENDED.length).toBe(290);
    expect(counts).toEqual({ N: 60, E: 60, O: 50, A: 60, C: 60 });
  });

  it("har unike id-er og en sammenhengende order-rekkefølge 1-290", () => {
    const ids = new Set(ALL_QUESTIONS_EXTENDED.map((q) => q.id));
    const orders = ALL_QUESTIONS_EXTENDED.map((q) => q.order).sort((a, b) => a - b);
    expect(ids.size).toBe(290);
    expect(orders).toEqual(Array.from({ length: 290 }, (_, i) => i + 1));
  });

  it("de første 120 (etter order) er identiske med ALL_QUESTIONS -- utvidelsen endrer ikke 120-testen", () => {
    const first120Ids = ALL_QUESTIONS_EXTENDED.slice(0, 120)
      .map((q) => q.id)
      .sort();
    const allQuestionsIds = ALL_QUESTIONS.map((q) => q.id)
      .slice()
      .sort();
    expect(first120Ids).toEqual(allQuestionsIds);
  });

  it("inneholder ingen O6-item (Liberalism er utelatt av personvernhensyn)", () => {
    expect(ALL_QUESTIONS_EXTENDED.some((q) => q.facet === "O6")).toBe(false);
  });

  it("assertExtendedQuestionSetIntegrity() kaster ikke feil for gjeldende datasett", () => {
    expect(() => assertExtendedQuestionSetIntegrity()).not.toThrow();
  });
});

describe("scoreItem (reversert skåring, Dokument 03 §9.2)", () => {
  it("returnerer rå verdi uendret for ikke-reverserte item", () => {
    const q = ALL_QUESTIONS.find((x) => !x.reverse)!;
    expect(scoreItem(q, 4)).toBe(4);
  });

  it("reverserer korrekt (6 - svar) dersom et item er markert reverse", () => {
    const q = ALL_QUESTIONS.find((x) => x.reverse)!;
    expect(scoreItem(q, 1)).toBe(5);
    expect(scoreItem(q, 5)).toBe(1);
    expect(scoreItem(q, 3)).toBe(3);
  });
});

describe("computeDomainRawScores", () => {
  it("markerer et domene som ufullstendig dersom ikke alle spørsmål i settet er besvart", () => {
    const answers: AnswerMap = {};
    fillDomain(answers, FREE_QUESTIONS, "N", 3);
    const firstN = FREE_QUESTIONS.find((q) => q.domain === "N")!;
    delete answers[firstN.id];

    const result = computeDomainRawScores(answers, FREE_QUESTIONS);
    expect(result.N.complete).toBe(false);
    expect(result.N.answeredCount).toBe(9); // 10 - 1
    expect(result.N.expectedCount).toBe(10);
  });

  it("gir riktig råskår-sum for et fullstendig domene (gratis-settet, 10 spørsmål)", () => {
    const answers: AnswerMap = {};
    fillDomain(answers, FREE_QUESTIONS, "E", 4);
    const result = computeDomainRawScores(answers, FREE_QUESTIONS);
    expect(result.E.complete).toBe(true);
    expect(result.E.raw).toBe(40); // 10 spørsmål x 4
  });

  it("gir riktig råskår-sum for et fullstendig domene (hele settet, 24 spørsmål)", () => {
    const answers: AnswerMap = {};
    fillDomain(answers, ALL_QUESTIONS, "E", 4);
    const result = computeDomainRawScores(answers, ALL_QUESTIONS);
    expect(result.E.complete).toBe(true);
    expect(result.E.raw).toBe(96); // 24 spørsmål x 4
  });

  it("kaster feil ved ugyldig svarverdi (f.eks. 0 eller 6) i stedet for å stille inn et standardsvar", () => {
    const firstQuestion = ALL_QUESTIONS[0]!;
    const answers: AnswerMap = { [firstQuestion.id]: 0 as never };
    expect(() => computeDomainRawScores(answers, ALL_QUESTIONS)).toThrow();
  });
});

describe("rescaleLinear (lineær 0-100-omregning, besluttet v1.7 -- IKKE en persentil)", () => {
  it("gir 0 for minimum råskår, 100 for maksimum, 50 for midtpunktet -- for 10 spørsmål", () => {
    expect(rescaleLinear(10, 10)).toBe(0);
    expect(rescaleLinear(50, 10)).toBe(100);
    expect(rescaleLinear(30, 10)).toBe(50);
  });

  it("gir samme oppførsel for 24 spørsmål (hele testen)", () => {
    expect(rescaleLinear(24, 24)).toBe(0);
    expect(rescaleLinear(120, 24)).toBe(100);
    expect(rescaleLinear(72, 24)).toBe(50);
  });

  it("klemmer verdier utenfor forventet område til [0, 100]", () => {
    expect(rescaleLinear(0, 10)).toBe(0);
    expect(rescaleLinear(1000, 10)).toBe(100);
  });
});

describe("computeTestResult -- gratis-tier (de første 50)", () => {
  it("gir complete: false og lister ufullstendige domener når testen ikke er ferdig", () => {
    const result = computeTestResult({}, FREE_QUESTIONS, "free");
    expect(result.complete).toBe(false);
    expect(result.incompleteDomains.sort()).toEqual(["A", "C", "E", "N", "O"]);
  });

  it("beregner alle fem faktorer og setter tier: 'free' når de første 50 er fullført", () => {
    const result = computeTestResult(fillAll(FREE_QUESTIONS, 3), FREE_QUESTIONS, "free");
    expect(result.complete).toBe(true);
    expect(result.tier).toBe("free");
    expect(result.factors).toHaveLength(5);
    for (const f of result.factors!) {
      expect(f.score).toBe(50);
    }
  });
});

describe("computeTestResult -- full test (alle 120)", () => {
  it("beregner alle fem faktorer og setter tier: 'full' når alle 120 er fullført", () => {
    const result = computeTestResult(fillAll(ALL_QUESTIONS, 3), ALL_QUESTIONS, "full");
    expect(result.complete).toBe(true);
    expect(result.tier).toBe("full");
    for (const f of result.factors!) {
      expect(f.score).toBe(50);
    }
  });

  it("emosjonell stabilitet er INVERTERT nevrotisisme (Dokument 03 §12.1)", () => {
    const answers = fillAll(ALL_QUESTIONS, 3);
    fillDomain(answers, ALL_QUESTIONS, "N", 5);
    const result = computeTestResult(answers, ALL_QUESTIONS, "full");
    const stability = result.factors!.find((f) => f.factor === "stability")!;
    expect(stability.score).toBe(0);

    const answersCalm = fillAll(ALL_QUESTIONS, 3);
    fillDomain(answersCalm, ALL_QUESTIONS, "N", 1);
    const resultCalm = computeTestResult(answersCalm, ALL_QUESTIONS, "full");
    const stabilityCalm = resultCalm.factors!.find((f) => f.factor === "stability")!;
    expect(stabilityCalm.score).toBe(100);
  });

  it("bruker faste norske faktornavn (Dokument 01 §2.1)", () => {
    const result = computeTestResult(fillAll(ALL_QUESTIONS, 3), ALL_QUESTIONS, "full");
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

describe("computeTestResult -- utvidet test (alle 290, v2.11)", () => {
  it("beregner alle fem faktorer og setter tier: 'extended' når alle 290 er fullført", () => {
    const result = computeTestResult(fillAll(ALL_QUESTIONS_EXTENDED, 3), ALL_QUESTIONS_EXTENDED, "extended");
    expect(result.complete).toBe(true);
    expect(result.tier).toBe("extended");
    for (const f of result.factors!) {
      expect(f.score).toBe(50);
    }
  });
});

describe("computeFacetResults -- utvidet test (v2.11)", () => {
  it("gir 29 fasetter med 10 spørsmål bak hver (unntatt Åpenhet-fasettene, som har 10 hver de også)", () => {
    const results = computeFacetResults(fillAll(ALL_QUESTIONS_EXTENDED, 3), ALL_QUESTIONS_EXTENDED);
    expect(results).toHaveLength(29);
    expect(results.some((f) => f.facet === "O6")).toBe(false);
  });
});

describe("computeFacetResults (v2.1 -- fasettskår for stortesten)", () => {
  it("gir 29 fasetter (O6 utelatt) når alle 120 spørsmål er besvart likt", () => {
    const results = computeFacetResults(fillAll(ALL_QUESTIONS, 3), ALL_QUESTIONS);
    expect(results).toHaveLength(29);
    expect(results.some((f) => f.facet === "O6")).toBe(false);
  });

  it("utelater en fasett helt dersom den ikke er fullt besvart -- gjetter aldri", () => {
    const answers = fillAll(ALL_QUESTIONS, 3);
    const firstN1 = ALL_QUESTIONS.find((q) => q.facet === "N1")!;
    delete answers[firstN1.id];
    const results = computeFacetResults(answers, ALL_QUESTIONS);
    expect(results.some((f) => f.facet === "N1")).toBe(false);
    expect(results).toHaveLength(28);
  });

  it("N-fasetter speilvendes til samme retning som hoveddomenet (Emosjonell stabilitet)", () => {
    const highN = fillAll(ALL_QUESTIONS, 5); // svarer 5 på alt, inkl. N -- høy nevrotisisme
    const resultsHighN = computeFacetResults(highN, ALL_QUESTIONS);
    const n1High = resultsHighN.find((f) => f.facet === "N1")!;
    expect(n1High.score).toBe(0); // høy nevrotisisme -> lav emosjonell stabilitet

    const lowN = fillAll(ALL_QUESTIONS, 1);
    const resultsLowN = computeFacetResults(lowN, ALL_QUESTIONS);
    const n1Low = resultsLowN.find((f) => f.facet === "N1")!;
    expect(n1Low.score).toBe(100);
  });

  it("gir 5 O-fasetter for det fulle settet (O1-O5, O6 er strukturelt utelatt)", () => {
    const results = computeFacetResults(fillAll(ALL_QUESTIONS, 3), ALL_QUESTIONS);
    const oFacets = results.filter((f) => f.domain === "O").map((f) => f.facet).sort();
    expect(oFacets).toEqual(["O1", "O2", "O3", "O4", "O5"]);
  });
});
