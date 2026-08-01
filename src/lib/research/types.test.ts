import { describe, it, expect } from "vitest";
import {
  isoWeek,
  clampResponseMs,
  isValidResearchAnswerValue,
  isValidResearchDevice,
} from "@/lib/research/types";

/**
 * Tester for det anonyme forskningsdatagrunnlaget (v2.50, kvalitetsrevisjon
 * 31.07.2026 kveld, funn 5.2 og 10.1).
 *
 * HVORFOR NETTOPP isoWeek() ER VERDT Å TESTE GRUNDIG
 * Den stempler HVER eneste innsamlede post, og den er en håndskrevet
 * ISO-8601-implementasjon fordi JavaScript ikke har ukenummer innebygd.
 * Feiler den, får vi ikke en synlig feil -- vi får data som ser helt riktige
 * ut, men der poster havner i feil uke. Det ville forurenset enhver analyse
 * av utvikling over tid uten at noen oppdaget det.
 *
 * ISO-regelen som testes: uke 1 er uken som inneholder årets første torsdag.
 * Konsekvensen er at de første dagene i januar kan tilhøre SISTE uke i året
 * før, og at de siste dagene i desember kan tilhøre uke 1 i året etter. Det
 * er nettopp de kanttilfellene som er lette å få galt.
 */
describe("isoWeek -- ordinære tilfeller", () => {
  it("gir riktig uke midt i året", () => {
    // 31. juli 2026 er en fredag i uke 31.
    expect(isoWeek(new Date("2026-07-31T12:00:00Z"))).toBe("2026-W31");
  });

  it("padder ukenummer under 10 med ledende null", () => {
    // 8. januar 2026 er en torsdag i uke 2.
    expect(isoWeek(new Date("2026-01-08T12:00:00Z"))).toBe("2026-W02");
  });

  it("gir samme uke for alle dager mandag til søndag i samme ISO-uke", () => {
    // Uke 31 i 2026: mandag 27. juli til søndag 2. august.
    const dager = [
      "2026-07-27",
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
    ];
    for (const d of dager) {
      expect(isoWeek(new Date(`${d}T12:00:00Z`))).toBe("2026-W31");
    }
  });

  it("går over i ny uke på mandagen, ikke på søndagen", () => {
    // Søndag 2. august 2026 hører til uke 31; mandag 3. august til uke 32.
    expect(isoWeek(new Date("2026-08-02T12:00:00Z"))).toBe("2026-W31");
    expect(isoWeek(new Date("2026-08-03T12:00:00Z"))).toBe("2026-W32");
  });
});

describe("isoWeek -- kanttilfeller rundt årsskiftet", () => {
  it("1. januar 2026 (torsdag) tilhører uke 1 i 2026", () => {
    expect(isoWeek(new Date("2026-01-01T12:00:00Z"))).toBe("2026-W01");
  });

  it("1. januar 2027 (fredag) tilhører fortsatt uke 53 i 2026", () => {
    // 2026 er et ISO-år med 53 uker. De første dagene i 2027 faller derfor
    // tilbake på 2026 -- den klassiske fellen i ukeberegning.
    expect(isoWeek(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53");
  });

  it("31. desember 2019 (tirsdag) tilhører uke 1 i 2020", () => {
    // Motsatt retning: en dato i desember som tilhører NESTE års uke 1.
    expect(isoWeek(new Date("2019-12-31T12:00:00Z"))).toBe("2020-W01");
  });

  it("4. januar er alltid i uke 1, uansett ukedag", () => {
    // Følger direkte av ISO-definisjonen, og er derfor en god invariant.
    for (const year of [2021, 2022, 2023, 2024, 2025, 2026, 2027]) {
      expect(isoWeek(new Date(`${year}-01-04T12:00:00Z`))).toBe(`${year}-W01`);
    }
  });

  it("gir uke 53 for år som faktisk har 53 uker, og aldri uke 54", () => {
    // 2020 og 2026 er 53-ukers ISO-år; 2025 er det ikke.
    expect(isoWeek(new Date("2020-12-31T12:00:00Z"))).toBe("2020-W53");
    expect(isoWeek(new Date("2026-12-31T12:00:00Z"))).toBe("2026-W53");
    // Ingen dato skal noen gang gi uke 54.
    for (let dag = 1; dag <= 31; dag++) {
      const uke = isoWeek(new Date(`2026-12-${String(dag).padStart(2, "0")}T12:00:00Z`));
      expect(uke.endsWith("W54")).toBe(false);
    }
  });

  it("påvirkes ikke av tidspunkt på døgnet (sommertid skal ikke flytte datoen)", () => {
    // Filhodet sier eksplisitt at datoen normaliseres til midnatt UTC nettopp
    // for at dette skal holde. Da bør det også testes.
    expect(isoWeek(new Date("2026-07-31T00:00:00Z"))).toBe("2026-W31");
    expect(isoWeek(new Date("2026-07-31T23:59:59Z"))).toBe("2026-W31");
  });
});

describe("clampResponseMs", () => {
  it("beholder en vanlig svartid uendret", () => {
    expect(clampResponseMs(4200)).toBe(4200);
  });

  it("runder av til hele millisekunder", () => {
    expect(clampResponseMs(1234.6)).toBe(1235);
  });

  it("klemmer en fane som har stått åpen over natten ned til taket", () => {
    // Poenget med taket: 14 timers "betenkningstid" er ikke et signal, det er
    // støy som ville druknet den faktiske variasjonen mellom ledd.
    const fjortenTimer = 14 * 60 * 60 * 1000;
    expect(clampResponseMs(fjortenTimer)).toBe(10 * 60 * 1000);
  });

  it("returnerer null for verdier som ikke gir mening", () => {
    expect(clampResponseMs(0)).toBeNull();
    expect(clampResponseMs(-5)).toBeNull();
    expect(clampResponseMs(Number.NaN)).toBeNull();
    expect(clampResponseMs(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("validering av innsendte verdier", () => {
  it("godtar kun heltallene 1-5 som svarverdi", () => {
    for (const gyldig of [1, 2, 3, 4, 5]) {
      expect(isValidResearchAnswerValue(gyldig)).toBe(true);
    }
    for (const ugyldig of [0, 6, -1, 2.5, "3", null, undefined, {}]) {
      expect(isValidResearchAnswerValue(ugyldig)).toBe(false);
    }
  });

  it("godtar kun de fire kjente enhetskategoriene", () => {
    for (const gyldig of ["mobil", "nettbrett", "desktop", "ukjent"]) {
      expect(isValidResearchDevice(gyldig)).toBe(true);
    }
    for (const ugyldig of ["Mobil", "phone", "", null, 1]) {
      expect(isValidResearchDevice(ugyldig)).toBe(false);
    }
  });
});
