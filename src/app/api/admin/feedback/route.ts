import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin/auth";
import { listFeedback } from "@/lib/feedback/blobs";

export const runtime = "nodejs";

/**
 * Henter betatilbakemeldinger til adminpanelet.
 *
 * Innholdet er anonymt, men fritekstfeltet kan i prinsippet inneholde hva
 * som helst en tester har valgt å skrive om seg selv. Endepunktet er derfor
 * admin-gatet på vanlig måte -- i motsetning til /api/admin/overview, som
 * bare inneholder tellere.
 */
export async function GET(request: Request) {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100, 1), 500);
  return NextResponse.json({ entries: await listFeedback(limit) });
}
