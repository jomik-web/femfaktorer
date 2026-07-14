/**
 * Fasettstyrt hovedtekst (v2.9, designgjennomgang). Bakgrunn: de statiske
 * overview-tekstene i interpretations.ts (én per hovedkategori × 3 nivåbånd)
 * beskriver ofte det STEREOTYPE ved hovedkategorien -- f.eks. "du fører
 * gjerne lister" for høy Planmessighet -- selv når det er en annen fasett
 * (mestringstro, pliktfølelse, prestasjonsstreben) som faktisk driver
 * skåren, og den stereotype fasetten (Orden) ligger midt på treet. Bekreftet
 * konkret i produsert PDF-rapport 14.07.2026.
 *
 * Denne filen bygger IKKE nye tekstblokker fra bunnen. Den setter sammen
 * allerede skrevne, godkjente fasettsetninger (facetInterpretations.ts) til
 * en hovedtekst som faktisk reflekterer HVILKE fasetter som er tydelige for
 * denne personen -- pluss en kort presisering når den stereotype fasetten
 * for kategorien ikke er blant dem.
 *
 * Brukes KUN for den fulle testen (der fasettdata finnes). Korttestens
 * foreløpige resultat (50 spørsmål, ingen fasettdata) bruker fortsatt den
 * statiske INTERPRETATIONS[factor][band].overview uendret -- se
 * resultat/page.tsx.
 *
 * Omfang v1: kun `overview`-feltet er fasettstyrt. `nuance`, `reflection`,
 * `careerNote` og `relationshipNote` er fortsatt nivåbånd-tekst, siden de
 * handler mer om konsekvenser/implikasjoner enn om konkrete atferdspåstander
 * -- der er stereotyp-problemet mindre akutt. Presiseringssetningen (punkt
 * 6 under) er også kun bygget for "high"-båndet foreløpig, siden det er der
 * problemet er tydeligst dokumentert; kan utvides til "low" senere.
 */

