import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, requestOtp } from "@/lib/account/otp";
import { sendLoginCodeEmail } from "@/lib/account/email";

export const runtime = "nodejs";

/**
 * Ber om en innloggingskode på e-post. Samme endepunkt brukes for både
 * "opprett tilgang" og "logg inn igjen" -- eierskap til e-postadressen ER
 * innloggingen, det finnes ingen separat registrering (v2.4).
 *
 * Svarer ALLTID med en generisk suksessmelding uavhengig av om det finnes
 * lagret data for e-posten fra før -- unngår å avsløre hvilke e-postadresser
 * som har brukt tjenesten.
 */
export async function POST(request: Request) {
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
