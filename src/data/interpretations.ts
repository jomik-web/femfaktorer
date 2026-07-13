/**
 * Tolkningstekst per faktor og skårbånd.
 *
 * VIKTIG: dette er et FØRSTEUTKAST skrevet for å følge tonereglene i
 * Dokument 01 §12 / Dokument 02 §3.3 / Grunnlagsdokumentet §8 (aldri
 * kategorisk/diagnostisk, alltid "kan tyde på"/"ofte", alltid både
 * ressurser og utfordringer). Det er IKKE hentet ordrett fra Dokument 04
 * sitt innholdsbibliotek (den fulltekst-versjonen var ikke tilgjengelig i
 * denne økten). Struktur (kort forklaring, typiske uttrykksformer, mulige
 * ressurser, mulige utfordringer, kontekstbetydning, refleksjonsspørsmål)
 * følger Dokument 04 sin opprinnelige disposisjon -- utvidet fra en
 * tidligere, tynnere versjon som produkteier opplevde som flat. Dette MÅ
 * samkjøres med Dokument 04 og gjennom den planlagte faglige
 * kvalitetssikringen (Dokument 01 §21 punkt 14) før reell lansering.
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
  typicalExpressions: string;
  resources: string;
  challenges: string;
  contextNote: string;
  reflection: string;
}

type Copy = Record<DisplayFactor, Record<Band, Interpretation>>;

export const INTERPRETATIONS: Copy = {
  openness: {
    low: {
      summary:
        "Resultatet ditt trekker mot det konkrete og velprøvde -- du lar deg sjeldnere lokke av det abstrakte eller uprøvde alene for nyhetens skyld.",
      typicalExpressions:
        "Dette kan vise seg som at du foretrekker metoder som har fungert før, holder deg til kjente rutiner på ferie, og er lite opptatt av kunst eller teori for teoriens skyld.",
      resources: "En slik forankring gjør deg gjerne praktisk, jordnær og forutsigbar å ha med å gjøre.",
      challenges:
        "Når noe faktisk krever nytenkning -- et prosjekt som må løses annerledes, eller en situasjon uten oppskrift -- kan det kreve en bevisst innsats å slippe det kjente.",
      contextNote:
        "På jobb kan dette bety at du er den som får ting unnagjort fremfor å utforske alternativer; i relasjoner kan det bety at du verdsetter stabilitet høyere enn spenning.",
      reflection: "Er det områder i livet ditt der litt mer nysgjerrighet kunne åpnet en dør du ellers går forbi?",
    },
    mid: {
      summary:
        "Du beveger deg naturlig mellom det kjente og det nye -- verken fast bundet til rutiner eller rastløst på jakt etter det uprøvde.",
      typicalExpressions:
        "Dette kan vise seg som at du prøver noe nytt når anledningen byr seg, men ikke føler behov for å oppsøke det aktivt hele tiden.",
      resources: "Denne fleksibiliteten kan gjøre deg tilpasningsdyktig i svært ulike sammenhenger.",
      challenges:
        "Samtidig kan det noen ganger være vanskelig å vite, i øyeblikket, om du egentlig lengter etter noe nytt eller bare er vant til å tenke at du burde.",
      contextNote:
        "I jobbsammenheng kan dette bety at du takler både rutinepregede og kreative oppgaver noenlunde likt; privat kan det bety at interessene dine varierer med hvem du er sammen med.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din faktisk slår inn -- og hva er annerledes da?",
    },
    high: {
      summary:
        "Nye ideer, inntrykk og perspektiver ser ut til å tiltrekke deg tydelig -- det uprøvde er sjelden noe du unngår.",
      typicalExpressions:
        "Dette kan vise seg som interesse for kunst, ideer eller steder du ikke kjenner fra før, og en tendens til å stille spørsmål ved ting andre tar for gitt.",
      resources: "Det gjør deg ofte kreativ, og en pådriver når noe faktisk trenger å tenkes nytt.",
      challenges:
        "I situasjoner som krever ren gjentakelse og forutsigbarhet, kan den samme trangen til det nye oppleves som utålmodighet -- av deg selv eller andre.",
      contextNote:
        "På jobb kan dette gjøre deg til den som foreslår en annen løsning enn den vante; i relasjoner kan det bety at du trenger partnere som tåler at du stadig vil utforske noe.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det ting du skulle ønske du turte mer av?",
    },
  },
  conscientiousness: {
    low: {
      summary: "Du ser ut til å ta ting mer som de kommer enn å planlegge dem i detalj på forhånd.",
      typicalExpressions:
        "Dette kan vise seg som at du utsetter ting til de haster, improviserer i stedet for å følge en plan, eller lar rom og skrivebord se litt kaotiske ut uten at det plager deg.",
      resources: "Det kan gjøre deg god til å improvisere og til å tilpasse deg når planer endrer seg brått.",
      challenges:
        "Når noe faktisk krever tett oppfølging over tid -- et prosjekt med mange detaljer, en avtale langt frem i tid -- kan det være nyttig å bevisst legge inn litt mer struktur.",
      contextNote:
        "På jobb kan dette bety at du trives best med korte, fleksible oppgaver fremfor lange løp med faste milepæler; hjemme kan det bety at andre opplever deg som avslappet der de selv ville planlagt.",
      reflection: "Er det noen bestemte områder der litt mer forhåndsplanlegging ville gjort hverdagen lettere for deg?",
    },
    mid: {
      summary: "Du ser ut til å strukturere når det trengs, og slippe taket når det ikke gjør det.",
      typicalExpressions:
        "Dette kan vise seg som at du lager lister til viktige ting, men ikke til alt, og at du både kan følge en plan og avvike fra den uten at det stresser deg nevneverdig.",
      resources: "Denne balansen kan gjøre deg tilpasningsdyktig -- verken rigid eller planløs.",
      challenges:
        "Utfordringen kan være at det ikke alltid er opplagt, verken for deg selv eller andre, hvor mye struktur en gitt oppgave faktisk krever.",
      contextNote:
        "I team kan dette bety at du er fleksibel nok til å jobbe med både svært strukturerte og svært frie kolleger; privat kan det bety at rutinene dine varierer med hva som skjer i livet akkurat nå.",
      reflection: "Når merker du at planlegging faktisk hjelper deg -- og når føles den bare som en ekstra byrde?",
    },
    high: {
      summary: "Du ser ut til å være grundig, pålitelig og glad i å ha kontroll på detaljer.",
      typicalExpressions:
        "Dette kan vise seg som at du fører lister, dobbeltsjekker arbeid før du leverer det, og sjelden lover noe du ikke faktisk følger opp.",
      resources:
        "Dette er ofte en klar styrke når noe krever nøyaktighet, oppfølging eller at andre skal kunne stole på deg over tid.",
      challenges:
        "I situasjoner med rask, uforutsigbar endring kan det samme trekket kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt.",
      contextNote:
        "På jobb gjør dette deg ofte til den man stoler på med ansvar; privat kan det innimellom bety at du setter strengere krav til deg selv enn situasjonen egentlig ber om.",
      reflection: "Er det situasjoner der behovet ditt for orden og kontroll gjør noe vanskeligere enn det egentlig trenger å være?",
    },
  },
  extraversion: {
    low: {
      summary: "Du ser ut til å hente energi mer fra ro og egen tid enn fra å være sammen med mange mennesker.",
      typicalExpressions:
        "Dette kan vise seg som at du foretrekker én-til-én-samtaler fremfor store selskaper, og at du trenger tid alene for å lade opp etter mye sosialt.",
      resources:
        "Dette gir deg ofte godt fokus og evne til dypere konsentrasjon uten at du blir avledet av det som skjer rundt deg.",
      challenges:
        "I situasjoner som krever mye sosial energi over tid -- nettverksbygging, store arrangementer -- kan det kjennes tyngre å holde ut enn for andre.",
      contextNote:
        "På jobb kan dette bety at du presterer best med færre avbrytelser og mer skjermet tid; sosialt kan det bety at du foretrekker et lite, fast vennenettverk fremfor mange bekjentskaper.",
      reflection: "Hvordan balanserer du behovet ditt for ro opp mot situasjoner der du faktisk må være sosial?",
    },
    mid: {
      summary: "Du ser ut til å trives både i sosiale sammenhenger og med tid for deg selv, uten at det ene klart dominerer.",
      typicalExpressions:
        "Dette kan vise seg som at du gjerne blir med på sosiale ting, men også setter pris på en kveld helt alene uten at det føles som noe savn.",
      resources: "Denne fleksibiliteten kan gjøre deg tilpasningsdyktig i svært ulike sosiale situasjoner.",
      challenges:
        "Noen ganger kan det være vanskelig å legge merke til, i øyeblikket, om det egentlig er ro eller selskap du trenger mest.",
      contextNote:
        "På jobb kan dette bety at du fungerer godt både i team og med selvstendig arbeid; privat kan det bety at energien din varierer mye fra dag til dag.",
      reflection: "Hva kjennetegner dagene der du kjenner at du har fått nok av begge deler -- sosialt og ro?",
    },
    high: {
      summary: "Du ser ut til å hente tydelig energi fra å være sammen med andre, og trives ofte i sentrum av oppmerksomheten.",
      typicalExpressions:
        "Dette kan vise seg som at du tar kontakt lett, liker å være der ting skjer, og gjerne er den som drar i gang en samtale eller et initiativ.",
      resources: "Dette kan gjøre deg utadvendt og god til å skape engasjement og energi rundt deg.",
      challenges:
        "I situasjoner som krever stillhet, tålmodighet eller lange perioder alene kan det samme trekket gjøre det vanskeligere å roe helt ned.",
      contextNote:
        "På jobb kan dette gjøre deg til en naturlig pådriver i møter og team; privat kan det bety at du trenger jevnlig sosial kontakt for å kjenne deg på topp.",
      reflection: "Gir du deg selv nok rom for ro, eller søker du sosial energi også når kroppen egentlig trenger en pause?",
    },
  },
  agreeableness: {
    low: {
      summary: "Du ser ut til å prioritere egne vurderinger tydelig, også når det innebærer uenighet med andre.",
      typicalExpressions:
        "Dette kan vise seg som at du sier tydelig fra når du er uenig, forhandler hardt når det trengs, og ikke automatisk lar andres meninger veie tyngst.",
      resources: "Dette kan gjøre deg god til å sette grenser og stå støtt i konflikt når det faktisk er nødvendig.",
      challenges:
        "I situasjoner som krever tett samarbeid kan det være nyttig å bevisst løfte frem den andre partens perspektiv, selv når du er trygg på ditt eget.",
      contextNote:
        "På jobb kan dette bety at du er den som utfordrer en beslutning andre ikke våger å stille spørsmål ved; i relasjoner kan det bety at du trenger partnere som tåler direkte uenighet.",
      reflection: "Er det relasjoner der litt mer imøtekommenhet kunne styrket samarbeidet, uten at du gir opp det som er viktig for deg?",
    },
    mid: {
      summary: "Du ser ut til å veie egne behov og andres behov ganske jevnt, avhengig av situasjonen.",
      typicalExpressions:
        "Dette kan vise seg som at du noen ganger gir deg i en diskusjon og andre ganger holder på ditt, uten et fast mønster.",
      resources: "Denne balansen kan gjøre deg til en rimelig forutsigbar og rettferdig samarbeidspartner.",
      challenges: "Utfordringen kan være å legge merke til, der og da, når du egentlig burde sette deg selv først -- eller omvendt.",
      contextNote:
        "På jobb kan dette bety at du tilpasser samarbeidsstilen din etter hvem du jobber med; privat kan det bety at du gir mer i noen relasjoner enn andre, avhengig av hva de gir tilbake.",
      reflection: "Når merker du at du gir mest av deg selv -- og når holder du mest igjen?",
    },
    high: {
      summary: "Du ser ut til å legge stor vekt på andres behov, og trives ofte med å hjelpe.",
      typicalExpressions:
        "Dette kan vise seg som at du sier ja når noen ber om hjelp selv når det koster deg noe, og at du helst unngår konflikt fremfor å skape uenighet.",
      resources: "Dette kan gjøre deg til en varm, tillitsvekkende samarbeidspartner som andre lener seg på.",
      challenges:
        "I situasjoner som faktisk krever at du setter grenser, kan det samme trekket gjøre det vanskeligere å si nei -- selv når det går ut over deg selv.",
      contextNote:
        "På jobb kan dette bety at du tar på deg mer enn du burde for å hjelpe andre; privat kan det bety at du bruker mye energi på å unngå at noen blir skuffet.",
      reflection: "Er det situasjoner der omtanken din for andre går tydelig på bekostning av dine egne behov?",
    },
  },
  stability: {
    low: {
      summary: "Du ser ut til å kunne oppleve bekymring, uro eller humørsvingninger sterkere enn andre i perioder.",
      typicalExpressions:
        "Dette kan vise seg som at små ting av og til vokser seg store i tankene dine, eller at humøret ditt kan svinge mer i løpet av en dag enn du skulle ønske.",
      resources: "Dette kan også bety at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger andre overser.",
      challenges:
        "I stressende perioder kan det være ekstra viktig å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned.",
      contextNote:
        "På jobb kan dette bety at press og tidsfrister kjennes tyngre enn de kanskje ser ut for andre; privat kan det bety at du trenger mer forutsigbarhet i relasjoner for å kjenne deg trygg.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
    },
    mid: {
      summary: "Du ser ut til å håndtere de fleste opp- og nedturer i livet ganske jevnt.",
      typicalExpressions:
        "Dette kan vise seg som at du blir litt stresset eller nedfor når noe faktisk er krevende, men uten at det tar overhånd eller varer unødvendig lenge.",
      resources: "Dette kan gi deg en solid, stabil grunnmur å møte hverdagen fra.",
      challenges:
        "I spesielt krevende perioder -- flere ting samtidig, langvarig press -- kan det likevel være nyttig å ha noen faste rutiner å støtte deg på, selv om du vanligvis klarer deg fint uten.",
      contextNote:
        "På jobb kan dette bety at du tåler et visst press uten at det går utover deg; privat kan det bety at du som regel er den rolige i konflikter, uten at det betyr at ingenting berører deg.",
      reflection: "Hvilke situasjoner er det som best tester roen din -- og hva skjer i deg da?",
    },
    high: {
      summary: "Du ser ut til å håndtere stress og motgang med relativt jevnt humør, selv når mye skjer samtidig.",
      typicalExpressions:
        "Dette kan vise seg som at andre kommer til deg når noe er vanskelig, fordi du sjelden virker overveldet, og at kritikk eller tilbakeslag ikke tar tak i deg over lang tid.",
      resources: "Dette kan gjøre deg til en stødig støtte for andre i krevende situasjoner, og gi deg selv ro til å tenke klart under press.",
      challenges:
        "I situasjoner som faktisk krever bekymring og årvåkenhet -- reell risiko, tidlige varselsignaler -- kan det samme trekket gjøre deg mindre oppmerksom på at noe faktisk krever handling.",
      contextNote:
        "På jobb kan dette bety at du er den som holder hodet kaldt når andre stresser; privat kan det bety at folk rundt deg noen ganger må si tydelig ifra før du fanger opp at noe er galt.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du naturlig tar ting med ro?",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";
