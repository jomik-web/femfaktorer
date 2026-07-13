import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { accountStore } from "@/lib/account/blobs";

export const runtime = "nodejs";

/** Sletter det lagrede resultatet for den innloggede kontoen. Logger IKKE ut -- se /api/account/logout for det. */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;
  const session = await readSession(token);
  if (!session) {
    return NextResponse.json({ error: "Du er ikke logget inn." }, { status: 401 });
  }

  try {
    await accountStore().delete(session.email);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å slette resultatet akkurat nå." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
