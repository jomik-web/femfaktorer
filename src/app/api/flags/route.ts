import { NextResponse } from "next/server";
import { readStore } from "@/lib/admin/store";
import { relyingParty } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/**
 * Offentlig endepunkt for de tre funksjonsbryterne (v2.46, 31.07.2026).
 *
 * ÅPENT MED VILJE: bryterne avgjør bare hva som VISES, ikke hva som er
 * tillatt. At "logg inn" er skjult er ingen sikkerhetsmekanisme -- de ekte
 * sperrene ligger i selve API-endepunktene. Derfor er det ingenting å
 * beskytte her, og å kreve innlogging ville gjort det umulig å bruke
 * verdiene på sider der man ikke er innlogget (som er de fleste).
 *
 * MERK AT DET IKKE RETURNERES NOEN ANDRE INNSTILLINGER. AI-modell, tak og
 * vedlikeholdsmelding hører hjemme bak admin-sjekken i /api/admin/settings.
 * Legger du til felter her, tenk gjennom om de tåler å være offentlige.
 */
export async function GET() {
  const { settings } = await readStore();
  return NextResponse.json(
    {
      accountSaveEnabled: settings.accountSaveEnabled,
      resultAccountSaveEnabled: settings.resultAccountSaveEnabled,
      betaAnswerSetToolsEnabled: settings.betaAnswerSetToolsEnabled,
      sharingEnabled: settings.sharingEnabled,
      /**
       * v2.49: hvilket domene passkeys er bundet til. Trygt å eksponere --
       * det er nettstedets eget domene, ikke en hemmelighet.
       *
       * Klienten bruker det til å ADVARE FØR man trykker, i stedet for å la
       * nettleseren avvise etterpå. Bakgrunn: en Netlify-permalink
       * (`<hash>--sitenavn.netlify.app`) er et annet domene enn hovedadressen,
       * og feilen den gir er nesten umulig å tolke uten å vite dette.
       */
      passkeyRpID: relyingParty().rpID,
    },
    {
      // Kort mellomlagring: en brytersk endring skal slå gjennom raskt, men
      // uten at hver eneste sidevisning trenger et oppslag mot lagringen.
      headers: { "cache-control": "public, max-age=30, stale-while-revalidate=300" },
    }
  );
}
