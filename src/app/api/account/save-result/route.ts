import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";
import { isValidFactorResult, isValidFacetResult, isValidAccountTier } from "@/lib/account/validate";
import type { StoredAccountResult } from "@/lib/account/types";

export const runtime = "nodejs";

interface SaveRequestBody {
  factors: unknown;
  facets: unknown;
  o6Score: unknown;
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
  if (body.o6Score !== null && typeof body.o6Score !== "number") {
    return NextResponse.json({ error: "Ugyldig tilleggsskår." }, { status: 400 });
  }
  if (!isValidAccountTier(body.tier)) {
    return NextResponse.json({ error: "Ugyldig eller manglende tier." }, { status: 400 });
  }

  const record: StoredAccountResult = {
    factors: body.factors,
    facets: body.facets,
    o6Score: (body.o6Score as number | null) ?? null,
    tier: body.tier,
    savedAt: new Date().toISOString(),
  };

  try {
    await accountStore().setJSON(session.email, record);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å lagre resultatet akkurat nå." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, savedAt: record.savedAt });
}
