import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { readStore, writeStore } from "@/lib/admin/store";
import {
  createSessionCookieValue,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin/session";

export const runtime = "nodejs";

function getExpectedOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
function getRpId(): string {
  return new URL(getExpectedOrigin()).hostname;
}

export async function POST(request: Request) {
  const store = await readStore();
  if (!store.credential || !store.currentChallenge) {
    return NextResponse.json({ error: "Ingen aktiv innloggingsforespørsel." }, { status: 400 });
  }

  const body = await request.json();

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: store.currentChallenge,
      expectedOrigin: getExpectedOrigin(),
      expectedRPID: getRpId(),
      credential: {
        id: store.credential.credentialId,
        publicKey: Buffer.from(store.credential.publicKey, "base64url"),
        counter: store.credential.counter,
        transports: store.credential.transports as never,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Kunne ikke verifisere innloggingen.", detail: String(err) },
      { status: 400 }
    );
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Innlogging avvist." }, { status: 401 });
  }

  await writeStore({
    ...store,
    currentChallenge: null,
    credential: {
      ...store.credential,
      counter: verification.authenticationInfo.newCounter,
    },
  });

  const res = NextResponse.json({ verified: true });
  res.cookies.set(ADMIN_SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
