import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import {
  consumeChallenge,
  emailForCredential,
  listPasskeys,
  touchPasskey,
  relyingParty,
} from "@/lib/account/passkeys";
import {
  createSession,
  ACCOUNT_SESSION_COOKIE_NAME,
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";

export const runtime = "nodejs";

/**
 * Fullfører innlogging med passkey og oppretter en vanlig kontoøkt.
 *
 * HVEM BRUKEREN ER, AVGJØRES AV SIGNATUREN -- IKKE AV NOE KLIENTEN PÅSTÅR.
 * Vi tar imot en legitimasjons-id, slår opp hvilken konto den tilhører, og
 * verifiserer så signaturen mot den lagrede offentlige nøkkelen for nettopp
 * den legitimasjonen. Går verifiseringen gjennom, er det bevist at brukeren
 * har den tilhørende private nøkkelen -- den forlater aldri enheten deres.
 * En oppgitt id uten gyldig signatur kommer ingen vei.
 *
 * Økten som opprettes er nøyaktig den samme som e-postkoden gir. Passkey er
 * en annen vei inn til samme konto, ikke en konto med andre rettigheter --
 * og admin-rolle avgjøres fortsatt uavhengig av dette, i lib/admin/roles.ts.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    response?: unknown;
    challengeId?: unknown;
  } | null;

  if (!body || typeof body.challengeId !== "string" || typeof body.response !== "object" || body.response === null) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const stored = await consumeChallenge(body.challengeId);
  if (!stored || stored.type !== "authentication") {
    return NextResponse.json(
      { error: "Innloggingen tok for lang tid. Prøv en gang til." },
      { status: 400 }
    );
  }

  const response = body.response as { id?: unknown };
  if (typeof response.id !== "string") {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const email = await emailForCredential(response.id);
  if (!email) {
    // Bevisst samme, upresise feilmelding som ved feilet signatur -- vi skal
    // ikke røpe om en legitimasjon finnes hos oss eller ikke.
    return NextResponse.json({ error: "Passkeyen ble ikke godkjent." }, { status: 401 });
  }

  const passkey = (await listPasskeys(email)).find((p) => p.credentialId === response.id);
  if (!passkey) {
    return NextResponse.json({ error: "Passkeyen ble ikke godkjent." }, { status: 401 });
  }

  const { rpID, origin } = relyingParty();

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response as never,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
        counter: passkey.counter,
        transports: passkey.transports as never,
      },
      requireUserVerification: false,
    });
  } catch {
    return NextResponse.json({ error: "Passkeyen ble ikke godkjent." }, { status: 401 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Passkeyen ble ikke godkjent." }, { status: 401 });
  }

  await touchPasskey(email, passkey.credentialId, verification.authenticationInfo.newCounter);

  const token = await createSession(email);

  let hasSavedResult = false;
  try {
    hasSavedResult = (await accountStore().get(email, { type: "json" })) !== null;
  } catch {
    // Ikke kritisk -- innloggingen har uansett lyktes.
  }

  const res = NextResponse.json({ ok: true, email, hasSavedResult });
  res.cookies.set(ACCOUNT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ACCOUNT_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
