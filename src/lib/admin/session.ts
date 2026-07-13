/**
 * Enkel signert admin-øktcookie. Ingen ekstern identitetstjeneste
 * nødvendig for én admin-bruker (Grunnlagsdokumentet §10.2).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "femfaktorer_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // 2 timer, deretter automatisk utlogging (§10.2)

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET er ikke satt -- generer en med `openssl rand -hex 32` og legg den i .env.local"
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionCookieValue(): string {
  const payload = JSON.stringify({ iat: Date.now() });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function isValidSessionCookieValue(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (typeof payload.iat !== "number") return false;
    return Date.now() - payload.iat < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
