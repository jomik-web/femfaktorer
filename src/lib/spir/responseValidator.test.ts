import { describe, it, expect } from "vitest";
import { validateSpirResponse, SPIR_FALLBACK_MESSAGE, countSentences } from "./responseValidator";

/**
 * Regresjonstester for Response Validator (kvalitetsrevisjon 2026-07-24,
 * høyt funn: denne filen har hatt to dokumenterte produksjonsbugs tidligere
 * uten at noen test ble lagt til etterpå --
 *
 * - v2.14 (15.07.2026): /\bdu er\b/i var for bred og flagget praktisk talt
 *   ethvert ekte Spir-svar ("du er inne på noe", "du er nysgjerrig").
 * - v2.20-v2.21 (17.07.2026): /\balltid\b/i og /\baldri\b/i flagget vanlige
 *   hedge-konstruksjoner ("det er ikke alltid lett", "du trenger ikke aldri
 *   bekymre deg") som en bastant påstand.
 *
 * Testene under låser begge rettelsene, pluss selve håndhevelsen (bastante
 * påstander, identitetspåstander og diagnose-språk skal fortsatt flagges).
 */
describe("validateSpirResponse", () => {
  it("godkjenner et normalt, forsiktig formulert svar", () => {
    const result = validateSpirResponse(
      "Det kan virke som du ofte trives godt i sosiale situasjoner, men det varierer nok med sammenhengen."
    );
    expect(result.ok).toBe(true);
    expect(result.flaggedTerms).toEqual([]);
  });

  it("regresjon v2.14: flagger IKKE vanlige 'du er'-konstruksjoner uten kategorisk substantiv", () => {
    const result = validateSpirResponse("Du er inne på noe viktig her, og du er nysgjerrig på hvorfor.");
    expect(result.ok).toBe(true);
  });

  it("flagger fortsatt en reell identitetspåstand ('du er en/et/ei X')", () => {
    const result = validateSpirResponse("Du er en introvert, rett og slett.");
    expect(result.ok).toBe(false);
    expect(result.flaggedTerms.length).toBeGreaterThan(0);
  });

  it("regresjon v2.20/v2.21: flagger IKKE 'alltid'/'aldri' i hedge-konstruksjoner med negasjon foran", () => {
    const result = validateSpirResponse(
      "Det er ikke alltid lett å sette ord på dette, og du trenger ikke aldri bekymre deg for det."
    );
    expect(result.ok).toBe(true);
  });

  it("flagger fortsatt en reell bastant påstand med 'alltid'/'aldri'", () => {
    const result = validateSpirResponse("Dette skjer alltid for deg, og du vil aldri oppleve noe annet.");
    expect(result.ok).toBe(false);
    expect(result.flaggedTerms.length).toBeGreaterThan(0);
  });

  it("flagger absolutte ord som 'beviser', 'garantert' og 'hundre prosent'", () => {
    expect(validateSpirResponse("Dette beviser at du er sånn.").ok).toBe(false);
    expect(validateSpirResponse("Det er garantert riktig for deg.").ok).toBe(false);
    expect(validateSpirResponse("Jeg er hundre prosent sikker.").ok).toBe(false);
  });

  it("flagger diagnose-språk", () => {
    const result = validateSpirResponse("Dette kan minne om en diagnose innenfor angstlidelser.");
    expect(result.ok).toBe(false);
  });

  it("SPIR_FALLBACK_MESSAGE er satt og ikke-skyldplasserende", () => {
    expect(SPIR_FALLBACK_MESSAGE.length).toBeGreaterThan(0);
    expect(SPIR_FALLBACK_MESSAGE.toLowerCase()).not.toContain("din feil");
  });
});

describe("countSentences (v2.61)", () => {
  it("teller vanlige setninger", () => {
    expect(countSentences("Én setning.")).toBe(1);
    expect(countSentences("Én. To. Tre.")).toBe(3);
    expect(countSentences("Spørsmål? Ja! Og punktum.")).toBe(3);
  });

  it("håndterer tekst uten avsluttende tegn", () => {
    expect(countSentences("uten punktum")).toBe(1);
    expect(countSentences("   ")).toBe(0);
  });

  it("flagger for lange svar, men ikke korte", () => {
    const kort = "Én. To. Tre. Fire.";
    const langt = "Én. To. Tre. Fire. Fem. Seks. Sju.";
    expect(validateSpirResponse(kort).tooLong).toBe(false);
    expect(validateSpirResponse(langt).tooLong).toBe(true);
    // Lengde alene skal ikke se ut som et tonebrudd.
    expect(validateSpirResponse(langt).flaggedTerms).toEqual([]);
  });
});
