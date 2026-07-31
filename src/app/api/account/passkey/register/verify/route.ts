import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { addPasskey, consumeChallenge, relyingParty } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/** Maks lengde på enhetsnavnet brukeren skriver. */
const MAX_LABEL_LENGTH = 60;

/**
 * Fullfører registrering av en passkey.
 *
 * Krever gyldig kontoøkt, som options-ruten. Utfordringen hentes fra
 * server-lagringen og slettes i samme operasjon (engangsbruk), og det
 * kontrolleres eksplisitt at den ble laget FOR REGISTRERING og FOR DENNE
 * KONTOEN -- en utfordring utstedt til noen andre, eller til
 * innloggingsflyten, skal ikke kunne gjenbrukes her.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await readSession(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: "Du må være innlogget for å registrere en passkey." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    response?: unknown;
    challengeId?: unknown;
    label?: unknown;
  } | null;

  if (!body || typeof body.challengeId !== "string" || typeof body.response !== "object" || body.response === null) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const stored = await consumeChallenge(body.challengeId);
  if (!stored || stored.type !== "registration" || stored.email !== session.email) {
    return NextResponse.json(
      { error: "Registreringen tok for lang tid. Prøv en gang til." },
      { status: 400 }
    );
  }

  const { rpID, origin } = relyingParty();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response as never,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch {
    // Vanligste reelle årsak: NEXT_PUBLIC_SITE_URL peker et annet sted enn
    // adressen brukeren faktisk står på. Se Drift-fanen i adminpanelet.
    return NextResponse.json(
      { error: "Klarte ikke bekrefte passkeyen. Sjekk at nettadressen stemmer med oppsettet." },
      { status: 400 }
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Passkeyen ble ikke godkjent." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;

  const label =
    typeof body.label === "string" && body.label.trim().length > 0
      ? body.label.trim().slice(0, MAX_LABEL_LENGTH)
      : "Ukjent enhet";

  await addPasskey(session.email, {
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports,
    label,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  });

  return NextResponse.json({ ok: true });
}
