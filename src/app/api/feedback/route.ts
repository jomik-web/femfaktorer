import { NextResponse } from "next/server";
import { storeFeedback, type FeedbackEntry } from "@/lib/feedback/blobs";
import { incrementMetrics } from "@/lib/metrics/blobs";
import { APP_VERSION } from "@/lib/version";

export const runtime = "nodejs";

/** Maks lengde på fritekst. Nok til et grundig avsnitt, lite nok til å ikke kunne misbrukes som lagring. */
const MAX_MESSAGE_LENGTH = 4000;

/** Hvilke deler av nettstedet en tilbakemelding kan gjelde. Lukket liste, som hendelsesnavnene i metrics. */
const AREAS = ["testen", "resultatet", "spir", "spraket", "teknisk", "annet"] as const;

/**
 * Tar imot en betatilbakemelding. Leser bevisst ingen cookies eller økt --
 * skjemaet er anonymt, som Google-skjemaet det erstatter.
 *
 * Appversjonen settes her på serveren, ikke av klienten. Det er hele poenget
 * med feltet: en klage må kunne knyttes til NØYAKTIG den versjonen testeren
 * så, ellers er den umulig å tolke etter noen utrullinger -- gjaldt den en
 * feil som allerede er rettet, eller står den fortsatt?
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    message?: unknown;
    rating?: unknown;
    area?: unknown;
    device?: unknown;
    durationSeconds?: unknown;
  } | null;

  if (!body || typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Skriv noe før du sender." }, { status: 400 });
  }

  const message = body.message.trim().slice(0, MAX_MESSAGE_LENGTH);

  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : null;

  const area =
    typeof body.area === "string" && (AREAS as readonly string[]).includes(body.area)
      ? body.area
      : "annet";

  const entry: FeedbackEntry = {
    submittedAt: new Date().toISOString(),
    rating,
    message,
    area,
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
