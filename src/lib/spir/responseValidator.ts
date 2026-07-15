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
  /\balltid\b/i,
  /\baldri\b/i,
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
