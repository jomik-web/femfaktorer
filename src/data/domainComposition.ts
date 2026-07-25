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
 *
 * v2.18 (16.07.2026): `buildFacetDrivenOverview` over er nå UBRUKT i praksis
 * -- siden alle fem hovedkategorier har fått en fast `synthesis`-tekst (se
 * interpretations.ts v2.17), faller resultat/page.tsx aldri lenger tilbake
 * til den. Fasettbevisstheten er derfor gjenreist på en annen måte, som
 * IKKE gjenbruker fasettsetninger ordrett (de vises jo allerede rett over i
 * Underkategorier-seksjonen): `buildFacetAwareNote` under legger til en kort,
 * dynamisk setning som NEVNER hvilke(n) underkategori(er) som faktisk driver
 * skåren -- pluss samme stereotyp-presisering som før -- vist som en egen
 * linje i tillegg til (ikke i stedet for) den faste synthesis-teksten.
 */

import type { Domain } from "@/data/questions";
import type { DisplayFactor, FacetResult } from "@/lib/scoring";
import { INTERPRETATIONS, bandFor, type Band } from "@/data/interpretations";
import { FACET_ORDER_BY_DOMAIN, FACET_INTERPRETATIONS, facetInterpretationFor } from "@/data/facetInterpretations";

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

/**
 * Kort, KONKRET eksempel-setningsfragment per fasett og retning (v2.35,
 * produkteiers ønske 24.07.2026: "premiumfølelse" på Utvidet-tieren --
 * `buildFacetAwareNote` under skal ikke lenger bare NAVNGI hvilke
 * underkategorier som driver resultatet, men også vise KONKRET hvordan det
 * arter seg). Bevisst en ANNEN, kortere formulering enn den fulle
 * fasettsetningen i facetInterpretations.ts (som allerede vises rett over i
 * Underkategorier-seksjonen) -- for å unngå at teksten føles gjentagende.
 * Hvert fragment er skrevet til å funke etter "at du ...".
 */
const FACET_SIGNATURE: Record<string, { low: string; high: string }> = {
  N1: {
    low: "merker faresignaler og uro raskere enn de fleste",
    high: "klarer å legge bekymringer bak deg usedvanlig fort",
  },
  N2: {
    low: "blir fort synlig frustrert når noe går imot deg",
    high: "holder roen selv når andre rundt deg blir opphisset",
  },
  N3: {
    low: "kjenner motgang ekstra tungt, og bruker tid på å komme deg videre",
    high: "reiser deg raskt igjen etter en tung dag",
  },
  N4: {
    low: "blir ekstra bevisst på egen fremtoning i sosiale situasjoner",
    high: "går inn i ukjente rom uten å bry deg om andres blikk",
  },
  N5: {
    low: "handler på impulsen før du rekker å tenke deg om",
    high: "klarer å vente og tenke selv når fristelsen er sterk",
  },
  N6: {
    low: "kjenner kapasiteten din strekkes tynn når mye skjer samtidig",
    high: "holder hodet klart selv når presset er høyt",
  },
  E1: {
    low: "slipper folk inn gradvis, ikke automatisk",
    high: "får nye bekjentskaper til å føle seg sett raskt",
  },
  E2: {
    low: "henter mer energi fra ett godt selskap enn fra en folkemengde",
    high: "søker aktivt opp folk og fyller rom med liv",
  },
  E3: {
    low: "lar gjerne andre ta ordet og styringen først",
    high: "tar naturlig plass og ordet når noen må lede an",
  },
  E4: {
    low: "trives best med ett prosjekt av gangen, i eget tempo",
    high: "har sjelden bare én ting gående samtidig",
  },
  E5: {
    low: "finner ro i det forutsigbare fremfor det som gir adrenalin",
    high: "trekkes mot fart, høyde og det uforutsigbare",
  },
  E6: {
    low: "holder et jevnt følelsesuttrykk uansett hva som skjer",
    high: "lar entusiasme og glede smitte lett over på andre",
  },
  O1: {
    low: "holder deg til det konkrete fremfor dagdrømmer og hypoteser",
    high: "forsvinner lett inn i tanker og «hva hvis»-scenarier",
  },
  O2: {
    low: "lar funksjon og innhold veie tyngre enn form og estetikk",
    high: "legger merke til skjønnhet i detaljer andre går forbi",
  },
  O3: {
    low: "håndterer følelser praktisk fremfor å analysere dem i dybden",
    high: "kjenner nyansene i eget følelsesliv godt",
  },
  O4: {
    low: "verdsetter det kjente høyere enn det uprøvde",
    high: "trekkes mot nye steder, ruter og løsninger fremfor det vante",
  },
  O5: {
    low: "velger det som funker fremfor det som er interessant i teorien",
    high: "finner energi i komplekse spørsmål og lange resonnementer",
  },
  A1: {
    low: "gir tillit gradvis, og legger merke til uoverensstemmelser andre overser",
    high: "møter folk med et grunnleggende «jeg tror deg»",
  },
  A2: {
    low: "velger ordene med omhu fremfor å si alt du tenker",
    high: "sier det du mener, uten omveier eller skjulte agendaer",
  },
  A3: {
    low: "setter egne mål først, og hjelper når det gir mening",
    high: "gjør andres problem raskt til ditt eget",
  },
  A4: {
    low: "tar kampen direkte når noe står på spill",
    high: "velger heller en løsning alle kan leve med enn å vinne en krangel",
  },
  A5: {
    low: "viser gjerne fram det du har fått til",
    high: "lar resultatene tale for seg fremfor å fremheve dem selv",
  },
  A6: {
    low: "vurderer situasjoner med hodet fremfor hjertet",
    high: "kjenner andres smerte nesten på egen kropp",
  },
  C1: {
    low: "kjenner tvilen melde seg lettere før en oppgave",
    high: "går inn i nye oppgaver med grunnleggende tillit til at du får det til",
  },
  C2: {
    low: "lar et rotete skrivebord forstyrre deg sjelden",
    high: "gir alt sin faste plass, og henter ro fra det",
  },
  C3: {
    low: "tolker regler og løfter med en viss fleksibilitet",
    high: "holder et løfte som et løfte, uansett",
  },
  C4: {
    low: "finner mening andre steder enn i konkurranse og høye mål",
    high: "setter høye mål for deg selv og legger inn innsatsen som skal til",
  },
  C5: {
    low: "kjenner motivasjonen svinge, og skyver gjerne oppgaven en dag til",
    high: "følger gjennom det du har bestemt deg for, selv uten motivasjon",
  },
  C6: {
    low: "handler først og tenker etterpå, oftere enn de fleste",
    high: "har som regel tenkt gjennom konsekvensene før du handler",
  },
};

