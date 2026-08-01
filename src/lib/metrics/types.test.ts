import { describe, it, expect } from "vitest";
import {
  METRIC_EVENTS,
  isValidMetricEvent,
  metricsDayKey,
  durationKey,
  medianFromDurationBuckets,
  MAX_DURATION_BUCKET_MINUTES,
  type DailyMetrics,
} from "@/lib/metrics/types";

/**
 * Tester for bruksstatistikken (v2.50, kvalitetsrevisjon 31.07.2026 kveld,
 * funn 5.2).
 *
 * Tallene her er det produkteier skal ta produktbeslutninger på -- hvor i
 * trakten folk faller av, og hvor lang tid testen faktisk tar. Er de feil,
 * er de verre enn ingenting: de ser like troverdige ut uansett.
 */
describe("isValidMetricEvent -- den lukkede hendelseslisten", () => {
  it("godtar alle hendelsene som faktisk er definert", () => {
    for (const event of METRIC_EVENTS) {
      expect(isValidMetricEvent(event)).toBe(true);
    }
  });

  it("avviser ukjente navn -- dette er hele forsvaret til det åpne endepunktet", () => {
    // Endepunktet /api/metrics/event må kunne kalles uten innlogging. Uten en
    // lukket liste kunne hvem som helst fylt lagringen med vilkårlige nøkler.
    for (const ugyldig of [
      "test_startet",
      "TEST_STARTED",
      "vilkårlig_nøkkel",
      "",
      null,
      undefined,
      42,
      {},
    ]) {
      expect(isValidMetricEvent(ugyldig)).toBe(false);
    }
  });

  it("har ingen duplikater i listen", () => {
    expect(new Set(METRIC_EVENTS).size).toBe(METRIC_EVENTS.length);
  });
});

describe("metricsDayKey", () => {
  it("gir dato på formatet ÅÅÅÅ-MM-DD i UTC", () => {
    expect(metricsDayKey(new Date("2026-07-31T14:23:11Z"))).toBe("2026-07-31");
  });

  it("bruker UTC-datoen, ikke lokal dato", () => {
    // Rett før midnatt UTC hører fortsatt til den dagen -- uansett hvilken
    // tidssone maskinen som kjører koden står i.
    expect(metricsDayKey(new Date("2026-07-31T23:59:59Z"))).toBe("2026-07-31");
    expect(metricsDayKey(new Date("2026-08-01T00:00:00Z"))).toBe("2026-08-01");
  });
});

describe("durationKey -- histogrambøtter for tidsbruk", () => {
  it("lager nøkkel med tier og avrundet minutt", () => {
    expect(durationKey("full", 23)).toBe("dur:full:23");
    expect(durationKey("extended", 47.4)).toBe("dur:extended:47");
  });

  it("holder de to nivåene fra hverandre", () => {
    // Viktig: 120- og 290-testen tar naturlig ulik tid, og å blande dem ville
    // gitt en median som ikke beskriver noen av dem.
    expect(durationKey("full", 30)).not.toBe(durationKey("extended", 30));
  });

  it("samler alt over taket i én bøtte i stedet for å lage endeløst mange", () => {
    expect(durationKey("full", 61)).toBe(`dur:full:${MAX_DURATION_BUCKET_MINUTES}`);
    expect(durationKey("full", 500)).toBe(`dur:full:${MAX_DURATION_BUCKET_MINUTES}`);
  });

  it("klemmer negative verdier til 0 i stedet for å lage en ugyldig nøkkel", () => {
    expect(durationKey("full", -5)).toBe("dur:full:0");
  });
});

describe("medianFromDurationBuckets", () => {
  it("returnerer null når det ikke finnes målinger", () => {
    // Bevisst null og ikke 0: «ingen har fullført ennå» og «alle brukte null
    // minutter» er to helt ulike ting, og panelet skal kunne vise forskjellen.
    expect(medianFromDurationBuckets({}, "full")).toBeNull();
  });

  it("returnerer null når det bare finnes målinger for det ANDRE nivået", () => {
    const metrics: DailyMetrics = { "dur:extended:40": 5 };
    expect(medianFromDurationBuckets(metrics, "full")).toBeNull();
  });

  it("finner medianen i et enkelt histogram", () => {
    // Ti målinger: 5 stk på 10 min, 5 stk på 20 min. Medianen ligger på
    // overgangen -- implementasjonen skal lande deterministisk, ikke tilfeldig.
    const metrics: DailyMetrics = { "dur:full:10": 5, "dur:full:20": 5 };
    const median = medianFromDurationBuckets(metrics, "full");
    expect(median).not.toBeNull();
    expect([10, 20]).toContain(median);
  });

  it("gir bøtten der den midterste målingen faktisk ligger", () => {
    // 1 på 5 min, 8 på 15 min, 1 på 60 min -- medianen må bli 15.
    const metrics: DailyMetrics = { "dur:full:5": 1, "dur:full:15": 8, "dur:full:60": 1 };
    expect(medianFromDurationBuckets(metrics, "full")).toBe(15);
  });

  it("ignorerer nøkler som ikke hører til, og bøtter uten målinger", () => {
    const metrics: DailyMetrics = {
      test_started: 999,
      "dur:extended:50": 40,
      "dur:full:0": 0,
      "dur:full:12": 3,
    };
    expect(medianFromDurationBuckets(metrics, "full")).toBe(12);
  });

  it("lar seg ikke lure av at bøttene kommer i tilfeldig rekkefølge", () => {
    // Objektnøkler har ingen garantert numerisk rekkefølge -- funksjonen må
    // sortere selv, ellers blir medianen feil for akkurat de datasettene der
    // det betyr noe.
    const stigende: DailyMetrics = { "dur:full:5": 1, "dur:full:10": 1, "dur:full:30": 1 };
    const blandet: DailyMetrics = { "dur:full:30": 1, "dur:full:5": 1, "dur:full:10": 1 };
    expect(medianFromDurationBuckets(blandet, "full")).toBe(
      medianFromDurationBuckets(stigende, "full")
    );
  });
});
