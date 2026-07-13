import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;

  try {
    await destroySession(token);
  } catch {
    // Selv om tilbakekalling server-side skulle feile, sletter vi cookien uansett under.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCOUNT_SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
