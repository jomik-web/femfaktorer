import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";
import { isValidFactorResult, isValidFacetResult, isValidAccountTier } from "@/lib/account/validate";
import {
  MAX_ACCOUNT_HISTORY_ENTRIES,
  normalizeAccountHistory,
  type StoredAccountResult,
} from "@/lib/account/types";

export const runtime = "nodejs";

interface SaveRequestBody {
  factors: unknown;
  facets: unknown;
  tier: unknown;
}

/**
 * Lagrer (eller oppdaterer) det innloggede resultatet. Krever gyldig
 * innloggingsøkt -- gjelder KUN "full" og "extended" (v2.11), se
 * resultat/page.tsx som aldri tilbyr lagring for tier === "free".
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;
  const session = await readSession(token);
  if (!session) {
    return NextResponse.json({ error: "Du er ikke logget inn." }, { status: 401 });
  }

  let body: SaveRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (
    !Array.isArray(body.factors) ||
    body.factors.length === 0 ||
    !body.factors.every(isValidFactorResult)
  ) {
    return NextResponse.json({ error: "Mangler eller ugyldig resultatobjekt." }, { status: 400 });
  }
  if (!Array.isArray(body.facets) || !body.facets.every(isValidFacetResult)) {
    return NextResponse.json({ error: "Ugyldig fasettdata." }, { status: 400 });
  }
  if (!isValidAccountTier(body.tier)) {
    return NextResponse.json({ error: "Ugyldig eller manglende tier." }, { status: 400 });
  }

  const record: StoredAccountResult = {
    factors: body.factors,
    facets: body.facets,
    tier: body.tier,
    savedAt: new Date().toISOString(),
  };

  // v2.27: "extended" (Premium-nivå) bygger opp en historikk over tid, se
  // types.ts sin doc-kommentar for begrunnelsen. "full" (Standard-nivå)
  // erstatter alltid hele historikken med kun dette ene resultatet -- Standard
  // er ikke ment å vise utvikling over tid, bare "siste resultat i skya".
  let history: StoredAccountResult[];
  if (record.tier === "extended") {
    let existing: unknown = null;
    try {
      existing = await accountStore().get(session.email, { type: "json" });
    } catch {
      // Klarte ikke å hente eksisterende historikk -- fortsett med en tom
      // liste fremfor å blokkere lagringen av det nye resultatet.
    }
    history = [...normalizeAccountHistory(existing), record];
    if (history.length > MAX_ACCOUNT_HISTORY_ENTRIES) {
      history = history.slice(history.length - MAX_ACCOUNT_HISTORY_ENTRIES);
    }
  } else {
    history = [record];
  }

  try {
    await accountStore().setJSON(session.email, history);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å lagre resultatet akkurat nå." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, savedAt: record.savedAt, historyCount: history.length });
}
