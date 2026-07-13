import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
