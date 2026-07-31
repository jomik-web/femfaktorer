import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, requestOtp } from "@/lib/account/otp";
import { sendLoginCodeEmail } from "@/lib/account/email";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Ber om en innloggingskode på e-post. Samme endepunkt brukes for både
 * "opprett tilgang" og "logg inn igjen" -- eierskap til e-postadressen ER
 * innloggingen, det finnes ingen separat registrering (v2.4).
 *
 * Svarer ALLTID med en generisk suksessmelding uavhengig av om det finnes
 * lagret data for e-posten fra før -- unngår å avsløre hvilke e-postadresser
 * som har brukt tjenesten.
 *
 * Rate-limit (v2.46, kvalitetsrevisjon 31.07.2026, kap. 8, funn #2 --
 * middels): otp.ts har allerede en per-e-post brems
 * (MIN_RESEND_INTERVAL_MS, uendret), men ingenting stoppet én IP fra å be
 * om koder til et stort antall ULIKE e-postadresser -- revisjonens
 * foreslåtte tall (5 forespørsler/10 min per IP) brukt direkte.
 */
const REQUEST_CODE_WINDOW_MS = 1000 * 60 * 10; // 10 minutter
const REQUEST_CODE_LIMIT = 5;

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "request-code", {
    windowMs: REQUEST_CODE_WINDOW_MS,
    limit: REQUEST_CODE_LIMIT,
  });
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "For mange forespørsler. Prøv igjen senere." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
    );
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return NextResponse.json({ error: "Skriv inn en gyldig e-postadresse." }, { status: 400 });
  }
  const email = normalizeEmail(body.email);

  let result;
  try {
    result = await requestOtp(email);
  } catch {
    return NextResponse.json(
      { error: "Kontofunksjonen er ikke tilgjengelig akkurat nå. Prøv igjen senere." },
      { status: 503 }
    );
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }

  const sendResult = await sendLoginCodeEmail(email, result.code);
  if (!sendResult.ok) {
    return NextResponse.json(
      { error: sendResult.error ?? "Klarte ikke å sende e-post med kode." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
