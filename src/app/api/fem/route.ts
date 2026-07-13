import { NextResponse } from "next/server";
import type { FactorResult } from "@/lib/scoring";
import { buildFemSystemPrompt } from "@/lib/fem/systemPrompt";
import { validateFemResponse, FEM_FALLBACK_MESSAGE } from "@/lib/fem/responseValidator";
import { readStore } from "@/lib/admin/store";

export const runtime = "nodejs";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5";
const MAX_OUTPUT_TOKENS = 400;
const TEMPERATURE = 0.4;

interface FemRequestBody {
  factors: FactorResult[];
  message: string;
  /**
   * Antall AI-utvekslinger så langt i denne økten, rapportert av klienten.
   * MERK (ærlig begrensning i v1): dette er en klientrapportert telling, ikke
   * en serverautoritativ en -- statsløs arkitektur i v1 (Grunnlagsdokumentet
   * §3.7) har ingen persistent økt-lagring på serveren. Det fungerer som en
   * anti-misbruk-bremse for vanlig bruk, IKKE som en vanntett økonomisk
   * sperre. Et ekte globalt tak krever en backend-teller, planlagt inn i
   * administrasjonspanelet (Dokument 09 §21.1), ikke bygget i dette utkastet.
   */
  exchangeCount: number;
}

function isValidFactorResult(value: unknown): value is FactorResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.factor === "string" &&
    typeof v.label === "string" &&
    typeof v.score === "number" &&
    v.score >= 0 &&
    v.score <= 100
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FEM er ikke konfigurert (mangler API-nøkkel på serveren)." },
      { status: 503 }
    );
  }

  let body: FemRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (
    !Array.isArray(body.factors) ||
    body.factors.length === 0 ||
    !body.factors.every(isValidFactorResult)
  ) {
    return NextResponse.json({ error: "Mangler eller ugyldig resultatobjekt." }, { status: 400 });
  }
  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Meldingen kan ikke være tom." }, { status: 400 });
  }
  if (body.message.length > 2000) {
    return NextResponse.json({ error: "Meldingen er for lang." }, { status: 400 });
  }

  // Admin-panelets nødstopp og justerbare tak (Dokument 09 §21.1) -- leses
  // ved hver forespørsel, ikke bare ved oppstart, slik at en endring i
  // panelet virker uten ny utrulling.
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch {
    settings = null; // fillagringen kan mangle f.eks. rett etter kald start -- fall tilbake til env
  }

  if (settings && !settings.aiEnabled) {
    return NextResponse.json(
      { error: "FEM er midlertidig slått av av produkteier. Prøv igjen senere." },
      { status: 503 }
    );
  }

  const maxPerSession = settings?.aiMaxQuestionsPerSession ?? Number(process.env.AI_MAX_QUESTIONS_PER_SESSION ?? 100);
  if (typeof body.exchangeCount === "number" && body.exchangeCount >= maxPerSession) {
    return NextResponse.json(
      {
        error:
          "Du har nådd grensen for hvor mange spørsmål FEM kan svare på i denne økten. Takk for at du utforsket resultatet ditt -- prøv gjerne igjen senere.",
      },
      { status: 429 }
    );
  }

  const systemPrompt = buildFemSystemPrompt(body.factors);

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: settings?.aiModel || process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
        system: systemPrompt,
        messages: [{ role: "user", content: body.message }],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Fikk ikke kontakt med FEM sin AI-leverandør. Prøv igjen om litt." },
      { status: 502 }
    );
  }

  if (!anthropicRes.ok) {
    // Ikke lekk leverandørspesifikke feildetaljer til klienten.
    const status = anthropicRes.status === 429 ? 429 : 502;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "FEM er midlertidig overbelastet. Prøv igjen om litt."
            : "Noe gikk galt hos FEM sin AI-leverandør. Prøv igjen om litt.",
      },
      { status }
    );
  }

  const data = await anthropicRes.json();
  const text: string = data?.content?.[0]?.text ?? "";

  if (!text) {
    return NextResponse.json({ reply: FEM_FALLBACK_MESSAGE, flagged: false });
  }

  const validation = validateFemResponse(text);
  if (!validation.ok) {
    // Teknisk håndheving (besluttet v1.5): ikke vis et svar som bryter tonekravet.
    return NextResponse.json({
      reply: FEM_FALLBACK_MESSAGE,
      flagged: true,
      flaggedTerms: validation.flaggedTerms,
    });
  }

  return NextResponse.json({ reply: text, flagged: false });
}
