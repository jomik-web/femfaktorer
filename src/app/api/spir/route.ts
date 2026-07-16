import { NextResponse } from "next/server";
import type { FactorResult, FacetResult } from "@/lib/scoring";
import { DOMAIN_TO_DISPLAY, DISPLAY_FACTOR_LABELS_NO } from "@/lib/scoring";
import { buildSpirSystemPrompt, buildGuidedFacetSystemPrompt } from "@/lib/spir/systemPrompt";
import { validateSpirResponse, SPIR_FALLBACK_MESSAGE } from "@/lib/spir/responseValidator";
import { readStore } from "@/lib/admin/store";
import { FACET_INTERPRETATIONS } from "@/data/facetInterpretations";

export const runtime = "nodejs";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5";
const MAX_OUTPUT_TOKENS = 400;
const TEMPERATURE = 0.4;

interface ChatTurn {
  role: "user" | "fem";
  text: string;
}

interface FemRequestBody {
  factors: FactorResult[];
  /** Fasettskår (underkategorier) -- valgfritt felt, se systemPrompt.ts v2.1. */
  facets?: FacetResult[];
  message: string;
  /**
   * Tidligere meldinger i DENNE samtalen (uten den nye `message` over) --
   * lagt til v2.2 slik at Spir faktisk husker egne spørsmål og kan følge dem
   * opp (se systemPrompt.ts v2.2, Anette sin brukertest). Tidligere sendte vi
   * KUN siste melding til Anthropic, uten historikk -- det gjorde reell
   * dialog umulig, siden Spir ikke visste hva den selv nettopp hadde spurt om.
   */
  history?: ChatTurn[];
  /**
   * Sant kun for den aller første, systeminitierte meldingen i en samtale --
   * klienten sender da en generisk instruks som `message`, som ALDRI vises
   * som en "brukermelding" i grensesnittet (se spir/page.tsx). Brukes til å
   * la Spir åpne samtalen selv, se systemPrompt.ts v2.2.
   */
  intro?: boolean;
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
  /**
   * v2.19: guidet fasett-for-fasett-gjennomgang (se lib/spir/systemPrompt.ts,
   * buildGuidedFacetSystemPrompt). Valgfritt -- når det er med, bygges en
   * helt annen systemprompt som holder Spir fokusert på ÉN navngitt
   * underkategori om gangen, i stedet for fri samtale. Klienten
   * (spir/page.tsx) styrer selv rekkefølgen og når man går videre --
   * serveren stoler IKKE på klientens tekstbeskrivelser av fasetten, den
   * validerer bare at `facetCode` finnes i de innsendte fasettdataene og
   * slår opp navn/domene/definisjon selv fra facetInterpretations.ts.
   */
  guidedFacet?: {
    facetCode: string;
    /** Antall Spir-svar allerede gitt PÅ DENNE fasetten i denne økten -- samme "myk brems, ikke vanntett sperre"-forbehold som exchangeCount over. */
    exchangeCountForFacet: number;
    isLastFacetOverall: boolean;
  };
}

/** Antall tidligere utvekslinger (bruker + Spir) vi tar med til Anthropic -- begrenser tokenvekst i lange samtaler. */
const MAX_HISTORY_TURNS = 20;

function isValidChatTurn(value: unknown): value is ChatTurn {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "fem") &&
    typeof v.text === "string" &&
    v.text.length > 0 &&
    v.text.length <= 2000
  );
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

function isValidGuidedFacet(value: unknown): value is NonNullable<FemRequestBody["guidedFacet"]> {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.facetCode === "string" &&
    v.facetCode.length > 0 &&
    typeof v.exchangeCountForFacet === "number" &&
    v.exchangeCountForFacet >= 0 &&
    typeof v.isLastFacetOverall === "boolean"
  );
}

