import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { storeChallenge, relyingParty } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/**
 * Starter innlogging med passkey.
 *
 * ÅPENT ENDEPUNKT, og det er trygt: det utleverer ingenting annet enn et
 * tilfeldig tall. Ingen e-postadresse sendes inn, og ingen liste over hvilke
 * passkeys som finnes sendes ut -- `allowCredentials` er bevisst tom.
 * Nettleseren finner selv fram de passkeyene den har for dette nettstedet og
 * lar brukeren velge. Det er nettopp derfor registreringen krever
 * `residentKey: "required"`.
 *
 * Bieffekten er verdt å merke seg: fordi vi ikke oppgir hvilke kontoer som
 * har passkeys, kan ingen bruke denne ruten til å finne ut om en bestemt
 * e-postadresse er registrert hos oss.
 */
export async function POST() {
  const { rpID } = relyingParty();

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    userVerification: "preferred",
  });

  const challengeId = await storeChallenge(options.challenge, "authentication", null);
  return NextResponse.json({ options, challengeId });
}
