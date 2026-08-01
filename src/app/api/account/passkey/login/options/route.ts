import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { storeChallenge, relyingParty } from "@/lib/account/passkeys";
import { checkRateLimit } from "@/lib/rateLimit";

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
export async function POST(request: Request) {
  /**
   * Misbruksbrems (v2.50, kvalitetsrevisjon 01.08.2026, funn 8.2).
   *
   * Ruten lekker ingenting -- den utleverer kun et tilfeldig tall, som
   * forklart over. Men den SKRIVER: hvert kall lagrer en ny utfordring via
   * storeChallenge(), og en utfordring slettes bare når den konsumeres. Et
   * skript kunne dermed opprette et ubegrenset antall poster som aldri blir
   * lest og aldri ryddet -- lagring og kostnad uten tak.
   *
   * Søsterruten login/verify fikk brems i v2.49; denne ble glemt, selv om
   * det er denne som skriver. Taket er romslig: en ærlig bruker starter
   * innlogging noen få ganger, og hvert forsøk koster ett kall.
   *
   * Se også account-retention.mts, som nå rydder utløpte utfordringer --
   * bremsen begrenser tilveksten, oppryddingen fjerner restene.
   */
  const limited = await checkRateLimit(request, "passkey-login-options", {
    windowMs: 15 * 60 * 1000,
    limit: 30,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "For mange innloggingsforsøk. Vent noen minutter og prøv igjen." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) } }
    );
  }

  const { rpID } = relyingParty();

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    // v2.50 (funn 8.3): "required" -- se register/options for begrunnelsen.
    // Nettleseren ber da om Face ID / fingeravtrykk / PIN før den signerer.
    userVerification: "required",
  });

  const challengeId = await storeChallenge(options.challenge, "authentication", null);
  return NextResponse.json({ options, challengeId });
}
