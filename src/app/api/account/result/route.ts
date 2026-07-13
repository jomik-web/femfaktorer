import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";
import type { StoredAccountResult } from "@/lib/account/types";

export const runtime = "nodejs";

/** Henter det innloggede resultatet (brukt av /logg-inn etter vellykket kodeverifisering). */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;
  const session = await readSession(token);
  if (!session) {
    return NextResponse.json({ error: "Du er ikke logget inn." }, { status: 401 });
  }

  let record: StoredAccountResult | null;
  try {
    record = (await accountStore().get(session.email, { type: "json" })) as StoredAccountResult | null;
  } catch {
    return NextResponse.json({ error: "Klarte ikke å hente resultatet akkurat nå." }, { status: 503 });
  }

  if (!record) {
    return NextResponse.json({ error: "Fant ikke noe lagret resultat for denne kontoen." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, result: record });
}
