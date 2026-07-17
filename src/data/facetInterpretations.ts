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
 * v2.9 (designgjennomgang): hver fasett har nå egen, distinkt midt-tekst --
 * tidligere delte alle 29 fasettene én identisk generisk setning
 * ("nokså midt på treet ..."), som ga merkbar repetisjon i rapporten.
 * Brukes også som byggeklosser av domainComposition.ts, som velger ut de
 * mest ekstreme fasettene per hovedkategori til å drive hovedteksten --
 * se den filen for hvorfor.
 *
 * v2.12 (språklig revisjon, 15.07.2026): alle 87 tekster (29 fasetter x 3
 * nivåer) omskrevet for å vise trekket gjennom en konkret, gjenkjennelig
 * situasjon i stedet for bare å beskrive det abstrakt -- samme faglige
 * innhold, retning og styrkegrad som før, kun formidlingen er endret.
 * Produkteier valgte selv alle 87 ut fra et forslagsdokument med full
 * kvalitetsvurdering per tekst (klarspråk, variasjon, gjenkjennelse m.m.),
 * se fasettekster-revisjon.md i dokumentbiblioteket for begrunnelse per
 * tekst dersom noe senere skal justeres igjen.
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

export const FACET_INTERPRETATIONS: Record<string, FacetInterpretation> = {
  N1: {
    label: "Bekymring / ro",
    domain: "N",
    description: "Hvor lett man aktiveres av fare, usikkerhet og bekymring.",
    low: "Sinnet ditt er godt trent i å oppdage det som kan gå galt. En uklar SMS, en forsinket tilbakemelding, en lyd i huset om natten -- du merker det før andre, og tankene finner fort veien til verste tilfelle. Denne årvåkenheten kan koste søvn og ro, men den har også holdt deg trygg gjennom mye.",
    mid: "Uroen kommer og går. Noen dager biter bekymringene seg fast, andre ganger glir de forbi uten at du engang legger merke til dem. Hvor mye det gjelder, handler mer om hva som faktisk står på spill enn om et fast temperament.",
    high: "Du har en sjelden evne til å legge fra deg det du ikke kan gjøre noe med. Der andre grubler videre, klarer du å sette bekymringen til side og gå videre med dagen. Det betyr ikke at ingenting biter -- bare at uroen sjelden får bli boende lenge.",
  },
  N2: {
    label: "Irritabilitet / sindighet",
    domain: "N",
    description: "Tilbøyelighet til irritasjon, frustrasjon og sinne.",
    low: "Terskelen din for irritasjon er lav, og det merkes: en kø som ikke beveger seg, en kollega som avbryter, en plan som endres i siste liten -- frustrasjonen kommer raskt, og den er ekte når den kommer.",
    mid: "Noen ting får deg opp i flammene på sekundet. Andre ganger undrer folk seg over hvor tålmodig du klarer å være. Det er ikke alltid lett å forutsi hvilken versjon som møter dagen.",
    high: "Du har en ro som få rokker ved. Der andre eksploderer over småting, biter du sjelden på. Hodet ditt holder kaldt selv når temperaturen rundt deg stiger.",
  },
  N3: {
    label: "Nedstemthet / motstandskraft",
    domain: "N",
    description: "Tilbøyelighet til nedstemthet, håpløshet og lavt stemningsleie.",
    low: "Motgang setter dypere spor hos deg enn hos mange. En dårlig dag kan fort bli en dårlig uke, og den indre stemmen som vurderer deg selv, er ikke alltid vennlig.",
    mid: "Humøret ditt svinger med livet -- opp når ting går bra, ned når det butter. Det er verken en konstant sky eller en konstant sol, bare vær som skifter.",
    high: "Du har en solid bunn å stå på. Motgang tar deg ikke lett av kurs, og du finner tilbake til deg selv raskere enn de fleste når noe har gjort vondt.",
  },
  N4: {
    label: "Sosial selvbevissthet / trygghet",
    domain: "N",
    description: "Ubehag ved oppmerksomhet, vurdering og uvante sosiale situasjoner.",
    low: "Blikk fra andre kjennes tyngre for deg enn for mange. Et rom fullt av fremmede, en presentasjon, en situasjon der du kan gjøre noe feil -- pulsen stiger fortere, og selvkritikken melder seg raskt.",
    mid: "I noen sosiale situasjoner kjenner du deg helt på hjemmebane. I andre blir du plutselig bevisst på hvordan du fremstår. Hva som avgjør hvilken versjon som dukker opp, varierer med sammenhengen.",
    high: "Andres blikk gjør deg ikke mye. Du går inn i ukjente rom, uvante situasjoner og potensielt pinlige øyeblikk uten at det tapper deg -- den friheten gir deg albuerom mange andre ikke har.",
  },
  N5: {
    label: "Impulskontroll",
    domain: "N",
    description: "Hvor lett sterke ønsker og fristelser tar styringen.",
    low: "Når fristelsen banker på, er den vanskelig å ignorere. Du kjenner trekket sterkere enn mange, og bremsen kommer noen ganger inn litt for sent -- etterfulgt av et \"hvorfor gjorde jeg det der\".",
    mid: "Noen ganger følger du impulsen. Andre ganger venter du. Selvkontroll er ikke et fast trekk hos deg, mer en muskel som virker forskjellig fra situasjon til situasjon.",
    high: "Du har et solid grep om egne impulser. Der andre griper det som frister der og da, klarer du lettere å vente, tenke og velge -- selv når fristelsen er sterk.",
  },
  N6: {
    label: "Sårbarhet / robusthet under press",
    domain: "N",
    description: "Evne til å tenke og handle når belastningen blir høy.",
    low: "Når flere ting krever noe av deg samtidig, kjenner du det raskt. Kapasiteten kan føles tynnere enn hos andre, og under høyt press er det lett å miste oversikten et øyeblikk.",
    mid: "Noen presspregede situasjoner takler du med overraskende letthet. Andre ganger kjenner du at det blir for mye. Hvor godt du takler press, avhenger tydelig av hva slags press det er.",
    high: "Kaos gjør deg ikke mye. Når andre mister hodet, er du gjerne den som holder oversikten -- rolig, klar og fortsatt i stand til å tenke, selv når belastningen er høy.",
  },
  E1: {
    label: "Varme",
    domain: "E",
    description: "Hvor lett man uttrykker vennlighet og nærhet.",
    low: "Nærhet kommer ikke automatisk hos deg -- den bygges gradvis, og du gir den helst til noen få. Utad kan det lese som distanse, men det handler oftere om at du er selektiv med hvem som slipper tett innpå.",
    mid: "Med noen mennesker er varmen der fra første møte. Med andre holder du en høflig avstand. Hvem du slipper inn, ser ut til å bety mer enn situasjonen i seg selv.",
    high: "Varme strømmer lett ut av deg. Et nytt bekjentskap kan føle seg sett etter få minutter, og folk merker raskt at interessen din for dem er ekte.",
  },
  E2: {
    label: "Sosiabilitet",
    domain: "E",
    description: "Hvor mye samvær og grupper man søker.",
    low: "Et rolig kveld hjemme, en samtale med én god venn -- det gir deg mer enn et rom fullt av mennesker. Sosialt selskap er godt i akkurat den mengden du selv velger, ikke mer.",
    mid: "Du kan trives godt sosialt, men søker ikke nødvendigvis selskap for enhver pris. Noen uker er kalenderen full, andre ganger er stillheten akkurat det du trenger.",
    high: "Rom fylles opp for deg -- bokstavelig talt. Du søker folk, prater, kobler sammen mennesker som ikke kjenner hverandre, og kjenner deg mest på hjemmebane når det er liv rundt deg.",
  },
  E3: {
    label: "Selvhevdelse",
    domain: "E",
    description: "Hvor tydelig man tar ordet, leder og påvirker.",
    low: "Du lar gjerne andre ta ordet først. Det betyr ikke at du mangler meninger -- bare at du påvirker mer gjennom hvordan du handler enn gjennom hvor høyt du sier det.",
    mid: "Noen ganger tar du tøylene uten å nøle. Andre ganger lar du heller andre lede an. Hvilken rolle du tar, ser ut til å handle om hva situasjonen faktisk krever av deg.",
    high: "Når noen må ta ordet, er det ofte deg. Du sier det som må sies, tar plass i rommet, og andre legger merke til synspunktene dine -- fordi du selv gjør det.",
  },
  E4: {
    label: "Aktivitetsnivå",
    domain: "E",
    description: "Tempo, travelhet og behov for å være i gang.",
    low: "Ett prosjekt av gangen, i et tempo som gir rom til å puste -- det er der du presterer best. Et fullpakket program sliter deg ut fortere enn de fleste.",
    mid: "Noen perioder er kalenderen stappfull og farten høy. Andre ganger senker du bevisst tempoet. Du veksler mellom dem etter hva som faktisk trengs.",
    high: "Du har sjelden bare én ting på gang. Tempoet ditt er høyt, dagene fylles opp, og stillstand kjennes fortere ubehagelig enn avslappende.",
  },
  E5: {
    label: "Spenningssøking",
    domain: "E",
    description: "Behov for intensitet, risiko og sterk stimulering.",
    low: "Forutsigbarhet er ikke kjedelig for deg -- det er behagelig. Sterke inntrykk og impulsive opplevelser frister mindre enn en kjent rutine som fungerer.",
    mid: "Litt spenning innimellom setter du pris på, men du jager den ikke aktivt. En hverdag uten adrenalin er helt greit for deg.",
    high: "Fart, høyde og det uforutsigbare trekker deg mer enn de fleste. Hverdagslig rutine kan fort kjennes flatt -- du leter etter det som får pulsen opp.",
  },
  E6: {
    label: "Positive følelser",
    domain: "E",
    description: "Hvor lett man opplever og uttrykker glede og entusiasme.",
    low: "Gleden din vises kanskje ikke like tydelig utenpå, men det gjør den ikke mindre ekte. Du holder et jevnere følelsesuttrykk enn mange, uansett hva som skjer.",
    mid: "Noen dager smitter entusiasmen din tydelig over på andre. Andre ganger holder du gleden mer for deg selv. Det varierer med både humør og anledning.",
    high: "Glede sitter løst hos deg, og det smitter. Du finner lett det gode i situasjoner, og entusiasmen din er sjelden vanskelig å få øye på.",
  },
  O1: {
    label: "Fantasi",
    domain: "O",
    description: "Tilbøyelighet til indre bilder, forestillingsevne og dagdrømmer.",
    low: "Du forholder deg helst til det som faktisk er der -- konkret, håndfast, virkelig. Dagdrømmer og hypotetiske scenarier tar sjeldnere overhånd i tankene dine.",
    mid: "Fantasien din slår innimellom ut i full blomst, andre ganger holder du deg strengt til det praktiske. Begge modusene er tilgjengelige, avhengig av hva situasjonen ber om.",
    high: "Indre bilder kommer lett til deg. Du kan forsvinne inn i tanker, muligheter og \"hva hvis\"-scenarier som andre knapt vurderer -- fantasien din er sjelden i hvilemodus.",
  },
  O2: {
    label: "Estetisk interesse",
    domain: "O",
    description: "Følsomhet for kunst, form, musikk og skjønnhet.",
    low: "Kunst og estetikk fyller ikke nødvendigvis mye plass i hverdagen din -- funksjon og innhold veier ofte tyngre enn form.",
    mid: "Noen ganger stopper du opp for et maleri, en melodi eller en vakker detalj. Andre ganger går det deg forbi. Skjønnhet fanger deg av og til, ikke konstant.",
    high: "En vakker melodi, et godt komponert bilde, lyset som faller riktig i et rom -- du legger merke til det, og det gjør noe med deg. Skjønnhet er sjelden bare bakgrunnsstøy for deg.",
  },
  O3: {
    label: "Følelsesbevissthet",
    domain: "O",
    description: "Oppmerksomhet på egne følelsesnyanser.",
    low: "Følelser er noe du håndterer, ikke nødvendigvis noe du utforsker i dybden. Du er praktisk innstilt der andre analyserer det som skjer inni dem.",
    mid: "Noen ganger dykker du inn i egne følelser og prøver å forstå dem. Andre ganger går du praktisk videre uten å gruble over dem. Det avhenger av situasjonen.",
    high: "Du kjenner nyansene i eget følelsesliv godt -- ikke bare at du er lei deg, men hvorfor, og hva det egentlig handler om. Den indre bevisstheten er sjelden fraværende hos deg.",
  },
  O4: {
    label: "Eventyrlyst",
    domain: "O",
    description: "Vilje til å prøve nye aktiviteter, steder og rutiner.",
    low: "Det kjente har en verdi du ikke tar lett på. En rutine som fungerer, et sted du kjenner godt -- det uprøvde frister sjeldnere enn det trygge.",
    mid: "Nye ting frister deg av og til, men du søker dem ikke nødvendigvis aktivt opp. Kjent og ukjent bytter på å vinne, avhengig av dagsform og anledning.",
    high: "Et nytt sted, en uprøvd rute til jobb, en oppskrift du aldri har laget før -- det uprøvde trekker deg til seg. Rutine kan fort føles som en snev for mye trygghet.",
  },
  O5: {
    label: "Intellektuell nysgjerrighet",
    domain: "O",
    description: "Interesse for ideer, komplekse spørsmål og abstrakt tenkning.",
    low: "Du foretrekker det som funker fremfor det som er interessant i teorien. Abstrakte resonnementer taper ofte mot konkrete løsninger.",
    mid: "Noen ganger kaster du deg over en idé eller et komplekst spørsmål med iver. Andre ganger er du mer opptatt av det praktiske. Begge sidene er der, i skiftende styrke.",
    high: "En god idé kan holde deg våken. Komplekse spørsmål, abstrakte resonnementer og lange samtaler om hvordan ting egentlig henger sammen -- det er der du finner energi.",
  },
  A1: {
    label: "Tillit",
    domain: "A",
    description: "Forventning om at andre vanligvis er ærlige og velvillige.",
    low: "Tillit gis ikke gratis hos deg -- den opptjenes. Du legger merke til uoverensstemmelser andre overser, og er sjelden den siste som blir lurt.",
    mid: "Noen mennesker gir du tillit raskt. Andre må vise seg fortjent over tid. Hvor lett du åpner deg, avhenger tydelig av hvem som står foran deg.",
    high: "Du møter folk med et grunnleggende \"jeg tror deg\", og lar dem bevise det motsatte -- ikke omvendt. Den godtroenheten gjør deg lett å ha med å gjøre, men krever også at du velger klokt.",
  },
  A2: {
    label: "Rettframhet",
    domain: "A",
    description: "Grad av direkte, oppriktig og lite strategisk kommunikasjon.",
    low: "Du velger ordene dine med omhu, og ikke alt du tenker, sier du høyt. Det gir deg et strategisk overtak andre kanskje ikke merker.",
    mid: "Noen ganger sier du akkurat det du mener, rett ut. Andre ganger holder du litt tilbake, avhengig av hvem du snakker med og hva som står på spill.",
    high: "Det du sier, er det du mener -- uten omveier eller skjulte agendaer. Folk vet hvor de har deg, selv om det rette ordet ikke alltid er det mykeste.",
  },
  A3: {
    label: "Hjelpsomhet",
    domain: "A",
    description: "Vilje til å hjelpe og bidra til andres velferd.",
    low: "Egne mål kommer først for deg, og det er ikke noe å skamme seg over. Du hjelper når det gir mening, ikke som en refleks.",
    mid: "Når noen trenger en hånd, stiller du ofte opp -- men ikke alltid automatisk. Hjelpsomheten din er reell, bare ikke ubetinget.",
    high: "Noens problem blir raskt ditt problem også. Du merker behov før de blir sagt høyt, og responsen din er å handle, ikke bare å synes synd på.",
  },
  A4: {
    label: "Ettergivenhet",
    domain: "A",
    description: "Måte å møte konflikt, uenighet og konkurranse på.",
    low: "Du gir deg ikke lett. Når noe står på spill, tar du kampen -- direkte, og uten å vike unna en konfrontasjon andre ville unngått.",
    mid: "Noen ganger møter du uenighet med kompromiss. Andre ganger holder du fast på ditt. Hvilken vei du velger, handler om hvor mye det faktisk betyr.",
    high: "Fred veier tyngre enn å ha rett for deg. Du finner heller en løsning alle kan leve med, enn å vinne en krangel -- selv om det koster deg litt.",
  },
  A5: {
    label: "Beskjedenhet",
    domain: "A",
    description: "Hvor mye man framhever egne kvaliteter og prestasjoner.",
    low: "Egne prestasjoner viser du gjerne fram -- ikke av skryt, men fordi du ikke ser noen grunn til å skjule det du har fått til.",
    mid: "Noen ganger fremhever du det du har fått til. Andre ganger toner du det bevisst ned. Det handler mer om anledningen enn om et fast mønster.",
    high: "Du snakker sjelden om egne prestasjoner selv, og lar heller resultatene tale for seg. Det gjør deg lett å samarbeide med -- ingen konkurrerer om oppmerksomheten når du er der.",
  },
  A6: {
    label: "Medfølelse",
    domain: "A",
    description: "Følsomhet for andres smerte og behov.",
    low: "Du vurderer situasjoner med hodet fremfor hjertet, og lar deg sjelden rive med følelsesmessig når noen andre sliter.",
    mid: "Noen historier griper deg dypt. Andre ganger holder du en saklig distanse. Hvor mye du berøres, ser ut til å avhenge av hvem og hva det gjelder.",
    high: "Andres smerte kjenner du nesten på kroppen selv. Du trenger sjelden å bli bedt om å bry deg -- omsorgen kommer før du rekker å tenke deg om.",
  },
  C1: {
    label: "Mestringstro",
    domain: "C",
    description: "Tro på egen evne til å løse oppgaver og få ting gjort.",
    low: "Tvilen melder seg lettere hos deg før en oppgave -- \"får jeg egentlig til dette?\" er et spørsmål du stiller deg selv oftere enn mange.",
    mid: "Noen oppgaver griper du med selvsikkerhet. Andre får deg til å nøle. Troen på egen mestring varierer tydelig med hva som faktisk skal gjøres.",
    high: "Du går inn i nye oppgaver med en grunnleggende tillit til at du får det til. Den innstillingen alene løser sjelden problemet, men den gir deg et solid utgangspunkt.",
  },
  C2: {
    label: "Orden",
    domain: "C",
    description: "Behov for struktur, ryddighet og faste systemer.",
    low: "Et rotete skrivebord forstyrrer deg sjelden. Du finner det du trenger uansett, og bruker heller tiden på noe annet enn å rydde.",
    mid: "Når det trengs, kan du jobbe strukturert. Men faste systemer og perfekt orden er ikke et mål i seg selv for deg -- bare et middel når det faktisk hjelper.",
    high: "Alt har sin plass hos deg, og det gir ro. Systemer, ryddighet og forutsigbarhet er ikke tvang -- det er sånn du skaper overskudd til alt annet.",
  },
  C3: {
    label: "Pliktfølelse",
    domain: "C",
    description: "Forhold til regler, løfter og forpliktelser.",
    low: "Regler og løfter tolker du med en viss fleksibilitet -- ikke fordi du er upålitelig, men fordi du ser sammenhengen før du følger prinsippet.",
    mid: "Noen forpliktelser tar du svært alvorlig. Andre håndterer du mer avslappet. Det handler tydelig om hva -- og hvem -- forpliktelsen gjelder.",
    high: "Et løfte fra deg er et løfte som holdes. Andre kan stole blindt på ordet ditt, og du selv sover dårligere hvis du ikke følger opp det du har sagt.",
  },
  C4: {
    label: "Prestasjonsstreben",
    domain: "C",
    description: "Ambisjon, innsats og mål om å oppnå mye.",
    low: "Å prestere for enhver pris er ikke drivkraften din. Du finner mening andre steder enn i konkurranse og høye mål.",
    mid: "På noen områder setter du deg tydelige mål og jobber hardt for dem. På andre er du fornøyd med at ting går greit. Ambisjonen din er selektiv.",
    high: "Middelmådighet er ikke noe du slår deg til ro med. Du setter høye mål for deg selv, og legger inn den innsatsen som skal til for å nå dem.",
  },
  C5: {
    label: "Selvdisiplin",
    domain: "C",
    description: "Evne til å starte og fullføre krevende eller lite lystbetonte oppgaver.",
    low: "Motivasjonen svinger mer hos deg enn hos mange, og når den er lav, er det lett å skyve oppgaven en dag til. Det du starter, er ikke alltid det du fullfører først.",
    mid: "Noen oppgaver holder du fast ved til de er ferdige. Andre mister du grepet om når motivasjonen daler. Utholdenheten din er ekte, bare ikke konstant.",
    high: "Når du har bestemt deg, følger du det gjennom -- selv når motivasjonen svikter underveis. Du er ikke avhengig av å ha lyst for å gjøre det du har sagt du skal.",
  },
  C6: {
    label: "Overveielse",
    domain: "C",
    description: "Hvor mye man vurderer konsekvenser før handling.",
    low: "Du handler først og tenker etterpå, oftere enn de fleste. Det gir deg fart og spontanitet -- men noen ganger også en konsekvens du ikke helt så komme.",
    mid: "Noen beslutninger tenker du grundig gjennom. Andre tar du på sparket. Hvor mye overveielse du legger inn, avhenger av hvor mye som står på spill.",
    high: "Før du handler, har du som regel allerede tenkt gjennom konsekvensene -- flere av dem. Den grundigheten gjør deg sjelden overrasket over egne valg.",
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