/**
 * Varierte åpningssetninger for "hvilke underkategorier driver dette"
 * (v2.35) -- valgt per hovedkategori via FACTOR_TEMPLATE_INDEX under, slik at
 * de fem kategoriene i én og samme rapport ikke alle åpner likt. Rent
 * presentasjonsmessig variasjon, ikke et fasitutvalg av "beste" formulering.
 */
const OPENER_TEMPLATES: ((namesJoined: string, flertall: string) => string)[] = [
  (n, f) => `Hos deg er det særlig underkategorien${f} ${n} som driver dette resultatet.`,
  (n, f) => `Grunnen til akkurat denne skåren finner du særlig i underkategorien${f} ${n}.`,
  (n, f) => `Ser du nærmere på tallene, er det underkategorien${f} ${n} som peker seg ut som drivkraften.`,
  (n, f) => `To personer kan lande på samme totalskår her av ganske ulike grunner -- hos deg er det underkategorien${f} ${n} som forklarer mest.`,
  (n, f) => `Det er først og fremst underkategorien${f} ${n} som gir utslaget på denne kategorien.`,
];

/**
 * Varierte "slik viser det seg i praksis"-koblinger til FACET_SIGNATURE-
 * fragmentene over (v2.35) -- samme variasjonsformål som OPENER_TEMPLATES.
 */
const EXAMPLE_CONNECTORS: ((sigA: string, sigB?: string) => string)[] = [
  (a, b) => (b ? `Det viser seg gjerne ved at du ${a}, og at du ${b}.` : `Det viser seg gjerne ved at du ${a}.`),
  (a, b) => (b ? `I praksis handler det om at du ${a} -- og at du samtidig ${b}.` : `I praksis handler det gjerne om at du ${a}.`),
  (a, b) => (b ? `Konkret kan det bety at du ${a}, mens du også ${b}.` : `Konkret kan det bety at du ${a}.`),
];

