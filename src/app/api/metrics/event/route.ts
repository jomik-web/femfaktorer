import { NextResponse } from "next/server";
import { incrementMetrics } from "@/lib/metrics/blobs";
import { durationKey, isValidMetricEvent } from "@/lib/metrics/types";

export const runtime = "nodejs";

/**
 * Tar imot én anonym telling. Leser BEVISST ingen cookies, økt eller IP --
 * ruten skal ikke kunne vite hvem som teller (samme prinsipp som
 * /api/stats/submit-norm og /api/research/submit-answers).
 *
 * ÅPENT ENDEPUNKT -- OG HVA DET BETYR
 * Dette må kunne kalles fra nettleseren uten innlogging, og kan dermed i
 * prinsippet spammes av hvem som helst som finner det. Konsekvensen er
 * begrenset til at tallene i adminpanelet blir feil -- ingen data lekker,
 * ingenting ødelegges. Forsvaret er at hendelsesnavnene er en LUKKET liste
 * (se lib/metrics/types.ts), så lagringen ikke kan fylles med vilkårlige
 * nøkler. Blir det et reelt problem, er neste steg en enkel ratebegrensning
 * per IP i en Netlify edge-funksjon -- bevisst ikke bygget nå, siden det
 * ville krevd å behandle IP-adresser vi ellers ikke rører.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
    tier?: unknown;
    durationMinutes?: unknown;
  } | null;

  if (!body || !isValidMetricEvent(body.event)) {
    return NextResponse.json({ error: "Ukjent hendelse." }, { status: 400 });
  }

  const keys: string[] = [body.event];

  // Tidsbruk følger bare med på de to fullføringshendelsene, og bare som en
  // bøtte i et histogram -- aldri som en enkeltmåling, se metrics/types.ts.
  if (
    (body.event === "completed_full" || body.event === "completed_extended") &&
    typeof body.durationMinutes === "number" &&
    Number.isFinite(body.durationMinutes) &&
    body.durationMinutes >= 0
  ) {
    const tier = body.event === "completed_extended" ? "extended" : "full";
    keys.push(durationKey(tier, body.durationMinutes));
  }

  await incrementMetrics(keys);
  return NextResponse.json({ ok: true });
}
