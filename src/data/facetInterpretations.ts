/**
 * Tolkningstekst per FASETT (underkategori) -- kun brukt for den fulle testen
 * (120 spørsmål, se resultat/page.tsx). Fasettvisning var opprinnelig utsatt
 * til "fase 2" (Grunnlagsdokumentet §7.1, Dokument 03 §7/§20.1), men
 * produkteier har bedt om at det tas i bruk nå for stortesten (v2.1).
 *
 * Innholdet er hentet fra og bygger direkte på Dokument 04 §13 (det
 * forhåndsskrevne fasettbiblioteket) -- norske bipolare visningsnavn og
 * korte definisjoner er ikke nye, de er gjenbruk av allerede vedtatt
 * innhold. Tekstretningen (low/high) er kontrollert opp mot hvordan
 * `computeFacetResults` i scoring.ts regner ut skåren (N-fasetter speilvendt
 * til samme retning som hoveddomenet "Emosjonell stabilitet").
 *
 * O6 (Liberalism) er UTELATT av samme GDPR-grunn som i questions.ts --
 * finnes derfor ikke her. 29 av de 30 IPIP-fasettene er dekket.
 *
 * MERK: som resten av tolkningsteksten i produktet, skal dette gjennom
 * planlagt faglig kvalitetssikring (Dokument 01 §21 punkt 14) før reell
 * lansering.
 */

import type { Domain } from "@/data/questions";
import type { Band } from "@/data/interpretations";

export interface FacetInterpretation {
  /** Norsk bipolart visningsnavn, f.eks. "Bekymring / ro". */
  label: string;
  domain: Domain;
  /** Kort, nøytral definisjon av hva fasetten måler. */
  description: string;
  low: string;
  mid: string;
  high: string;
}

const MID_FALLBACK =
  "Resultatet ditt her ligger nokså midt på treet -- trolig en blanding av de to retningene, eller noe som varierer med situasjonen.";

