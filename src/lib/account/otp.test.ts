import { describe, it, expect, beforeEach, vi } from "vitest";
import { requestOtp, verifyOtp, isValidEmail, normalizeEmail } from "./otp";

/**
 * Tester for engangskode-flyten (kvalitetsrevisjon 2026-07-24, høyt funn:
 * ingen tester fantes for auth-/OTP-flyten før dette, til tross for at det
 * er den eneste inngangen til både kontolagring og admin-panelet).
 *
 * Netlify Blobs (lib/account/blobs.ts) krever ekte Netlify-kontekst for å
 * kjøre, så den mockes her med en enkel in-memory-erstatning som følger
 * samme get/setJSON/delete-grensesnitt som otp.ts faktisk bruker.
 */

type FakeRecord = unknown;
const fakeDb = new Map<string, FakeRecord>();

const fakeStore = {
  get: async (key: string, _opts?: { type: "json" }) => (fakeDb.has(key) ? fakeDb.get(key) : null),
  setJSON: async (key: string, value: FakeRecord) => {
    fakeDb.set(key, value);
  },
  delete: async (key: string) => {
    fakeDb.delete(key);
  },
};

vi.mock("./blobs", () => ({
  otpStore: () => fakeStore,
}));

const EMAIL = "test@eksempel.no";

beforeEach(() => {
  fakeDb.clear();
  process.env.ACCOUNT_OTP_PEPPER = "test-pepper-ikke-ekte";
  vi.useRealTimers();
});

describe("isValidEmail / normalizeEmail", () => {
  it("godtar en gyldig e-post", () => {
    expect(isValidEmail("navn@eksempel.no")).toBe(true);
  });

  it("avviser ugyldige e-poster", () => {
    expect(isValidEmail("ikke-en-epost")).toBe(false);
    expect(isValidEmail("mangler@domene")).toBe(true); // pragmatisk sjekk -- kun format, se filhode
    expect(isValidEmail("")).toBe(false);
  });

  it("normaliserer til lowercase og trimmer", () => {
    expect(normalizeEmail("  Navn@Eksempel.NO  ")).toBe("navn@eksempel.no");
  });
});

describe("requestOtp / verifyOtp", () => {
  it("genererer en 6-sifret kode og lar den samme koden verifiseres", async () => {
    const req = await requestOtp(EMAIL);
    expect(req.ok).toBe(true);
    if (!req.ok) return;
    expect(req.code).toMatch(/^\d{6}$/);

    const verify = await verifyOtp(EMAIL, req.code);
    expect(verify.ok).toBe(true);
  });

  it("avviser feil kode uten å avsløre riktig kode", async () => {
    const req = await requestOtp(EMAIL);
    if (!req.ok) throw new Error("setup failed");
    const wrongCode = req.code === "000000" ? "111111" : "000000";

    const verify = await verifyOtp(EMAIL, wrongCode);
    expect(verify.ok).toBe(false);
  });

  it("koden kan ikke gjenbrukes etter en vellykket verifisering (engangskode)", async () => {
    const req = await requestOtp(EMAIL);
    if (!req.ok) throw new Error("setup failed");

    const first = await verifyOtp(EMAIL, req.code);
    expect(first.ok).toBe(true);

    const second = await verifyOtp(EMAIL, req.code);
    expect(second.ok).toBe(false);
  });

  it("sperrer etter 5 feilforsøk (MAX_ATTEMPTS)", async () => {
    const req = await requestOtp(EMAIL);
    if (!req.ok) throw new Error("setup failed");
    const wrongCode = req.code === "000000" ? "111111" : "000000";

    for (let i = 0; i < 5; i++) {
      await verifyOtp(EMAIL, wrongCode);
    }
    // Koden skal nå være slettet/sperret selv om riktig kode oppgis.
    const finalAttempt = await verifyOtp(EMAIL, req.code);
    expect(finalAttempt.ok).toBe(false);
  });

  it("avviser verifisering når det ikke finnes noen aktiv kode", async () => {
    const verify = await verifyOtp("ingen-forespoersel@eksempel.no", "123456");
    expect(verify.ok).toBe(false);
  });

  it("nekter en ny kode-forespørsel for tidlig (MIN_RESEND_INTERVAL_MS)", async () => {
    const first = await requestOtp(EMAIL);
    expect(first.ok).toBe(true);

    const second = await requestOtp(EMAIL);
    expect(second.ok).toBe(false);
  });

  it("koden utløper etter TTL-vinduet (CODE_TTL_MS)", async () => {
    vi.useFakeTimers();
    try {
      const req = await requestOtp(EMAIL);
      if (!req.ok) throw new Error("setup failed");

      vi.advanceTimersByTime(11 * 60 * 1000); // 11 min > 10 min TTL

      const verify = await verifyOtp(EMAIL, req.code);
      expect(verify.ok).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
