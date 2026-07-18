import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";
import { normalizeAccountHistory } from "@/lib/account/types";

export const runtime = "nodejs";

/**
 * Henter det innloggede resultatet (brukt av /logg-inn etter vellykket
 * kodeverifisering, og av resultat/page.tsx sin "Utvikling over tid"-seksjon).
 * `result` er alltid det SISTE lagrede resultatet (bakoverkompatibelt med
 * eksisterende bruk); `history` er hele historikken, eldst -> nyest -- for
 * "full"-nivå (Standard) inneholder den alltid bare det ene resultatet, for
 * "extended" (Premium) kan den inneholde flere (v2.27).
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;
  const session = await readSession(token);
  if (!session) {
    return NextResponse.json({ error: "Du er ikke logget inn." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await accountStore().get(session.email, { type: "json" });
  } catch {
    return NextResponse.json({ error: "Klarte ikke å hente resultatet akkurat nå." }, { status: 503 });
  }

  const history = normalizeAccountHistory(raw);
  if (history.length === 0) {
    return NextResponse.json({ error: "Fant ikke noe lagret resultat for denne kontoen." }, { status: 404 });
  }

  const record = history[history.length - 1];
  return NextResponse.json({ ok: true, result: record, history });
}
