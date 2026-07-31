import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin/auth";
import { readStore } from "@/lib/admin/store";
import { QUESTION_SET_FINGERPRINT, QUESTION_SET_REVISION } from "@/data/questionSetVersion";
import { relyingParty } from "@/lib/account/passkeys";

export const runtime = "nodejs";

/**
 * Driftsstatus (v2.46, 31.07.2026).
 *
 * Formålet er å svare på ett spørsmål produkteier ellers ikke kan svare på
 * selv: "er det meg eller er det en tjeneste som er nede?". Uten dette blir
 * hver feil en henvendelse til en utvikler.
 *
 * SJEKKER KONFIGURASJON, IKKE FULL FUNKSJON. Vi bekrefter at nøkler finnes
 * og at lagringen svarer -- vi sender ikke en test-e-post eller kaller
 * Anthropic for å være helt sikre. Grunnen er at en ekte sjekk ville kostet
 * penger og sendt uønsket e-post hver gang siden åpnes. Manglende nøkkel er
 * uansett den klart vanligste årsaken til at noe slutter å virke her.
 */
export async function GET() {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }

  // Netlify Blobs: den eneste vi kan sjekke ordentlig, siden et oppslag er
  // gratis og uten bivirkninger. Klarer vi å lese innstillingene, virker den.
  let blobsOk = false;
  try {
    await readStore();
    blobsOk = true;
  } catch {
    blobsOk = false;
  }

  const passkeyRp = relyingParty();

  const checks = [
    {
      key: "blobs",
      label: "Netlify Blobs (lagring)",
      ok: blobsOk,
      detail: blobsOk
        ? "Svarer normalt."
        : "Svarer ikke. Innstillinger, kontoer og statistikk vil ikke virke.",
    },
    {
      key: "anthropic",
      label: "Anthropic (Spir)",
      ok: Boolean(process.env.ANTHROPIC_API_KEY),
      detail: process.env.ANTHROPIC_API_KEY
        ? "API-nøkkel er satt."
        : "ANTHROPIC_API_KEY mangler -- Spir kan ikke svare.",
    },
    {
      key: "resend",
      label: "Resend (innloggingskoder)",
      ok: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_ADDRESS),
      detail:
        process.env.RESEND_API_KEY && process.env.RESEND_FROM_ADDRESS
          ? "API-nøkkel og avsenderadresse er satt."
          : "RESEND_API_KEY eller RESEND_FROM_ADDRESS mangler -- ingen får innloggingskode.",
    },
    {
      key: "otp_pepper",
      label: "Sikring av engangskoder",
      ok: Boolean(process.env.ACCOUNT_OTP_PEPPER),
      detail: process.env.ACCOUNT_OTP_PEPPER
        ? "Satt."
        : "ACCOUNT_OTP_PEPPER mangler -- innlogging vil feile.",
    },
    {
      key: "passkey",
      label: "Passkey-innlogging",
      ok: passkeyRp.configured,
      detail: passkeyRp.configured
        ? `Bundet til ${passkeyRp.rpID}. Står du på en ANNEN adresse enn denne når du prøver å registrere, avviser nettleseren det. Passkeys registrert her virker heller ikke på et annet domene -- ved domenebytte må alle registrere enhetene sine på nytt.`
        : "NEXT_PUBLIC_SITE_URL mangler eller er ugyldig -- passkey vil feile. Legg den inn i Netlify under Site configuration → Environment variables, med nøyaktig den adressen nettstedet kjører på.",
    },
    {
      key: "plausible",
      label: "Plausible (besøksstatistikk)",
      ok: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
      detail: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
        ? `Måler ${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}.`
        : "NEXT_PUBLIC_PLAUSIBLE_DOMAIN er ikke satt -- ingen besøksstatistikk samles.",
    },
  ];

  return NextResponse.json({
    checks,
    questionSet: {
      revision: QUESTION_SET_REVISION,
      fingerprint: QUESTION_SET_FINGERPRINT,
    },
  });
}
