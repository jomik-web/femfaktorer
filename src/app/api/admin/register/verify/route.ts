import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { readStore, writeStore } from "@/lib/admin/store";

export const runtime = "nodejs";

function getExpectedOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
function getRpId(): string {
  return new URL(getExpectedOrigin()).hostname;
}

export async function POST(request: Request) {
  const store = await readStore();
  if (store.credential) {
    return NextResponse.json({ error: "Admin-passkey er allerede registrert." }, { status: 403 });
  }
  if (!store.currentChallenge) {
    return NextResponse.json({ error: "Ingen aktiv registreringsforespørsel." }, { status: 400 });
  }

  const body = await request.json();

  // MERK: verifiseringsresultatets nøyaktige form (`registrationInfo`) kan
  // variere litt mellom versjoner av @simplewebauthn/server. Sjekk dette mot
  // typene som faktisk installeres (`npm install`) -- det første ekte bygget
  // hos Netlify vil gi en tydelig TypeScript-feil her dersom formen avviker.
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: store.currentChallenge,
      expectedOrigin: getExpectedOrigin(),
      expectedRPID: getRpId(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Kunne ikke verifisere passkey-registreringen.", detail: String(err) },
      { status: 400 }
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Registrering ble avvist." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  await writeStore({
    ...store,
    currentChallenge: null,
    credential: {
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports,
    },
  });

  return NextResponse.json({ verified: true });
}
