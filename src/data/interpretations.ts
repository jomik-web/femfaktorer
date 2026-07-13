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
 * følger Dokument 04 sin opprinnelige disposisjon.
 *
 * v2 (produkteiers tilbakemelding): språket er bevisst variert slik at
 * setningsåpninger IKKE gjentas på tvers av de 15 blokkene (tidligere
 * versjon begynte nesten alle "summary" med "Du ser ut til å", all
 * "typicalExpressions" med "Dette kan vise seg som", og all "contextNote"
 * med "På jobb ..."). Dette MÅ samkjøres med Dokument 04 og gjennom den
 * planlagte faglige kvalitetssikringen (Dokument 01 §21 punkt 14) før
 * reell lansering.
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
        "Konkret ser man det ofte ved at du foretrekker metoder som har vist seg å fungere, holder deg til kjente rutiner på ferie, og bruker lite tid på kunst eller teori for teoriens skyld.",
      resources: "En slik forankring gjør deg gjerne praktisk, jordnær og forutsigbar å ha med å gjøre.",
      challenges:
        "Skal noe faktisk løses på en ny måte -- et prosjekt uten oppskrift, en uvant situasjon -- kan det ta en bevisst innsats å legge det kjente til side.",
      contextNote:
        "På jobben er du gjerne den som får ting unnagjort fremfor å utforske alternativer; i relasjoner verdsetter du ofte stabilitet høyere enn spenning.",
      reflection: "Er det områder i livet ditt der litt mer nysgjerrighet kunne åpnet en dør du ellers går forbi?",
    },
    mid: {
      summary:
        "Du beveger deg naturlig mellom det kjente og det nye -- verken fast bundet til rutiner eller rastløst på jakt etter det uprøvde.",
      typicalExpressions:
        "Om anledningen byr seg, prøver du gjerne noe nytt -- uten at du aktivt oppsøker det uprøvde hele tiden.",
      resources: "Denne evnen til å bevege deg mellom det kjente og det nye gjør deg ofte tilpasningsdyktig, uansett sammenheng.",
      challenges:
        "Samtidig kan det noen ganger være vanskelig å vite, i øyeblikket, om du egentlig lengter etter noe nytt eller bare er vant til å tenke at du burde.",
      contextNote:
        "Privat varierer interessene dine gjerne med hvem du er sammen med, mens du i jobbsammenheng takler både rutinepregede og kreative oppgaver noenlunde likt.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din faktisk slår inn -- og hva er annerledes da?",
    },
    high: {
      summary:
        "Nye ideer, inntrykk og perspektiver ser ut til å tiltrekke deg tydelig -- det uprøvde er sjelden noe du unngår.",
      typicalExpressions:
        "I praksis ser man det gjerne som interesse for kunst, ideer eller steder du ikke kjenner fra før, og en vane med å stille spørsmål ved det andre tar for gitt.",
      resources: "Det gjør deg ofte kreativ, og en pådriver når noe faktisk trenger å tenkes nytt.",
      challenges:
        "Ren gjentakelse og forutsigbarhet er derimot situasjoner der den samme trangen til det nye lett kan oppleves som utålmodighet -- av deg selv eller andre.",
      contextNote:
        "I relasjoner trenger du ofte partnere som tåler at du stadig vil utforske noe nytt; på jobben er det gjerne du som foreslår en annen løsning enn den vante.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det ting du skulle ønske du turte mer av?",
    },
  },
  conscientiousness: {
    low: {
      summary: "Planer og faste rutiner ser ikke ut til å styre hverdagen din i særlig grad -- du tar gjerne ting som de kommer.",
      typicalExpressions:
        "Utsettelse til ting haster, improvisasjon fremfor faste planer, og et skrivebord som gjerne ser litt kaotisk ut -- dette er kjente mønstre for deg.",
      resources: "Det kan gjøre deg god til å improvisere og til å tilpasse deg når planer endrer seg brått.",
      challenges:
        "Krever noe derimot tett oppfølging over lang tid -- et prosjekt med mange detaljer, en avtale langt frem i tid -- kan litt mer bevisst struktur være til god hjelp.",
      contextNote:
        "Hjemme kan andre oppleve deg som avslappet der de selv ville planlagt, mens du på jobb nok trives best med korte, fleksible oppgaver fremfor lange løp med faste milepæler.",
      reflection: "Er det noen bestemte områder der litt mer forhåndsplanlegging ville gjort hverdagen lettere for deg?",
    },
    mid: {
      summary: "Struktur ser ut til å komme og gå etter behov hos deg -- verken fast rutine eller mangel på den dominerer.",
      typicalExpressions:
        "Lister lager du kanskje til det viktigste, men ikke til alt -- og du både følger og avviker fra en plan uten at det stresser deg nevneverdig.",
      resources: "Denne vekslingen mellom struktur og frihet gjør deg ofte tilpasningsdyktig -- verken rigid eller planløs.",
      challenges:
        "Utfordringen kan være at det ikke alltid er opplagt, verken for deg selv eller andre, hvor mye struktur en gitt oppgave faktisk krever.",
      contextNote:
        "I team er du fleksibel nok til å jobbe godt med både svært strukturerte og svært frie kolleger; privat varierer rutinene dine gjerne med hva som skjer i livet akkurat nå.",
      reflection: "Når merker du at planlegging faktisk hjelper deg -- og når føles den bare som en ekstra byrde?",
    },
    high: {
      summary: "Grundighet og sans for detaljer peker seg ut som tydelige trekk ved deg -- pålitelighet ser ut til å komme naturlig.",
      typicalExpressions:
        "Typisk for deg kan være at du fører lister, dobbeltsjekker arbeid før du leverer det, og sjelden lover noe du ikke faktisk følger opp.",
      resources:
        "Dette er ofte en klar styrke når noe krever nøyaktighet, oppfølging eller at andre skal kunne stole på deg over tid.",
      challenges:
        "Rask og uforutsigbar endring er derimot noe som kan kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt.",
      contextNote:
        "Andre stoler nok gjerne på deg med ansvar på jobben; privat setter du innimellom strengere krav til deg selv enn situasjonen egentlig ber om.",
      reflection: "Er det situasjoner der behovet ditt for orden og kontroll gjør noe vanskeligere enn det egentlig trenger å være?",
    },
  },
  extraversion: {
    low: {
      summary: "Ro og egen tid later til å gi deg mer energi enn store forsamlinger av mennesker.",
      typicalExpressions:
        "Én-til-én-samtaler foretrekker du nok fremfor store selskaper, og du trenger tid alene for å lade opp etter mye sosialt.",
      resources:
        "Dette gir deg ofte godt fokus og evne til dypere konsentrasjon uten at du blir avledet av det som skjer rundt deg.",
      challenges:
        "Mye sosial energi over tid -- nettverksbygging, store arrangementer -- kan derimot kjennes tyngre å holde ut enn for andre.",
      contextNote:
        "Sosialt foretrekker du ofte et lite, fast vennenettverk fremfor mange bekjentskaper; på jobb presterer du nok best med færre avbrytelser og mer skjermet tid.",
      reflection: "Hvordan balanserer du behovet ditt for ro opp mot situasjoner der du faktisk må være sosial?",
    },
    mid: {
      summary: "Sosialt selskap og egen tid virker å dele plassen ganske jevnt i livet ditt, uten at det ene klart dominerer.",
      typicalExpressions:
        "Typisk kan være at du gjerne blir med på sosiale ting, men også setter pris på en kveld helt alene uten at det føles som noe savn.",
      resources: "Denne vekslingen mellom sosialt og alene gjør deg ofte fleksibel, uansett hvilken sosial situasjon du havner i.",
      challenges:
        "Noen ganger kan det være vanskelig å legge merke til, i øyeblikket, om det egentlig er ro eller selskap du trenger mest.",
      contextNote:
        "Energien din varierer nok en del fra dag til dag privat, mens du på jobb fungerer godt både i team og med selvstendig arbeid.",
      reflection: "Hva kjennetegner dagene der du kjenner at du har fått nok av begge deler -- sosialt og ro?",
    },
    high: {
      summary: "Andre mennesker ser ut til å være en klar energikilde for deg, og du finner deg ofte midt i det som skjer.",
      typicalExpressions:
        "I hverdagen viser det seg gjerne ved at du tar kontakt lett, liker å være der ting skjer, og ofte er den som drar i gang en samtale eller et initiativ.",
      resources: "Det gjør deg ofte utadvendt og god til å skape engasjement og energi rundt deg.",
      challenges:
        "Stillhet, tålmodighet og lange perioder alene er derimot noe som kan gjøre det vanskeligere å roe helt ned.",
      contextNote:
        "Privat trenger du nok jevnlig sosial kontakt for å kjenne deg på topp; på jobben blir du gjerne en naturlig pådriver i møter og team.",
      reflection: "Gir du deg selv nok rom for ro, eller søker du sosial energi også når kroppen egentlig trenger en pause?",
    },
  },
  agreeableness: {
    low: {
      summary: "Egne vurderinger later til å veie tungt hos deg, også når de støter mot det andre mener.",
      typicalExpressions:
        "Tydelig fra sier du gjerne når du er uenig, du forhandler hardt når det trengs, og lar ikke automatisk andres meninger veie tyngst.",
      resources: "Egenskapen kan gjøre deg god til å sette grenser og stå støtt i konflikt når det faktisk er nødvendig.",
      challenges:
        "Tett samarbeid er derimot noe som kan dra nytte av at du bevisst løfter frem den andre partens perspektiv, selv når du er trygg på ditt eget.",
      contextNote:
        "Beslutninger andre ikke våger å stille spørsmål ved, er gjerne noe du utfordrer på jobben; i relasjoner trives du best med partnere som tåler direkte uenighet.",
      reflection: "Er det relasjoner der litt mer imøtekommenhet kunne styrket samarbeidet, uten at du gir opp det som er viktig for deg?",
    },
    mid: {
      summary: "Egne og andres behov ser ut til å telle omtrent likt for deg, avhengig av situasjonen du står i.",
      typicalExpressions:
        "I praksis gir du deg kanskje i en diskusjon den ene dagen og holder på ditt den neste, uten noe fast mønster.",
      resources: "Denne jevne vektingen gjør deg ofte til en forutsigbar og rettferdig samarbeidspartner.",
      challenges: "Utfordringen kan være å legge merke til, der og da, når du egentlig burde sette deg selv først -- eller omvendt.",
      contextNote:
        "På jobb tilpasser du gjerne samarbeidsstilen din etter hvem du jobber med; privat gir du nok mer i noen relasjoner enn andre, avhengig av hva de gir tilbake.",
      reflection: "Når merker du at du gir mest av deg selv -- og når holder du mest igjen?",
    },
    high: {
      summary: "Andres behov later til å oppta en stor plass hos deg, og du finner ofte glede i å hjelpe.",
      typicalExpressions:
        "Det kan vise seg ved at du sier ja når noen ber om hjelp selv når det koster deg noe, og at du helst unngår konflikt fremfor å skape uenighet.",
      resources: "Andre lener seg gjerne på deg som en varm, tillitsvekkende samarbeidspartner nettopp derfor.",
      challenges:
        "Å sette grenser er derimot noe som kan bli vanskeligere med det samme trekket -- selv når det går ut over deg selv.",
      contextNote:
        "Privat bruker du nok mye energi på å unngå at noen blir skuffet; på jobb tar du kanskje på deg mer enn du burde for å hjelpe andre.",
      reflection: "Er det situasjoner der omtanken din for andre går tydelig på bekostning av dine egne behov?",
    },
  },
  stability: {
    low: {
      summary: "Bekymring, uro og humørsvingninger ser ut til å kunne ramme deg noe hardere enn andre i perioder.",
      typicalExpressions:
        "Smått kan vokse seg stort i tankene dine, og humøret ditt kan svinge mer i løpet av en dag enn du skulle ønske.",
      resources: "Dette kan også bety at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger andre overser.",
      challenges:
        "Stressende perioder er der det er ekstra viktig å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned.",
      contextNote:
        "Mer forutsigbarhet i relasjoner hjelper deg nok å kjenne deg trygg; på jobb kjennes press og tidsfrister tyngre enn de kanskje ser ut for andre.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
    },
    mid: {
      summary: "Livets opp- og nedturer later til å håndteres med en ganske jevn linje hos deg.",
      typicalExpressions:
        "Litt stresset eller nedfor blir du gjerne når noe faktisk er krevende, men uten at det tar overhånd eller varer unødvendig lenge.",
      resources: "Dette kan gi deg en solid, stabil grunnmur å møte hverdagen fra.",
      challenges:
        "Er flere ting krevende samtidig, eller varer presset lenge, kan det likevel være nyttig å ha noen faste rutiner å støtte deg på.",
      contextNote:
        "Du er som regel den rolige i konflikter privat, uten at det betyr at ingenting berører deg -- og du tåler nok et visst press på jobben uten at det går utover deg.",
      reflection: "Hvilke situasjoner er det som best tester roen din -- og hva skjer i deg da?",
    },
    high: {
      summary: "Stress og motgang ser ut til å prelle noe lettere av deg enn hos mange andre, selv når mye skjer samtidig.",
      typicalExpressions:
        "I hverdagen merkes det gjerne ved at andre kommer til deg når noe er vanskelig, fordi du sjelden virker overveldet, og at kritikk ikke tar tak i deg over lang tid.",
      resources: "Dette kan gjøre deg til en stødig støtte for andre i krevende situasjoner, og gi deg selv ro til å tenke klart under press.",
      challenges:
        "Reell risiko og tidlige varselsignaler er derimot noe det samme trekket kan gjøre deg mindre oppmerksom på.",
      contextNote:
        "Folk rundt deg må privat noen ganger si tydelig ifra før du fanger opp at noe er galt; på jobb er du gjerne den som holder hodet kaldt når andre stresser.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du naturlig tar ting med ro?",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";