export const FACET_INTERPRETATIONS: Record<string, FacetInterpretation> = {
  N1: {
    label: "Bekymring / ro",
    domain: "N",
    description: "Hvor lett man aktiveres av fare, usikkerhet og bekymring.",
    low: "Trekker mot lavere emosjonell stabilitet her: du registrerer trusler raskt og kan bekymre deg mer enn mange andre.",
    mid: MID_FALLBACK,
    high: "Trekker mot høyere emosjonell stabilitet her: du beholder lettere roen og slipper bekymringer raskere enn mange andre.",
  },
  N2: {
    label: "Irritabilitet / sindighet",
    domain: "N",
    description: "Tilbøyelighet til irritasjon, frustrasjon og sinne.",
    low: "Du reagerer nok lettere med irritasjon og tydelige følelsesutbrudd enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du holder oftere hodet kaldt og blir sjeldnere irritert enn mange andre.",
  },
  N3: {
    label: "Nedstemthet / motstandskraft",
    domain: "N",
    description: "Tilbøyelighet til nedstemthet, håpløshet og lavt stemningsleie.",
    low: "Du kan lettere oppleve nedstemthet og negative selvvurderinger enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du har oftere et stabilt stemningsleie og kommer lettere ut av nedstemthet enn mange andre.",
  },
  N4: {
    label: "Sosial selvbevissthet / trygghet",
    domain: "N",
    description: "Ubehag ved oppmerksomhet, vurdering og uvante sosiale situasjoner.",
    low: "Du kan bli mer selvbevisst og usikker enn mange andre når andre vurderer deg.",
    mid: MID_FALLBACK,
    high: "Du er ofte mer komfortabel enn mange andre med oppmerksomhet og uvante sosiale situasjoner.",
  },
  N5: {
    label: "Impulskontroll",
    domain: "N",
    description: "Hvor lett sterke ønsker og fristelser tar styringen.",
    low: "Du kan ha sterkere impulser og et større behov for aktiv selvregulering enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du har lettere enn mange andre for å avstå, vente og regulere umiddelbare behov.",
  },
  N6: {
    label: "Sårbarhet under press",
    domain: "N",
    description: "Evne til å tenke og handle når belastningen blir høy.",
    low: "Du kan lettere føle deg overveldet enn mange andre når flere krav kommer samtidig.",
    mid: MID_FALLBACK,
    high: "Du bevarer oftere oversikt og handlekraft under høyt press enn mange andre.",
  },
  E1: {
    label: "Varme",
    domain: "E",
    description: "Hvor lett man uttrykker vennlighet og nærhet.",
    low: "Du er nok noe mer tilbakeholden med varme og personlig nærhet enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du viser lett entusiasme, vennlighet og personlig interesse for andre.",
  },
  E2: {
    label: "Sosiabilitet",
    domain: "E",
    description: "Hvor mye samvær og grupper man søker.",
    low: "Du foretrekker nok oftere mindre grupper, ro eller mer alenetid enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du søker oftere fellesskap, grupper og hyppig sosial kontakt enn mange andre.",
  },
  E3: {
    label: "Selvhevdelse",
    domain: "E",
    description: "Hvor tydelig man tar ordet, leder og påvirker.",
    low: "Du lar nok oftere andre ta plass og påvirker mer indirekte enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du tar lettere ordet, leder og gjør egne synspunkter synlige.",
  },
  E4: {
    label: "Aktivitetsnivå",
    domain: "E",
    description: "Tempo, travelhet og behov for å være i gang.",
    low: "Du trives nok oftere med et roligere tempo og færre samtidige aktiviteter enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du har ofte høyt tempo og liker å ha mye på gang samtidig.",
  },
  E5: {
    label: "Spenningssøking",
    domain: "E",
    description: "Behov for intensitet, risiko og sterk stimulering.",
    low: "Du foretrekker nok forutsigbarhet og moderat stimulering fremfor sterke inntrykk.",
    mid: MID_FALLBACK,
    high: "Du søker oftere fart, variasjon og intense opplevelser enn mange andre.",
  },
  E6: {
    label: "Positive følelser",
    domain: "E",
    description: "Hvor lett man opplever og uttrykker glede og entusiasme.",
    low: "Du uttrykker nok glede noe mer dempet, og kan ha et jevnere følelsesuttrykk enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du opplever og viser ofte entusiasme, glede og optimisme.",
  },
  O1: {
    label: "Fantasi",
    domain: "O",
    description: "Tilbøyelighet til indre bilder, forestillingsevne og dagdrømmer.",
    low: "Du holder deg nok oftere til det konkrete og faktiske enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du bruker lett fantasi og forestillingsevne som en del av tenkningen din.",
  },
  O2: {
    label: "Estetisk interesse",
    domain: "O",
    description: "Følsomhet for kunst, form, musikk og skjønnhet.",
    low: "Du har nok mindre behov for estetiske opplevelser i hverdagen enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du legger ofte merke til, og berøres av, kunst og estetiske uttrykk.",
  },
  O3: {
    label: "Følelsesbevissthet",
    domain: "O",
    description: "Oppmerksomhet på egne følelsesnyanser.",
    low: "Du forholder deg nok mer praktisk og mindre analyserende til følelser enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du registrerer og utforsker lettere følelsesmessige nyanser hos deg selv.",
  },
  O4: {
    label: "Eventyrlyst",
    domain: "O",
    description: "Vilje til å prøve nye aktiviteter, steder og rutiner.",
    low: "Du foretrekker nok oftere kjente rammer og etablerte måter å gjøre ting på.",
    mid: MID_FALLBACK,
    high: "Du oppsøker lettere nye erfaringer, steder og arbeidsmåter enn mange andre.",
  },
  O5: {
    label: "Intellektuell nysgjerrighet",
    domain: "O",
    description: "Interesse for ideer, komplekse spørsmål og abstrakt tenkning.",
    low: "Du foretrekker nok konkrete problemstillinger og praktisk anvendelse fremfor teori.",
    mid: MID_FALLBACK,
    high: "Du trives ofte med ideer, analyse og komplekse spørsmål.",
  },
  A1: {
    label: "Tillit",
    domain: "A",
    description: "Forventning om at andre vanligvis er ærlige og velvillige.",
    low: "Du er nok mer varsom enn mange andre, og krever oftere bevis før du gir tillit.",
    mid: MID_FALLBACK,
    high: "Du gir lettere andre tillit, og tolker oftere intensjoner velvillig.",
  },
  A2: {
    label: "Rettframhet",
    domain: "A",
    description: "Grad av direkte, oppriktig og lite strategisk kommunikasjon.",
    low: "Du er nok noe mer strategisk og tilbakeholden med hele din hensikt enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du kommuniserer ofte rett fram og uten skjulte motiver.",
  },
  A3: {
    label: "Hjelpsomhet",
    domain: "A",
    description: "Vilje til å hjelpe og bidra til andres velferd.",
    low: "Du prioriterer nok oftere egne mål, og vurderer hjelp mer selektivt enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du tilbyr lett hjelp, og reagerer raskt på andres behov.",
  },
  A4: {
    label: "Ettergivenhet",
    domain: "A",
    description: "Måte å møte konflikt, uenighet og konkurranse på.",
    low: "Du står nok hardere på ditt, og går lettere inn i konfrontasjon enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du søker oftere kompromiss, og forsøker å dempe konflikt når den oppstår.",
  },
  A5: {
    label: "Beskjedenhet",
    domain: "A",
    description: "Hvor mye man framhever egne kvaliteter og prestasjoner.",
    low: "Du er nok mer komfortabel enn mange andre med å synliggjøre egne styrker.",
    mid: MID_FALLBACK,
    high: "Du toner oftere ned egne prestasjoner, og unngår selvhevdende framstilling.",
  },
  A6: {
    label: "Medfølelse",
    domain: "A",
    description: "Følsomhet for andres smerte og behov.",
    low: "Du vurderer nok situasjoner mer distansert og saklig enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du berøres lettere av andres situasjon, og viser omsorg raskt.",
  },
  C1: {
    label: "Mestringstro",
    domain: "C",
    description: "Tro på egen evne til å løse oppgaver og få ting gjort.",
    low: "Du kan tvile noe mer enn mange andre på egen gjennomføringsevne.",
    mid: MID_FALLBACK,
    high: "Du har ofte tillit til at oppgaver kan håndteres og fullføres.",
  },
  C2: {
    label: "Orden",
    domain: "C",
    description: "Behov for struktur, ryddighet og faste systemer.",
    low: "Du tolererer nok mer uorden, og improviserer lettere enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du skaper gjerne systemer, orden og forutsigbarhet rundt deg.",
  },
  C3: {
    label: "Pliktfølelse",
    domain: "C",
    description: "Forhold til regler, løfter og forpliktelser.",
    low: "Du vurderer nok regler og forpliktelser mer fleksibelt enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du tar løfter, plikter og ansvar svært alvorlig.",
  },
  C4: {
    label: "Prestasjonsstreben",
    domain: "C",
    description: "Ambisjon, innsats og mål om å oppnå mye.",
    low: "Du har nok mindre behov for konkurranse og høye prestasjonsmål enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du setter ofte høye mål, og investerer mye innsats i å nå dem.",
  },
  C5: {
    label: "Selvdisiplin",
    domain: "C",
    description: "Evne til å starte og fullføre krevende eller lite lystbetonte oppgaver.",
    low: "Du kan lettere utsette eller miste fremdrift når motivasjonen er lav, sammenlignet med mange andre.",
    mid: MID_FALLBACK,
    high: "Du holder oftere fast ved oppgaver til de er fullført.",
  },
  C6: {
    label: "Overveielse",
    domain: "C",
    description: "Hvor mye man vurderer konsekvenser før handling.",
    low: "Du handler nok noe raskere og mer spontant enn mange andre.",
    mid: MID_FALLBACK,
    high: "Du tenker oftere gjennom alternativer og konsekvenser før du handler.",
  },
};

/** Rekkefølge fasetter skal vises i under hvert domene (IPIP-standardrekkefølge). */
export const FACET_ORDER_BY_DOMAIN: Record<Domain, string[]> = {
  N: ["N1", "N2", "N3", "N4", "N5", "N6"],
  E: ["E1", "E2", "E3", "E4", "E5", "E6"],
  O: ["O1", "O2", "O3", "O4", "O5"], // O6 utelatt, se filhode
  A: ["A1", "A2", "A3", "A4", "A5", "A6"],
  C: ["C1", "C2", "C3", "C4", "C5", "C6"],
};

export function facetInterpretationFor(facet: string, band: Band): string {
  const entry = FACET_INTERPRETATIONS[facet];
  if (!entry) return "";
  return entry[band];
}
