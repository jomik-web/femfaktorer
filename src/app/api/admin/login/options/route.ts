import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** AVVIKLET -- se src/app/api/admin/register/options/route.ts for begrunnelse. */
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Admin-passkey-innlogging er avviklet. Admin-tilgang skjer nå via vanlig e-post-innlogging (se /logg-inn).",
    },
    { status: 410 }
  );
}
