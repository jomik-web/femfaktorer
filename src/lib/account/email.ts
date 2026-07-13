/**
 * Sender innloggingskoder på e-post via Resend -- v2.4.
 *
 * Bruker Resend sitt rene REST-API via `fetch()` direkte, IKKE `resend`
 * npm-pakken -- det unngår en ekstra avhengighet for én enkelt API-kall,
 * og er like enkelt (se https://resend.com/docs/api-reference/emails/send-email).
 *
 * VIKTIG DRIFTSMERKNAD (må leses av produkteier før reell bruk): Resend
 * krever et VERIFISERT domene før du kan sende til vilkårlige mottakere.
 * Uten et verifisert domene kan `RESEND_FROM_ADDRESS` kun sende til
 * e-postadressen som er registrert på selve Resend-kontoen din -- altså vil
 * innlogging fungere for DEG under testing, men ikke for andre brukere før
 * du har verifisert et domene (f.eks. femfaktorer.no) i Resend sitt
 * dashbord og pekt DNS-oppføringer dit.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export async function sendLoginCodeEmail(email: string, code: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_ADDRESS;
  if (!apiKey || !from) {
    return {
      ok: false,
      error: "E-posttjenesten er ikke konfigurert (mangler RESEND_API_KEY eller RESEND_FROM_ADDRESS).",
    };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: `Din innloggingskode: ${code}`,
        html:
          `<p>Innloggingskoden din til FemFaktorer er:</p>` +
          `<p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${code}</p>` +
          `<p>Koden er gyldig i 10 minutter. Har du ikke bedt om denne, kan du se bort fra e-posten -- ingen konto opprettes uten at koden brukes.</p>`,
        text: `Innloggingskoden din til FemFaktorer er: ${code}\n\nKoden er gyldig i 10 minutter. Har du ikke bedt om denne, kan du se bort fra e-posten -- ingen konto opprettes uten at koden brukes.`,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `E-posten ble ikke sendt (leverandørstatus ${res.status}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Fikk ikke kontakt med e-posttjenesten." };
  }
}