function isValidFacetResult(value: unknown): value is FacetResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.facet === "string" &&
    typeof v.facetName === "string" &&
    typeof v.domain === "string" &&
    typeof v.score === "number" &&
    v.score >= 0 &&
    v.score <= 100
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Spir er ikke konfigurert (mangler API-nøkkel på serveren)." },
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
  // Fasetter er valgfritt -- eldre klientkode kan mangle dem. Er feltet
  // likevel med, må hvert element være gyldig (samme "aldri en stille gjetning"-prinsipp).
  if (body.facets !== undefined && (!Array.isArray(body.facets) || !body.facets.every(isValidFacetResult))) {
    return NextResponse.json({ error: "Ugyldig fasettdata." }, { status: 400 });
  }
  if (body.history !== undefined && (!Array.isArray(body.history) || !body.history.every(isValidChatTurn))) {
    return NextResponse.json({ error: "Ugyldig samtalehistorikk." }, { status: 400 });
  }
  if (body.guidedFacet !== undefined && !isValidGuidedFacet(body.guidedFacet)) {
    return NextResponse.json({ error: "Ugyldig data for guidet gjennomgang." }, { status: 400 });
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
      { error: "Spir er midlertidig slått av av produkteier. Prøv igjen senere." },
      { status: 503 }
    );
  }

  const maxPerSession = settings?.aiMaxQuestionsPerSession ?? Number(process.env.AI_MAX_QUESTIONS_PER_SESSION ?? 100);
  if (typeof body.exchangeCount === "number" && body.exchangeCount >= maxPerSession) {
    return NextResponse.json(
      {
        error:
          "Du har nådd grensen for hvor mange spørsmål Spir kan svare på i denne økten. Takk for at du utforsket resultatet ditt -- prøv gjerne igjen senere.",
      },
      { status: 429 }
    );
  }

  let systemPrompt: string;
  if (body.guidedFacet) {
    // Slår opp fasettmetadata (navn/domene/definisjon) SELV, fra den
    // godkjente kildefilen -- stoler aldri på tekst klienten måtte sende for
    // dette, kun på den validerte fasettkoden (se isValidGuidedFacet over).
    const facetMeta = FACET_INTERPRETATIONS[body.guidedFacet.facetCode];
    const facetScoreEntry = (body.facets ?? []).find((f) => f.facet === body.guidedFacet!.facetCode);
    if (!facetMeta || !facetScoreEntry) {
      return NextResponse.json({ error: "Ugyldig underkategori for guidet gjennomgang." }, { status: 400 });
    }
    systemPrompt = buildGuidedFacetSystemPrompt(body.factors, body.facets ?? [], {
      facetLabel: facetMeta.label,
      facetDescription: facetMeta.description,
      domainLabel: DISPLAY_FACTOR_LABELS_NO[DOMAIN_TO_DISPLAY[facetMeta.domain]],
      facetScore: facetScoreEntry.score,
      exchangeCountForFacet: body.guidedFacet.exchangeCountForFacet,
      isLastFacetOverall: body.guidedFacet.isLastFacetOverall,
    });
  } else {
    systemPrompt = buildSpirSystemPrompt(body.factors, body.facets ?? [], body.exchangeCount ?? 0);
  }

  // Intro-meldingen er en systeminitiert instruks, ikke noe brukeren faktisk
  // skrev -- se FemRequestBody.intro og spir/page.tsx. Erstatter innholdet
  // som faktisk sendes til Anthropic, uten å røre det klienten viser i UI.
  // I guidet modus sender klienten en egen, kort utløsertekst (se
  // spir/page.tsx sine GUIDED_START_TRIGGER/GUIDED_NEXT_TRIGGER) som
  // `body.message` -- selve fasettfokuset ligger i systemPrompt over, ikke i
  // denne teksten, så den trenger ikke gjenta instruksen.
  const currentTurnContent = body.intro
    ? body.guidedFacet
      ? body.message
      : "Start samtalen. Se på hele profilen min over (hovedfaktorer og fasetter) og pek på 1-2 av de tydeligste eller mest uventede funnene -- gjerne en fasett som peker en annen vei enn resten av domenet den hører til, om det finnes en slik i profilen. Åpne med en kort, konkret refleksjon rundt det du finner mest interessant, og avslutt med ETT spørsmål som inviterer meg til å utdype eller kjenne etter."
    : body.message;

  const history = (body.history ?? []).slice(-MAX_HISTORY_TURNS);
  const anthropicMessages = [
    ...history.map((turn) => ({
      role: turn.role === "user" ? ("user" as const) : ("assistant" as const),
      content: turn.text,
    })),
    { role: "user" as const, content: currentTurnContent },
  ];

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
        messages: anthropicMessages,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Fikk ikke kontakt med Spir sin AI-leverandør. Prøv igjen om litt." },
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
            ? "Spir er midlertidig overbelastet. Prøv igjen om litt."
            : "Noe gikk galt hos Spir sin AI-leverandør. Prøv igjen om litt.",
      },
      { status }
    );
  }

  const data = await anthropicRes.json();
  const text: string = data?.content?.[0]?.text ?? "";

  if (!text) {
    // v2.21: logg til Netlify sine funksjonslogger -- før dette var
    // fallback-meldingen en "svart boks" uten spor, umulig å diagnostisere i
    // etterkant når produkteier rapporterte at den dukket opp. Logger ALDRI
    // brukerens egen melding eller resultatdata, kun Anthropic-svarets egen
    // stopp-årsak (nyttig for å skille "tom respons" fra andre feilmodus).
    console.error("[spir] Tomt svar fra Anthropic", { stopReason: data?.stop_reason ?? null });
    return NextResponse.json({ reply: SPIR_FALLBACK_MESSAGE, flagged: false });
  }

  const validation = validateSpirResponse(text);
  if (!validation.ok) {
    // Teknisk håndheving (besluttet v1.5): ikke vis et svar som bryter tonekravet.
    // v2.21: logg de faktiske flaggede ordene + selve svarteksten, slik at et
    // ev. gjentakende falskt positivt treff i ABSOLUTE_PATTERNS (se
    // responseValidator.ts) faktisk kan spores og rettes, i stedet for å
    // forbli en uforklarlig, gjentakende feilmelding for brukeren.
    console.error("[spir] Svar flagget av tonesjekken", {
      flaggedTerms: validation.flaggedTerms,
      text,
    });
    return NextResponse.json({
      reply: SPIR_FALLBACK_MESSAGE,
      flagged: true,
      flaggedTerms: validation.flaggedTerms,
    });
  }

  return NextResponse.json({ reply: text, flagged: false });
}
