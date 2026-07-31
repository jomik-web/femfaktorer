import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { listPasskeys, storeChallenge, relyingParty } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/**
 * Starter registrering av en ny passkey.
 *
 * DETTE ER SIKKERHETSGRENSEN I HELE FUNKSJONEN, og grunnen til at
 * passkey-innlogging kan gjeninnføres etter at den ble fjernet i v2.28:
 * ruten krever en GYLDIG, EKSISTERENDE KONTOØKT, og knytter passkeyen til
 * NØYAKTIG den e-postadressen økten allerede tilhører. Adressen kommer fra
 * økten, aldri fra forespørselen -- det finnes derfor ingen måte å be om en
 * passkey for en adresse man ikke allerede har bevist at man eier via
 * engangskode.
 *
 * Det gamle hullet var at den tilsvarende ruten var helt åpen. Ikke gjør den
 * åpen igjen, uansett hvor praktisk det måtte virke.
 */
export async function POST() {
  const cookieStore = await cookies();
  const session = await readSession(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: "Du må være innlogget for å registrere en passkey." },
      { status: 401 }
    );
  }

  const { rpID, rpName } = relyingParty();
  const existing = await listPasskeys(session.email);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    // userID må være stabilt per konto, ellers lager nettleseren en ny
    // profiloppføring hver gang. E-posten er den stabile identiteten vi har.
    userID: new TextEncoder().encode(session.email),
    userName: session.email,
    userDisplayName: session.email,
    // "none": vi ber ikke om dokumentasjon på hvilken produsent
    // autentikatoren er fra. Det er riktig valg her -- attestasjon er for
    // virksomheter som må kreve bestemte, godkjente nøkkeltyper, og å be om
    // det ville gitt oss identifiserende maskinvareopplysninger vi verken
    // trenger eller vil ha.
    attestationType: "none",
    // Hindrer at samme enhet registreres to ganger. Nettleseren sier fra
    // med en gang i stedet for å lage en duplikat brukeren aldri ba om.
    excludeCredentials: existing.map((p) => ({
      id: p.credentialId,
      transports: p.transports as never,
    })),
    authenticatorSelection: {
      // "required": passkeyen lagres på selve enheten med en id vi kan slå
      // opp. Det er dette som gjør innlogging UTEN å skrive e-post mulig --
      // uten det måtte brukeren oppgitt adressen sin først likevel, og
      // halve gevinsten ville forsvunnet.
      residentKey: "required",
      // "preferred": be om Face ID/fingeravtrykk/PIN, men ikke gjør det til
      // et absolutt krav -- noen fysiske nøkler har ingen slik mulighet, og
      // de skal fortsatt kunne brukes.
      userVerification: "preferred",
    },
    // ES256 (-7) og RS256 (-257). Ed25519 (-8) er BEVISST utelatt: fysiske
    // nøkler som velger Ed25519 gir signaturer som eldre Firefox-versjoner
    // setter feil sammen, og som da aldri kan verifiseres. Feilen oppstår
    // først ved innlogging, altså lenge etter at brukeren trodde alt gikk
    // bra -- og eneste utvei er da å registrere enheten på nytt. De to
    // algoritmene her dekker alle passkeys i praktisk bruk.
    supportedAlgorithmIDs: [-7, -257],
  });

  const challengeId = await storeChallenge(options.challenge, "registration", session.email);
  return NextResponse.json({ options, challengeId });
}
