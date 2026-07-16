/**
 * Response Validator (Dokument 05/09, besluttet v1.5): teknisk håndheving av
 * tonekravet, IKKE bare en instruks i systemprompt. Skanner Spir sine svar for
 * absolutte ord ("alltid", "aldri", "beviser" m.fl.) før visning til bruker.
 *
 * Dette er en enkel, konservativ ordlisteskanner for v1 -- den fanger ikke
 * alle måter å formulere en bastant påstand på, og bør utvides etter hvert
 * som ekte Spir-svar samles inn (se Dokument 08, kontinuerlig forbedring).
 */

const ABSOLUTE_PATTERNS: RegExp[] = [
  // v2.21 (17.07.2026, feilrettet): opprinnelig /\balltid\b/i og /\baldri\b/i
  // trigget på HELT vanlige, ufarlige HEDGE-konstruksjoner -- nøyaktig samme
  // klasse feil som "du er X" (v2.14 under): en for bred ordmatch som fanget
  // opp naturlig, forsiktig norsk språkbruk Spir er BEDT om å bruke (se
  // systemPrompt.ts regel 3). "Det er ikke alltid lett" og "du trenger ikke
  // aldri bekymre deg" er hedges, ikke bastante påstander -- men de inneholder
  // jo ordet "alltid"/"aldri". Fikset ved å ikke flagge når ordet kommer rett
  // etter en negasjon ("ikke", "sjelden") -- fanger fortsatt opp den faktisk
  // bastante bruken ("du VIL ALLTID...", "dette skjer ALDRI for deg").
  /(?<!ikke\s)(?<!sjelden\s)\balltid\b/i,
  /(?<!ikke\s)(?<!sjelden\s)\baldri\b/i,
  /\bbeviser\b/i,
  /\bhundre ?prosent\b/i,
  /\bgarantert\b/i,
  // v2.14 (15.07.2026, feilrettet): opprinnelig /\bdu er\b/i var altfor bred --
  // "du er" er en helt vanlig, ufarlig konstruksjon i naturlig norsk
  // ("du er inne på noe", "du er nysgjerrig på det") og traff nesten ethvert
  // ekte Spir-svar, slik at fallback-meldingen ble vist for praktisk talt
  // hver eneste melding. Innsnevret til den grammatiske formen som faktisk
  // kjennetegner en kategorisk identitetspåstand: "du er en/et/ei X"
  // (f.eks. "du er en introvert", "du er et unntak"). Den mer generelle
  // tonekravet ("aldri bastant, aldri en identitetspåstand") håndheves nå i
  // tillegg av systemprompt-regel §3/§7 -- se systemPrompt.ts.
  /\bdu er (en|et|ei)\s+\w+/i,
  /\bdiagnos/i,
];

export interface ValidationResult {
  ok: boolean;
  flaggedTerms: string[];
}

export function validateSpirResponse(text: string): ValidationResult {
  const flagged: string[] = [];
  for (const pattern of ABSOLUTE_PATTERNS) {
    const match = text.match(pattern);
    if (match) flagged.push(match[0]);
  }
  return { ok: flagged.length === 0, flaggedTerms: flagged };
}

/** Nøktern, ikke-skyldplasserende fallback dersom valideringen feiler eller AI-leverandøren feiler. */
export const SPIR_FALLBACK_MESSAGE =
  "Jeg klarte ikke å formulere et svar jeg er trygg på akkurat nå. Kan du prøve å spørre på en litt annen måte, eller prøve igjen om litt?";
