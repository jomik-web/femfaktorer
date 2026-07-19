/**
 * Betaversjonsnummer vist ved siden av "Dine Fasetter"-logoen i toppmenyen
 * (v2.34, produkteiers ønske 19.07.2026) -- IKKE det samme som `version` i
 * package.json (som følger npm sin semver-konvensjon og ikke er ment for
 * visning). Dette tallet følger i stedet changelog-nummereringen i
 * OPPGAVER-FOR-PRODUKTEIER.md, slik at produkteier kjenner igjen tallet fra
 * loggen sin. Husk å oppdatere denne konstanten sammen med hver ny
 * changelog-oppføring.
 */
export const APP_VERSION = "2.34";