import type { Domain } from "@/data/questions";
import type { DisplayFactor, FacetResult } from "@/lib/scoring";
import { INTERPRETATIONS, bandFor, type Band } from "@/data/interpretations";
import { FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";

/**
 * Kort, generisk åpningssetning per hovedkategori og nivåbånd -- bevisst UTEN
 * konkrete atferdspåstander (det er nettopp det de fasettstyrte setningene
 * under skal levere). Domenenavnet + bånd er alt som er "sikkert" på dette
 * nivået.
 */
const DOMAIN_BAND_OPENER: Record<DisplayFactor, Record<Band, string>> = {
  stability: {
    low: "Emosjonell stabilitet peker seg ut som et område med tydelige svingninger for deg.",
    mid: "Emosjonell stabilitet ser ut til å variere en del for deg, avhengig av situasjonen.",
    high: "Emosjonell stabilitet peker seg tydelig ut som et trekk ved deg.",
  },
  extraversion: {
    low: "Ekstroversjon peker seg ut som et område der du gjerne holder lavere profil.",
    mid: "Ekstroversjon ser ut til å variere en del for deg, avhengig av situasjonen.",
    high: "Ekstroversjon peker seg tydelig ut som et trekk ved deg.",
  },
  openness: {
    low: "Åpenhet for erfaring peker seg ut som et område der du foretrekker det kjente.",
    mid: "Åpenhet for erfaring ser ut til å variere en del for deg, avhengig av situasjonen.",
    high: "Åpenhet for erfaring peker seg tydelig ut som et trekk ved deg.",
  },
  agreeableness: {
    low: "Medmenneskelighet peker seg ut som et område der du setter egne behov først.",
    mid: "Medmenneskelighet ser ut til å variere en del for deg, avhengig av hvem det gjelder.",
    high: "Medmenneskelighet peker seg tydelig ut som et trekk ved deg.",
  },
  conscientiousness: {
    low: "Planmessighet peker seg ut som et område der du foretrekker fleksibilitet.",
    mid: "Planmessighet ser ut til å variere en del for deg, avhengig av oppgaven.",
    high: "Planmessighet peker seg tydelig ut som et trekk ved deg.",
  },
};

/**
 * Den fasetten folk flest forbinder mest med selve hovedkategorinavnet --
 * brukt til å avgjøre når en presisering trengs (se STEREOTYPE_CAVEAT).
 * Dette er et redaksjonelt valg, ikke en fasit -- juster gjerne om dere er
 * uenige i hvilken fasett som er "mest stereotyp" per kategori.
 */
const STEREOTYPE_FACET: Record<DisplayFactor, string> = {
  stability: "N1", // Bekymring / ro
  extraversion: "E2", // Sosiabilitet
  openness: "O4", // Eventyrlyst
  agreeableness: "A3", // Hjelpsomhet
  conscientiousness: "C2", // Orden
};

const STEREOTYPE_CAVEAT: Record<DisplayFactor, string> = {
  stability:
    "Det betyr derimot ikke nødvendigvis at ingenting biter på deg -- din variant av emosjonell stabilitet kan handle mer om hvordan du håndterer press generelt enn om et fravær av bekymring spesifikt.",
  extraversion:
    "Det betyr derimot ikke nødvendigvis at du trenger mye sosial kontakt eller store folkemengder rundt deg hele tiden -- din variant av ekstroversjon handler mer om gjennomslagskraft og energi enn om et sterkt behov for selskap.",
  openness:
    "Det betyr derimot ikke nødvendigvis at du aktivt oppsøker nye opplevelser eller ukjente steder -- din variant av åpenhet kan handle mer om indre nysgjerrighet, fantasi eller følelser enn om et behov for å prøve noe nytt utad.",
  agreeableness:
    "Det betyr derimot ikke nødvendigvis at du alltid stiller opp praktisk for andre -- din variant av medmenneskelighet kan handle mer om tillit, ærlighet eller konfliktdemping enn om aktiv hjelpsomhet.",
  conscientiousness:
    "Det betyr derimot ikke nødvendigvis at du er spesielt ryddig eller systematisk i hverdagen -- din variant av planmessighet handler mer om ansvar, ambisjon og gjennomtenkthet enn om faste rutiner og orden.",
};

/** Hvor mange poeng fra midten (50) en fasett må ligge for å telle som "driver'n" bak domeneskåren. */
const DRIVING_FACET_THRESHOLD = 10; // tilsvarer band !== "mid" (bandFor: <40 low, >60 high)

interface DrivingFacet {
  facet: FacetResult;
  distanceFromMid: number;
}

/**
 * Setter sammen en fasettstyrt overview-tekst for én hovedkategori. Faller
 * tilbake til den statiske bånd-teksten dersom det ikke finnes fasettdata
 * (bør ikke skje for fullversjonen, men koden skal aldri krasje på det).
 */
export function buildFacetDrivenOverview(
  factor: DisplayFactor,
  domain: Domain,
  domainScore: number,
  facetsForDomain: FacetResult[]
): string {
  const domainBand = bandFor(domainScore);
  const fallback = INTERPRETATIONS[factor][domainBand].overview;

  if (facetsForDomain.length === 0) return fallback;

  const withDistance: DrivingFacet[] = facetsForDomain.map((facet) => ({
    facet,
    distanceFromMid: Math.abs(facet.score - 50),
  }));
  withDistance.sort((a, b) => b.distanceFromMid - a.distanceFromMid);

  const driving = withDistance
    .filter((d) => d.distanceFromMid >= DRIVING_FACET_THRESHOLD)
    .slice(0, 2);

  // Svært jevn profil på tvers av fasettene -- ingen tydelig "driver".
  // Bruk uansett de(n) mest utpregede fasetten/e, selv om de er midt på
  // treet, fremfor å vise en tom hovedtekst.
  const chosen = driving.length > 0 ? driving : withDistance.slice(0, 2);

  const facetSentences = chosen
    .map((d) => facetInterpretationFor(d.facet.facet, bandFor(d.facet.score)))
    .filter((text) => text.length > 0);

  if (facetSentences.length === 0) return fallback;

  const opener = DOMAIN_BAND_OPENER[factor][domainBand];

  let caveat = "";
  if (domainBand === "high") {
    const stereotypeCode = STEREOTYPE_FACET[factor];
    const stereotypeIsDriving = driving.some((d) => d.facet.facet === stereotypeCode);
    if (!stereotypeIsDriving) {
      const stereotypeFacet = facetsForDomain.find((f) => f.facet === stereotypeCode);
      // Presiser bare når vi faktisk har data for stereotyp-fasetten, og den
      // ikke selv er "high" (da er det ingen motsigelse å presisere noe om).
      if (stereotypeFacet && bandFor(stereotypeFacet.score) !== "high") {
        caveat = STEREOTYPE_CAVEAT[factor];
      }
    }
  }

  return [opener, ...facetSentences, caveat].filter((s) => s.length > 0).join(" ");
}
