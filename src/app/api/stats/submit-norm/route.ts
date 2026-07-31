import { NextResponse } from "next/server";
import { normStatsStore, type NormStatsTier } from "@/lib/stats/blobs";
import { emptyNormStats, bucketIndexFor, type NormStats } from "@/lib/stats/types";
import { isValidFactorResult, isValidFacetResult } from "@/lib/account/validate";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Rate-limit (v2.46, kvalitetsrevisjon 31.07.2026, kap. 8, funn #1 --
 * høy): endepunktet tar imot ferdige resultater uten noen form for
 * engangs-verifisering at avsenderen faktisk har fullført en test --
 * en enkelt IP kunne tidligere sende et ubegrenset antall falske
 * innsendinger og forurense normstatistikken. Vurderte revisjonens forslag
 * om en engangs-fullførelsestoken også, men det krever ny arkitektur
 * (tokenutstedelse, signeringshemmelighet, engangs-sporing, klientendring i
 * testflyten) -- flagget som en egen, større oppfølging i
 * OPPGAVER-FOR-PRODUKTEIER.md fremfor å bygges inn her. Denne
 * per-IP-bremsen stopper i det minste grovt automatisert misbruk.
 */
const SUBMIT_NORM_WINDOW_MS = 1000 * 60 * 60; // 1 time
const SUBMIT_NORM_LIMIT = 20; // per IP per time -- rundt regnet god margin over normalt bruksmønster (én person tar sjelden 20+ tester/time)

interface SubmitNormBody {
  factors: unknown;
  facets: unknown;
  tier: unknown;
}

function isValidNormStatsTier(value: unknown): value is NormStatsTier {
  return value === "full" || value === "extended";
}

/**
 * Tar imot ferdig beregnede skårer fra en FULLFØRT 120- eller 290-test (se
 * test/page.tsx) og legger dem inn i et anonymt, samlet histogram -- ALDRI
 * som en identifiserbar enkeltpost. Se lib/stats/blobs.ts for
 * personvernbegrunnelsen, og for hvorfor de to tier-nivåene (v2.11) skrives
 * til HVER SIN separate butikk i stedet for å blandes sammen.
 *
 * Leser BEVISST ingen cookies, økt eller annen identifiserende informasjon --
 * denne ruten skal ikke ha noen måte å vite hvem som sender inn på.
 * Kalles "fire-and-forget" fra klienten (feil her skal aldri påvirke
 * brukeropplevelsen, se test/page.tsx).
 */
export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "submit-norm", {
    windowMs: SUBMIT_NORM_WINDOW_MS,
    limit: SUBMIT_NORM_LIMIT,
  });
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "For mange innsendinger. Prøv igjen senere." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
    );
  }

  let body: SubmitNormBody;
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
    return NextResponse.json({ error: "Ugyldig resultatobjekt." }, { status: 400 });
  }
  if (!Array.isArray(body.facets) || !body.facets.every(isValidFacetResult)) {
    return NextResponse.json({ error: "Ugyldig fasettdata." }, { status: 400 });
  }
  if (!isValidNormStatsTier(body.tier)) {
    return NextResponse.json({ error: "Ugyldig eller manglende tier." }, { status: 400 });
  }

  try {
    const store = normStatsStore(body.tier);
    const existing = (await store.get("aggregate", { type: "json" })) as NormStats | null;
    const stats: NormStats = existing ?? emptyNormStats();

    for (const factor of body.factors) {
      const histogram = stats.domains[factor.factor] ?? new Array(101).fill(0);
      const idx = bucketIndexFor(factor.score);
      histogram[idx] = (histogram[idx] ?? 0) + 1;
      stats.domains[factor.factor] = histogram;
    }
    for (const facet of body.facets) {
      const histogram = stats.facets[facet.facet] ?? new Array(101).fill(0);
      const idx = bucketIndexFor(facet.score);
      histogram[idx] = (histogram[idx] ?? 0) + 1;
      stats.facets[facet.facet] = histogram;
    }
    stats.totalSubmissions += 1;
    stats.updatedAt = new Date().toISOString();

    await store.setJSON("aggregate", stats);
  } catch {
    // Bevisst stille -- normtelling skal ALDRI påvirke brukeropplevelsen.
    // Se test/page.tsx, som uansett ikke venter på eller viser svaret herfra.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
