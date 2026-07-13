/**
 * Engangskode (OTP) for kontoinnlogging via e-post -- v2.4. Se filhode i
 * lib/account/blobs.ts for kontekst. Ingen passord noe sted -- eierskap til
 * e-postadressen ER innloggingen, samme mønster som f.eks. Slack/Notion sin
 * "magic code"-innlogging.
 */
import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import { otpStore } from "./blobs";

const CODE_TTL_MS = 1000 * 60 * 10; // 10 minutter
const MAX_ATTEMPTS = 5;
const MIN_RESEND_INTERVAL_MS = 1000 * 60; // minst 1 min mellom hver ny kode til samme e-post

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Pragmatisk format-sjekk -- ekte verifisering skjer ved at koden faktisk mottas og tastes inn. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function hashCode(email: string, code: string): string {
  const pepper = process.env.ACCOUNT_OTP_PEPPER;
  if (!pepper) throw new Error("ACCOUNT_OTP_PEPPER er ikke satt -- se .env.example.");
  return createHash("sha256").update(`${pepper}:${email}:${code}`).digest("hex");
}

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  requestedAt: number;
}

export type RequestOtpResult = { ok: true; code: string } | { ok: false; error: string };

/** Genererer og lagrer en ny 6-sifret kode for e-posten. Returnerer klartekstkoden slik at den kan sendes på e-post (se api/account/request-code). Lagres selv ALDRI i klartekst -- kun en saltet hash. */
export async function requestOtp(email: string): Promise<RequestOtpResult> {
  const store = otpStore();
  const existing = (await store.get(email, { type: "json" })) as OtpRecord | null;
  if (existing && Date.now() - existing.requestedAt < MIN_RESEND_INTERVAL_MS) {
    return { ok: false, error: "Du kan be om en ny kode om litt." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const record: OtpRecord = {
    codeHash: hashCode(email, code),
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
    requestedAt: Date.now(),
  };
  await store.setJSON(email, record);
  return { ok: true, code };
}

export type VerifyOtpResult = { ok: true } | { ok: false; error: string };

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const store = otpStore();
  const existing = (await store.get(email, { type: "json" })) as OtpRecord | null;
  if (!existing) {
    return { ok: false, error: "Fant ingen aktiv kode for denne e-postadressen. Be om en ny kode." };
  }
  if (Date.now() > existing.expiresAt) {
    await store.delete(email);
    return { ok: false, error: "Koden er utløpt. Be om en ny." };
  }
  if (existing.attempts >= MAX_ATTEMPTS) {
    await store.delete(email);
    return { ok: false, error: "For mange feilforsøk. Be om en ny kode." };
  }

  const candidate = Buffer.from(hashCode(email, code), "hex");
  const stored = Buffer.from(existing.codeHash, "hex");
  const match = candidate.length === stored.length && timingSafeEqual(candidate, stored);

  if (!match) {
    await store.setJSON(email, { ...existing, attempts: existing.attempts + 1 });
    return { ok: false, error: "Feil kode. Prøv igjen." };
  }

  await store.delete(email); // engangskode -- slettes umiddelbart ved bruk, kan ikke gjenbrukes
  return { ok: true };
}
