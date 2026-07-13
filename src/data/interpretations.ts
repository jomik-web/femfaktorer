/**
 * Tolkningstekst per faktor og skårbånd.
 *
 * VIKTIG: dette er et FØRSTEUTKAST skrevet for å følge tonereglene i
 * Dokument 01 §12 / Dokument 02 §3.3 / Grunnlagsdokumentet §8 (aldri
 * kategorisk/diagnostisk, alltid "kan tyde på"/"ofte", alltid både
 * ressurser og utfordringer). Det er IKKE hentet ordrett fra Dokument 04
 * sitt innholdsbibliotek (den fulltekst-versjonen var ikke tilgjengelig i
 * denne økten). Dette MÅ samkjøres med Dokument 04 og gjennom den planlagte
 * faglige kvalitetssikringen (Dokument 01 §21 punkt 14) før reell lansering.
 */

import type { DisplayFactor } from "@/lib/scoring";

export type Band = "low" | "mid" | "high";

export function bandFor(score: number): Band {
  if (score < 40) return "low";
  if (score > 60) return "high";
  return "mid";
}

export interface Interpretation {
  summary: string;
  resources: string;
  challenges: string;
  reflection: string;
}

type Copy = Record<DisplayFactor, Record<Band, Interpretation>>;

export const INTERPRETATIONS: Copy = {
  openness: {
    low: {
      summary: "Du ser ut til å foretrekke det kjente og konkrete fremfor det abstrakte og nye.",
      resources: "Dette kan gjøre deg praktisk og forutsigbar å samarbeide med.",
      challenges: "I situasjoner som krever nytenkning kan det være nyttig å bevisst oppsøke nye perspektiver.",
      reflection: "Er det områder i livet ditt der litt mer nysgjerrighet kunne åpnet nye dører?",
    },
    mid: {
      summary: "Du ser ut til å veksle mellom det kjente og det nye, avhengig av situasjon.",
      resources: "Dette kan gi deg fleksibilitet til å tilpasse deg ulike sammenhenger.",
      challenges: "Noen ganger kan det oppleves som at du ikke helt vet om du skal velge det trygge eller det nye.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din slår mest inn?",
    },
    high: {
      summary: "Du ser ut til å tiltrekkes av nye ideer, opplevelser og perspektiver.",
      resources: "Dette kan gjøre deg kreativ og åpen for endring.",
      challenges: "I situasjoner som krever rutine og forutsigbarhet kan det samme trekket oppleves som utålmodighet.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det steder du skulle ønske du turte mer?",
    },
  },
  conscientiousness: {
    low: {
      summary: "Du ser ut til å ta ting mer som de kommer, fremfor å planlegge i detalj.",
      resources: "Dette kan gjøre deg fleksibel og god til å improvisere.",
      challenges: "I situasjoner som krever nøye oppfølging kan det være nyttig med litt mer struktur.",
      reflection: "Er det noen områder der litt mer planlegging ville gjort hverdagen lettere?",
    },
    mid: {
      summary: "Du ser ut til å ha en balansert tilnærming til planlegging og fleksibilitet.",
      resources: "Dette kan gjøre deg tilpasningsdyktig -- du strukturerer når det trengs, uten å bli rigid.",
      challenges: "Noen ganger kan det være uklart for deg selv hvor mye struktur en oppgave egentlig krever.",
      reflection: "Når opplever du at planlegging hjelper deg mest -- og når føles den overflødig?",
    },
    high: {
      summary: "Du ser ut til å være grundig og pålitelig, og liker å ha kontroll på detaljer.",
      resources: "Dette er ofte en styrke når noe krever nøyaktighet og oppfølging over tid.",
      challenges: "I situasjoner med rask endring kan det samme trekket kreve at du bevisst gir deg selv litt mer fleksibilitet.",
      reflection: "Er det situasjoner der behovet ditt for orden gjør ting vanskeligere enn de trenger å være?",
    },
  },
  extraversion: {
    low: {
      summary: "Du ser ut til å hente energi mer fra ro og alenetid enn fra sosiale situasjoner.",
      resources: "Dette kan gi deg godt fokus og evne til dypere, mer skjermet konsentrasjon.",
      challenges: "I situasjoner som krever mye sosial energi kan det kjennes krevende å holde ut over tid.",
      reflection: "Hvordan balanserer du behovet for ro opp mot situasjoner som krever at du er sosial?",
    },
    mid: {
      summary: "Du ser ut til å trives både i sosiale sammenhenger og med tid alene.",
      resources: "Dette kan gjøre deg tilpasningsdyktig i ulike sosiale situasjoner.",
      challenges: "Noen ganger kan det være krevende å vite hva du egentlig trenger mest der og da.",
      reflection: "Hva kjennetegner dagene der du føler du har fått nok av begge deler?",
    },
    high: {
      summary: "Du ser ut til å hente energi fra å være sammen med andre og stå i sentrum for oppmerksomhet.",
      resources: "Dette kan gjøre deg utadvendt og god til å skape engasjement rundt deg.",
      challenges: "I situasjoner som krever stillhet og ettertanke kan det samme trekket gjøre det vanskeligere å roe ned.",
      reflection: "Gir du deg selv nok rom for ro, eller søker du sosial energi også når kroppen egentlig trenger en pause?",
    },
  },
  agreeableness: {
    low: {
      summary: "Du ser ut til å prioritere egne vurderinger og interesser tydelig i møte med andre.",
      resources: "Dette kan gjøre deg god til å sette grenser og stå i konflikt når det trengs.",
      challenges: "I situasjoner som krever samarbeid kan det være nyttig å bevisst løfte frem andres perspektiv.",
      reflection: "Er det relasjoner der litt mer imøtekommenhet kunne styrket samarbeidet?",
    },
    mid: {
      summary: "Du ser ut til å veie egne behov og andres behov ganske jevnt.",
      resources: "Dette kan gjøre deg til en balansert samarbeidspartner.",
      challenges: "Noen ganger kan det være krevende å vite når du skal sette deg selv først.",
      reflection: "Når merker du at du gir mest -- og når holder du mest igjen?",
    },
    high: {
      summary: "Du ser ut til å legge stor vekt på andres behov og trives med å hjelpe.",
      resources: "Dette kan gjøre deg til en varm og tillitsvekkende samarbeidspartner.",
      challenges: "I situasjoner som krever at du setter grenser kan det samme trekket gjøre det vanskeligere å si nei.",
      reflection: "Er det situasjoner der omtanken din for andre går på bekostning av dine egne behov?",
    },
  },
  stability: {
    low: {
      summary: "Du ser ut til å kunne oppleve bekymring og humørsvingninger sterkere enn andre i perioder.",
      resources: "Dette kan også bety at du er følelsesmessig oppmerksom og fanger opp nyanser andre overser.",
      challenges: "I stressende perioder kan det være ekstra viktig å ha gode strategier for å roe deg selv ned.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
    },
    mid: {
      summary: "Du ser ut til å håndtere de fleste opp- og nedturer ganske jevnt.",
      resources: "Dette kan gi deg en solid emosjonell grunnmur i hverdagen.",
      challenges: "I spesielt krevende perioder kan det likevel være nyttig å ha noen faste rutiner å støtte deg på.",
      reflection: "Hvilke situasjoner er det som best tester roen din?",
    },
    high: {
      summary: "Du ser ut til å håndtere stress og motgang med relativt jevnt humør.",
      resources: "Dette kan gjøre deg til en stødig støtte for andre i krevende situasjoner.",
      challenges: "I situasjoner som faktisk krever bekymring og årvåkenhet kan det samme trekket gjøre deg mindre oppmerksom på reell risiko.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du tar ting med ro?",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";
