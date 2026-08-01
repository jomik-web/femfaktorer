import { NextResponse } from "next/server";
import { incrementMetrics } from "@/lib/metrics/blobs";
import { durationKey, isValidMetricEvent } from "@/lib/metrics/types";
import { checkRateLimit } from "@/lib/rateLimit";

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
 * ingenting ødelegges. Første forsvar er at hendelsesnavnene er en LUKKET
 * liste (se lib/metrics/types.ts), så lagringen ikke kan fylles med
 * vilkårlige nøkler.
 *
 * v2.50 (kvalitetsrevisjon 31.07.2026 kveld, funn 5.3): andre forsvar lagt
 * til -- en romslig per-IP-brems. Begrunnelsen som tidligere sto her for å
 * IKKE gjøre dette ("ville krevd å behandle IP-adresser vi ellers ikke
 * rører") falt bort da lib/rateLimit.ts ble bygget: IP-en leses der, brukes
 * kun til å regne ut en nøkkel, og når aldri denne rutens egne data. Det som
 * lagres er fortsatt rene dagstellere uten noen kobling til avsender.
 *
 * TAKET ER HEVET I v2.50 (kvalitetsrevisjon 01.08.2026, funn 11.2).
 *
 * Det sto på 60 per time, satt ut fra at én bruker utløser under ti
 * hendelser gjennom en hel test. Regnestykket glemte at IP-adressen deles:
 * sju samtidige brukere bak samme nett fylte kvoten på en time, og resten
 * ble forkastet stille.
 *
 * Det mest sannsynlige tilfellet der det skjer er en organisert
 * betatestrunde -- en klasse, et kontor, en vennegjeng på samme wifi --
 * altså akkurat den situasjonen der man mest av alt vil ha tallene. Og
 * frafallet ville sett ut som brukeratferd i trakten, ikke som en teller
 * som ga opp. Tall som er stille feil er verre enn ingen tall.
 *
 * 500 per time gir rom for rundt seksti samtidige brukere bak samme IP, og
 * er fortsatt langt under det et skript ville produsert. Risikoen ved et
 * høyt tak er dessuten liten her: hendelsesnavnene er en lukket liste, så
 * det verste et misbruk kan gjøre er å blåse opp tall -- ikke fylle
 * lagringen med vilkårlige nøkler.
 */
export async function POST(request: Request) {
  const limited = await checkRateLimit(request, "metrics-event", {
    windowMs: 60 * 60 * 1000,
    limit: 500,
  });
  if (!limited.ok) {
    // Tellinger er "beste innsats" -- en avvist telling skal aldri gi en
    // synlig feil i klienten, den skal bare ikke telles.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

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
