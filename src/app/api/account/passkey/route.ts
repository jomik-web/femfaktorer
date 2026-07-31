import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { listPasskeys, removePasskey } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/**
 * Oversikt over og sletting av egne passkeys.
 *
 * Begge metoder krever gyldig kontoøkt, og opererer KUN på den innloggede
 * kontoens egne passkeys -- e-posten hentes fra økten, aldri fra
 * forespørselen. Man kan altså verken se eller slette andres.
 *
 * Den offentlige nøkkelen sendes bevisst ikke ut. Den er ikke hemmelig, men
 * den har ingen nytte i grensesnittet, og alt som ikke trengs bør heller
 * ikke over nettverket.
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = await readSession(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  const passkeys = await listPasskeys(session.email);
  return NextResponse.json({
    passkeys: passkeys.map((p) => ({
      credentialId: p.credentialId,
      label: p.label,
      createdAt: p.createdAt,
      lastUsedAt: p.lastUsedAt,
    })),
  });
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const session = await readSession(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { credentialId?: unknown } | null;
  if (!body || typeof body.credentialId !== "string") {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  // MERK: vi hindrer IKKE at siste passkey slettes. Det er med vilje --
  // engangskode på e-post er alltid tilgjengelig som reservevei, så det
  // finnes ingen tilstand der man låser seg ute ved å fjerne en passkey.
  // Skulle e-postkoden noen gang bli fjernet som innloggingsmåte, må denne
  // vurderingen gjøres på nytt.
  await removePasskey(session.email, body.credentialId);

  const passkeys = await listPasskeys(session.email);
  return NextResponse.json({
    passkeys: passkeys.map((p) => ({
      credentialId: p.credentialId,
      label: p.label,
      createdAt: p.createdAt,
      lastUsedAt: p.lastUsedAt,
    })),
  });
}