/** Fast, vilkårlig rekkefølge brukt til å plukke ulik mal per hovedkategori (se OPENER_TEMPLATES/EXAMPLE_CONNECTORS). */
const FACTOR_TEMPLATE_INDEX: Record<DisplayFactor, number> = {
  openness: 0,
  conscientiousness: 1,
  extraversion: 2,
  agreeableness: 3,
  stability: 4,
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

/**
 * Kort, dynamisk tilleggssetning (v2.18) som NEVNER hvilke(n) underkategori-
 * er som faktisk driver hovedkategoriskåren -- uten å gjenta selve
 * fasettsetningen (den står allerede i Underkategorier-seksjonen rett over,
 * se resultat/page.tsx). Vises SAMMEN MED den faste `synthesis`-teksten, som
 * en egen linje -- ikke i stedet for den. Inkluderer samme
 * stereotyp-presisering som buildFacetDrivenOverview brukte (kun for "high"
 * foreløpig, se filhode).
 */
export function buildFacetAwareNote(
  factor: DisplayFactor,
  domainScore: number,
  facetsForDomain: FacetResult[]
): string {
  if (facetsForDomain.length === 0) return "";

  const domainBand = bandFor(domainScore);
  const withDistance: DrivingFacet[] = facetsForDomain.map((facet) => ({
    facet,
    distanceFromMid: Math.abs(facet.score - 50),
  }));
  withDistance.sort((a, b) => b.distanceFromMid - a.distanceFromMid);

  const driving = withDistance.filter((d) => d.distanceFromMid >= DRIVING_FACET_THRESHOLD).slice(0, 2);

  // Svært jevn fasettprofil -- ingen enkelt-underkategori peker seg ut som
  // driver. Sier det eksplisitt fremfor å late som om én fasett stikker seg
  // frem når ingen faktisk gjør det.
  if (driving.length === 0) {
    return "Underkategoriene dine ligger relativt jevnt fordelt her, uten at én bestemt peker seg klart ut som driver -- det er den jevne fordelingen i seg selv som kjennetegner deg på dette området, fremfor ett enkelt utslag.";
  }

  const templateIndex = FACTOR_TEMPLATE_INDEX[factor];
  const labels = driving.map((d) => FACET_INTERPRETATIONS[d.facet.facet]?.label ?? d.facet.facet);
  const namesJoined = labels.length === 2 ? `${labels[0]} og ${labels[1]}` : (labels[0] ?? "");
  const flertall = labels.length === 2 ? "e" : "";
  let note = OPENER_TEMPLATES[templateIndex % OPENER_TEMPLATES.length]!(namesJoined, flertall);

  // v2.35: konkret "slik viser det seg"-setning, bygget fra korte,
  // fasettspesifikke eksempelfragment (FACET_SIGNATURE) -- gir den
  // avsluttende oppsummeringen mer substans og en "premium"-følelse på
  // Utvidet-tieren, fremfor at driver-setningen bare navngir underkategorien
  // uten videre forklaring.
  const signatures = driving
    .map((d) => {
      const band = bandFor(d.facet.score);
      if (band === "mid") return null; // sjelden edge-case (avstand nøyaktig 10 på grensen) -- hopp over fremfor å gjette retning
      return FACET_SIGNATURE[d.facet.facet]?.[band] ?? null;
    })
    .filter((s): s is string => Boolean(s));

  if (signatures.length > 0) {
    const connector = EXAMPLE_CONNECTORS[templateIndex % EXAMPLE_CONNECTORS.length]!(signatures[0]!, signatures[1]);
    note += ` ${connector}`;
  }

  if (domainBand === "high") {
    const stereotypeCode = STEREOTYPE_FACET[factor];
    const stereotypeIsDriving = driving.some((d) => d.facet.facet === stereotypeCode);
    if (!stereotypeIsDriving) {
      const stereotypeFacet = facetsForDomain.find((f) => f.facet === stereotypeCode);
      if (stereotypeFacet && bandFor(stereotypeFacet.score) !== "high") {
        note += ` ${STEREOTYPE_CAVEAT[factor]}`;
      }
    }
  }

  return note;
}

/**
 * v2.36 (produkteiers ønske 24.07.2026): Standard-tieren (120 spm) skal
 * ikke vise selve fasettlisten/-grafene lenger -- det er en Premium/
 * Utvidet-eksklusiv funksjon, se prissammenligningen i /priser. Den skal
 * likevel nevne de TRE mest utpregede underkategoriene ved navn, vevd inn
 * som én løpende setning i hovedteksten, i stedet for å droppe fasettnivået
 * helt. Bevisst enklere enn buildFacetAwareNote over: ingen konkrete
 * "signatur"-eksempler og ingen stereotyp-presisering -- den ekstra dybden
 * skal fortsatt være det som skiller Utvidet fra Standard (se v2.35-notatet
 * om "premiumfølelse" over). Denne er en kort smakebit, ikke en analyse.
 */
export function buildTopFacetsMention(facetsForDomain: FacetResult[]): string {
  if (facetsForDomain.length === 0) return "";

  const withDistance: DrivingFacet[] = facetsForDomain.map((facet) => ({
    facet,
    distanceFromMid: Math.abs(facet.score - 50),
  }));
  withDistance.sort((a, b) => b.distanceFromMid - a.distanceFromMid);

  const top = withDistance.slice(0, 3);
  const labels = top.map((d) => FACET_INTERPRETATIONS[d.facet.facet]?.label ?? d.facet.facet);
  if (labels.length === 0 || !labels[0]) return "";

  const namesJoined =
    labels.length <= 1
      ? labels[0]!
      : labels.length === 2
        ? `${labels[0]} og ${labels[1]}`
        : `${labels.slice(0, -1).join(", ")} og ${labels[labels.length - 1]}`;

  return `Det er særlig underkategoriene ${namesJoined} som gir dette resultatet sitt tydeligste preg.`;
}
