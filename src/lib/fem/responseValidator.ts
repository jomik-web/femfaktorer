/**
 * Response Validator (Dokument 05/09, besluttet v1.5): teknisk håndheving av
 * tonekravet, IKKE bare en instruks i systemprompt. Skanner FEM sine svar for
 * absolutte ord ("alltid", "aldri", "beviser" m.fl.) før visning til bruker.
 *
 * Dette er en enkel, konservativ ordlisteskanner for v1 -- den fanger ikke
 * alle måter å formulere en bastant påstand på, og bør utvides etter hvert
 * som ekte FEM-svar samles inn (se Dokument 08, kontinuerlig forbedring).
 */

const ABSOLUTE_PATTERNS: RegExp[] = [
  /\balltid\b/i,
  /\baldri\b/i,
  /\bbeviser\b/i,
  /\bhundre ?prosent\b/i,
  /\bgarantert\b/i,
  /\bdu er\b/i, // "du er X" er ofte en kategorisk identitetspåstand -- ønsket språk er "dette kan tyde på..."
  /\bdiagnos/i,
];

export interface ValidationResult {
  ok: boolean;
  flaggedTerms: string[];
}

export function validateFemResponse(text: string): ValidationResult {
  const flagged: string[] = [];
  for (const pattern of ABSOLUTE_PATTERNS) {
    const match = text.match(pattern);
    if (match) flagged.push(match[0]);
  }
  return { ok: flagged.length === 0, flaggedTerms: flagged };
}

/** Nøktern, ikke-skyldplasserende fallback dersom valideringen feiler eller AI-leverandøren feiler. */
export const FEM_FALLBACK_MESSAGE =
  "Jeg klarte ikke å formulere et svar jeg er trygg på akkurat nå. Kan du prøve å spørre på en litt annen måte, eller prøve igjen om litt?";
