/**
 * Innloggingsøkt for kontofunksjonen (v2.4) -- IKKE samme mekanisme som
 * admin-innloggingen (lib/admin/session.ts), som bruker en signert,
 * tilstandsløs cookie (fordi det kun finnes én admin). Her trenger vi å
 * kunne slå opp HVEM som er innlogget (for å hente/lagre riktig
 * kontodata) og kunne tilbakekalle en økt server-side (logg ut), så
 * cookien er et opakt, tilfeldig token som peker til en post i
 * sessionStore() (se lib/account/blobs.ts).
 */
import { randomBytes } from "node:crypto";
import { sessionStore } from "./blobs";

export const ACCOUNT_SESSION_COOKIE_NAME = "femfaktorer_konto_sesjon";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dager
export const ACCOUNT_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

interface SessionRecord {
  email: string;
  createdAt: number;
  expiresAt: number;
}

export async function createSession(email: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const record: SessionRecord = { email, createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
  await sessionStore().setJSON(token, record);
  return token;
}

export async function readSession(token: string | undefined): Promise<{ email: string } | null> {
  if (!token) return null;
  const record = (await sessionStore().get(token, { type: "json" })) as SessionRecord | null;
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    await sessionStore().delete(token);
    return null;
  }
  return { email: record.email };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await sessionStore().delete(token);
}
