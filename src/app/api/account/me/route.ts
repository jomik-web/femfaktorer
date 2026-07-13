import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";

export const runtime = "nodejs";

/** Brukes av klienten til å vite om noen allerede er innlogget (og med hvilken e-post) uten å måtte huske det selv i localStorage. */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;

  let session;
  try {
    session = await readSession(token);
  } catch {
    return NextResponse.json({ loggedIn: false });
  }

  if (!session) return NextResponse.json({ loggedIn: false });
  return NextResponse.json({ loggedIn: true, email: session.email });
}
