import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * AVVIKLET (v2.28, kvalitetsrevisjon 19.07.2026 -- kritisk sikkerhetsfunn).
 *
 * Dette endepunktet var tidligere åpent for registrering av en admin-passkey
 * for HVEM SOM HELST fram til noen registrerte den første ("først til
 * mølla") -- se OPPGAVER-FOR-PRODUKTEIER.md. Admin-tilgang styres nå av
 * hvilken e-post som logger inn via den vanlige e-post/kode-innloggingen
 * (se /logg-inn og lib/admin/roles.ts), som ikke har noen tilsvarende åpen
 * registreringsflyt å kapre. Endepunktet er beholdt (i stedet for slettet)
 * kun for å gi et tydelig svar til eventuelle gamle klienter/bokmerker.
 */
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Admin-passkey-registrering er avviklet. Admin-tilgang skjer nå via vanlig e-post-innlogging (se /logg-inn).",
    },
    { status: 410 }
  );
}
