import { NextResponse } from "next/server";
import { storeFeedback, RATED_AREAS, type FeedbackEntry, type RatedArea } from "@/lib/feedback/blobs";
import { incrementMetrics } from "@/lib/metrics/blobs";
import { APP_VERSION } from "@/lib/version";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

/** Maks lengde på fritekst. Nok til et grundig avsnitt, lite nok til å ikke kunne misbrukes som lagring. */
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Områder testeren MÅ gi en karakter. "spir" står utenfor med vilje: en
 * tester som aldri åpnet den har ikke en mening å gi, og tvinger vi fram et
 * tall der, får vi oppdiktede tall i stedet for ingen -- som er verre.
 */
const REQUIRED_AREAS = ["testen", "resultatet"] as const;

/**
 * Tar imot en betatilbakemelding. Leser bevisst ingen cookies eller økt --
 * skjemaet er anonymt, som Google-skjemaet det erstatter.
 *
 * Appversjonen settes her på serveren, ikke av klienten. Det er hele poenget
 * med feltet: en klage må kunne knyttes til NØYAKTIG den versjonen testeren
 * så, ellers er den umulig å tolke etter noen utrullinger -- gjaldt den en
 * feil som allerede er rettet, eller står den fortsatt?
 *
 * v2.51: én karakter PER OMRÅDE i stedet for én karakter + ett valgt område,
 * og fritekst er ikke lenger obligatorisk. Se FeedbackPrompt.tsx for
 * begrunnelsen -- kort sagt ganger et obligatorisk fritekstfelt frafallet med
 * omtrent 2,5, og var det dyreste enkeltvalget i den forrige utgaven.
 */
export async function POST(request: Request) {
  // Misbruksbrems (v2.50, funn 5.3). Et åpent fritekstfelt som skriver til
  // lagring er den klassiske spam-inngangen. Ti i timen er rikelig for en
  // ivrig betatester og stopper et skript umiddelbart.
  const limited = await checkRateLimit(request, "feedback", {
    windowMs: 60 * 60 * 1000,
    limit: 10,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Du har sendt inn flere tilbakemeldinger nå nettopp. Prøv igjen om en stund." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) } }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    message?: unknown;
    ratings?: unknown;
    device?: unknown;
    durationSeconds?: unknown;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const raw = (body.ratings ?? {}) as Record<string, unknown>;
  const ratings = Object.fromEntries(
    RATED_AREAS.map((area) => {
      const value = raw[area];
      const valid = typeof value === "number" && value >= 1 && value <= 5;
      return [area, valid ? Math.round(value as number) : null];
    })
  ) as Record<RatedArea, number | null>;

  for (const area of REQUIRED_AREAS) {
    if (ratings[area] === null) {
      return NextResponse.json(
        { error: "Gi en karakter på både testen og resultatet før du sender." },
        { status: 400 }
      );
    }
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";

  const entry: FeedbackEntry = {
    submittedAt: new Date().toISOString(),
    ratings,
    message,
    appVersion: APP_VERSION,
    device: typeof body.device === "string" ? body.device.slice(0, 20) : "ukjent",
    durationSeconds:
      typeof body.durationSeconds === "number" && Number.isFinite(body.durationSeconds)
        ? Math.round(body.durationSeconds)
        : null,
  };

  const stored = await storeFeedback(entry);
  if (!stored) {
    return NextResponse.json({ error: "Klarte ikke lagre tilbakemeldingen." }, { status: 500 });
  }

  // Telles i trakten, slik at "hvor mange gir tilbakemelding" kan leses
  // sammen med resten av tallene.
  await incrementMetrics(["feedback_submitted"]);

  return NextResponse.json({ ok: true });
}
