import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, verifyOtp } from "@/lib/account/otp";
import { createSession, ACCOUNT_SESSION_COOKIE_NAME, ACCOUNT_SESSION_MAX_AGE_SECONDS } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return NextResponse.json({ error: "Skriv inn en gyldig e-postadresse." }, { status: 400 });
  }
  if (typeof body.code !== "string" || !/^\d{6}$/.test(body.code.trim())) {
    return NextResponse.json({ error: "Koden må bestå av 6 sifre." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const code = body.code.trim();

  let verification;
  try {
    verification = await verifyOtp(email, code);
  } catch {
    return NextResponse.json(
      { error: "Kontofunksjonen er ikke tilgjengelig akkurat nå. Prøv igjen senere." },
      { status: 503 }
    );
  }
  if (!verification.ok) {
    return NextResponse.json({ error: verification.error }, { status: 401 });
  }

  const token = await createSession(email);

  // Lar klienten vite om det finnes et lagret resultat å hente fram, uten å
  // måtte gjøre et eget kall rett etterpå.
  let hasSavedResult = false;
  try {
    hasSavedResult = (await accountStore().get(email, { type: "json" })) !== null;
  } catch {
    // Ikke kritisk -- innloggingen har uansett lyktes.
  }

  const res = NextResponse.json({ ok: true, hasSavedResult, email });
  res.cookies.set(ACCOUNT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ACCOUNT_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
