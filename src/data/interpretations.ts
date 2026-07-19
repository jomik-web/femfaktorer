/**
 * Tolkningstekst per faktor og skårbånd.
 *
 * v3 (2026 -- Anette sin brukertest av forrige versjon, se prosjektlogg):
 * strukturen ble endret fra 6 korte, stablede enkeltsetninger (summary,
 * typicalExpressions, resources, challenges, contextNote, reflection) til 2
 * lengre, sammenhengende avsnitt (`overview`, `nuance`) + ett kort
 * refleksjonsspørsmål. Konkrete tilbakemeldinger som er rettet i denne
 * runden:
 *  - Teksten påsto tidligere å vite hva brukeren ønsket ("...enn du skulle
 *    ønske") -- fjernet all den typen antakelse om brukerens egne ønsker.
 *  - Flere "dette"/"det"-referanser uten tydelig forankring er skrevet om
 *    slik at det alltid er klart hva som vises til.
 *  - "Ofte" var sterkt overbrukt -- hedge-ordene er nå bevisst variert
 *    (gjerne, som regel, nok, later til, kan, typisk, i mange tilfeller).
 *  - relationshipNote brukte "partnere" i FLERTALL, som ga inntrykk av flere
 *    samtidige partnere -- endret til entall ("en partner") og skiller nå
 *    eksplisitt mellom kjæreste/samboer-typen relasjon og venner/familie.
 *  - Kortere setninger stablet oppå hverandre er skrevet sammen til
 *    fullstendige avsnitt som flyter bedre å lese.
 *
 * Grunnleggende tonekrav er uendret (Dokument 01 §12 / Dokument 02 §3.3 /
 * Grunnlagsdokumentet §8): aldri kategorisk eller diagnostisk, vis både
 * ressurser og utfordringer. Dette er fortsatt et arbeidsutkast og skal
 * gjennom planlagt faglig kvalitetssikring (Dokument 01 §21 punkt 14) før
 * reell lansering.
 *
 * v2.13 (språklig revisjon, 15.07.2026): alle 75 felt (5 hovedfaktorer x 3
 * nivåer x 5 felt) justert etter en direkte sammenligningstest mellom
 * Claude, ChatGPT og Gemini på samme kildetekst (Ekstroversjon, høyt nivå)
 * -- produkteier valgte ChatGPT sin setningsstil som utgangspunkt, med
 * konkrete eksempler på hvordan trekket viser seg i praksis lagt til, og
 * bevisst forsiktig/fraværende metaforbruk (Gemini sin gjennomgående
 * "batteri"-metafor ble vurdert som for påtrengende). Samme faglige
 * innhold, retning og styrkegrad som før -- kun formidlingen er endret.
 * Ekstroversjon/høy er ordrett den brukergodkjente testteksten.
 *
 * v2.17 (rapportomstrukturering, PÅGÅENDE utrulling, 16.07.2026): produkteier
 * ønsket en ny rekkefølge -- domenedefinisjon, deretter underkategoriene
 * FØRST, og til slutt én sammenhengende hovedkategori-analyse som viser til
 * fasettfunnene med ANDRE ord (ikke gjenbruker fasettsetningene ordrett),
 * og som vever inn jobb-/relasjonsimplikasjoner i selve teksten i stedet for
 * egne bokser. Det nye feltet `synthesis` under erstatter `overview` +
 * `nuance` + `careerNote` + `relationshipNote` i visningen NÅR det finnes
 * (se resultat/page.tsx -- domener uten `synthesis` ennå viser fortsatt den
 * gamle strukturen, slik at utrullingen kan skje kategori for kategori uten
 * at siden ser ufullstendig ut underveis). Planmessighet er første pilot.
 * De gamle feltene (`overview` m.fl.) beholdes i datastrukturen selv etter
 * migrering -- de brukes fortsatt internt av buildFacetDrivenOverview()
 * (fallback) og buildClosingSynthesis() til den avsluttende seksjonen også
 * er redesignet, som skjer etter at alle fem kategoriene er migrert.
 */

import {
  DISPLAY_FACTOR_LABELS_NO,
  DOMAIN_TO_DISPLAY,
  type DisplayFactor,
  type FactorResult,
  type FacetResult,
} from "@/lib/scoring";
import { matchCombinationInsights, matchFacetCombinationInsightsFlat } from "@/data/combinationInsights";
import { FACET_INTERPRETATIONS } from "@/data/facetInterpretations";

export type Band = "low" | "mid" | "high";

export function bandFor(score: number): Band {
  if (score < 40) return "low";
  if (score > 60) return "high";
  return "mid";
}

export interface Interpretation {
  /** Innledende avsnitt: hva trekket handler om og hvordan det ofte kommer til uttrykk i praksis -- ett sammenhengende avsnitt. */
  overview: string;
  /** Andre avsnitt: mulige ressurser OG mulige utfordringer vevd sammen, med tydelig forankrede referanser (aldri løsrevet "dette"). */
  nuance: string;
  /** Kort, åpent refleksjonsspørsmål -- antar ALDRI hva brukeren selv ønsker eller føler. */
  reflection: string;
  /**
   * Karriererelevant tolkning -- kun vist for tier "full", se resultat/page.tsx.
   * Samme regler: aldri bastant, aldri en fasit på hvilken jobb noen bør ha.
   */
  careerNote: string;
  /**
   * Relasjonsrelevant tolkning -- samme opphav og regler som careerNote.
   * Skiller mellom kjæreste/samboer-typen relasjon ("en partner", entall) og
   * venner/familie -- se filhode om v3-korrigeringen.
   */
  relationshipNote: string;
  /**
   * NYTT FELT (v2.26, produkteiers ønske om et "hvilke typer personer bør du
   * se etter"-avsnitt til gratisnivåets kjærlighetsseksjon). IKKE det samme
   * som relationshipNote (som beskriver hvordan DU fremstår/oppfører deg i
   * en relasjon) -- dette feltet peker i stedet på hvilke partneregenskaper
   * som ofte utfyller eller matcher godt med akkurat denne skåren. Bevisst
   * IKKE en fasit ("du bør date en X") -- alltid formulert som noe som
   * "ofte", "gjerne" eller "som regel" passer godt, aldri en garanti, og
   * viser gjerne til mer enn én mulig god match (både lignende og
   * utfyllende trekk kan fungere).
   */
  partnerNote: string;
  /**
   * NYTT FELT (v2.17). Én sammenhengende avsluttende analyse for hele
   * hovedkategorien -- skrevet EFTER at underkategoriene er presentert på
   * siden, så den skal aldri gjenta ordrett det fasettekstene allerede har
   * sagt. Vever inn jobb- og relasjonsimplikasjoner som en naturlig del av
   * teksten (ikke egne avsnitt/overskrifter), og nevner gjerne "til tross
   * for" eller "i kombinasjon med"-mønstre der det er dekning for det.
   * Valgfritt inntil ALLE fem hovedkategorier er migrert -- se filhode.
   */
  synthesis?: string;
  /**
   * NYTT FELT (v2.22). Kort, fremadskuende "hva betyr dette for deg"-tekst
   * (1-2 setninger) BRUKT KUN i den avsluttende profil-oppsummeringen (se
   * buildClosingSynthesis under), aldri i selve hovedkategori-seksjonen.
   * Skrevet med bevisst ANNET ordforråd og andre bilder enn
   * overview/nuance/synthesis/careerNote/relationshipNote over, siden
   * produkteier ba om at oppsummeringen ikke gjentar noe ordrett fra resten
   * av rapporten. Dekker bevisst ULIKE livsområder på tvers av de 15
   * tekstene (noen jobb, noen relasjoner, noen personlig utvikling) i stedet
   * for å følge samme jobb+relasjon-mal hver gang.
   */
  closingHook: string;
  /**
   * NYTT FELT (v2.32, produkteiers ønske 19.07.2026): ett kort, humoristisk,
   * gjenkjennelig "kom igjen, innrøm det"-eksempel knyttet til akkurat dette
   * trekket og skårbåndet. Formål: lette opp stemningen og få folk til å
   * flire litt av seg selv -- IKKE en tolkning eller et faglig funn, og skal
   * derfor ALDRI stå alene som forklaring. Vises i en tydelig avgrenset,
   * lekent merket boks atskilt fra hovedteksten (se resultat/page.tsx), aldri
   * vevd inn i overview/synthesis. Reglene i filhodet om aldri kategorisk
   * eller diagnostisk gjelder ikke direkte her (dette er bevisst ment som en
   * kjapp spøk, ikke en påstand om brukeren) -- men tonen skal fortsatt være
   * varm og selvgjenkjennelig, aldri slem eller nedlatende, og ALDRI gjøre
   * narr av noe som kan oppleves sårt (spesielt i lavt stability-bånd, hvor
   * humoren er bevisst holdt til trivielle, universelle ting som en oversendt
   * SMS -- ikke angst eller uro generelt).
   */
  funFact: string;
}

type Copy = Record<DisplayFactor, Record<Band, Interpretation>>;

/**
 * Nøytral forklaring av hva hovedkategorien MÅLER -- vist ØVERST i hver
 * kategori-seksjon, FØR underkategoriene (v2.17). Dette er bevisst IKKE
 * personlig ("du") -- det er en forklaring av testmetoden og begrepet,
 * samme register som fasettenes `description`-felt i
 * facetInterpretations.ts, ikke en kommentar til den som tar testen. Den
 * personlige, individuelle tolkningen kommer i `synthesis`/`overview`
 * under. Ingen verdivurdering av om høyt eller lavt er "best".
 */
export const DOMAIN_DEFINITIONS: Record<DisplayFactor, string> = {
  openness:
    "Åpenhet for erfaring måler graden av nysgjerrighet på nye ideer, opplevelser og perspektiver -- i fantasi, kunst, tanker eller livsstil. En høy skår indikerer en søken etter variasjon og det ukjente; en lav skår indikerer en preferanse for det konkrete og velprøvde.",
  conscientiousness:
    "Planmessighet måler graden av struktur, ansvar og målrettethet i hvordan oppgaver organiseres og gjennomføres. En høy skår indikerer grundighet og pålitelighet over tid; en lav skår indikerer fleksibilitet og evne til å improvisere når planer endres.",
  extraversion:
    "Ekstroversjon måler hvor mye energi som hentes fra sosial kontakt og ytre stimulering, og hvor tydelig initiativ og plass tas sosialt. En høy skår indikerer at sosial kontakt gir energi; en lav skår indikerer at ro og egen tid gir mer energi.",
  agreeableness:
    "Medmenneskelighet måler hvordan egne behov balanseres opp mot andres -- tillit, omtanke og vilje til samarbeid. En høy skår indikerer at fellesskap og andres behov vektlegges høyt; en lav skår indikerer større vekt på egne interesser.",
  stability:
    "Emosjonell stabilitet måler hvor lett man aktiveres av stress, usikkerhet og motgang, og hvor raskt roen gjenopprettes etterpå. En høy skår indikerer en jevn respons under press; en lav skår indikerer sterkere følelsesmessige reaksjoner og raskere aktivering.",
};

export const INTERPRETATIONS: Copy = {
  openness: {
    low: {
      overview:
        "Du foretrekker det konkrete og velprøvde fremfor det uprøvde. I praksis betyr det gjerne at du velger metoder som allerede har vist seg å fungere, holder deg til en kjent rute når du er på ferie, og sjelden bruker mye tid på kunst eller teori bare for teoriens skyld. Ideer og perspektiver du ikke kjenner fra før, frister sjeldnere enn de gjør for mange andre.",
      nuance:
        "Forankringen i det kjente gjør deg praktisk og forutsigbar å samarbeide med -- andre vet som regel hvor de har deg. Et prosjekt uten fasit, eller en omstilling du ikke har bedt om, kan derimot kreve en bevisst innsats for å legge vante løsninger til side. På jobben er du gjerne den som får ting unnagjort fremfor å utforske alternativer først. I relasjoner setter du stabilitet høyere enn spenning.",
      reflection: "Er det områder i livet ditt der litt mer nysgjerrighet kunne åpnet en dør du ellers går forbi?",
      careerNote:
        "Definerte oppgaver og velprøvde metoder passer godt for deg -- roller med tydelige rammer, som drift, forvaltning eller fagområder med etablert praksis, kan kjennes trygge og oversiktlige. Skal du inn i en mer nyskapende rolle, kan det hjelpe å bevisst trene på å tåle usikkerhet i en periode.",
      relationshipNote:
        "I en kjæreste- eller samboerrelasjon setter du pris på faste rammer og et rolig tempo -- en partner som deler eller respekterer det, matcher deg som regel godt. Blant venner er det ofte de faste, langvarige vennskapene du verdsetter mest, fremfor stadig nye bekjentskaper.",
      partnerNote:
        "En partner som også setter pris på det kjente og forutsigbare, matcher deg som regel godt -- men det kan også fungere fint med en mer nysgjerrig partner, så lenge de ikke krever stadig nytt og uprøvd av deg.",
      synthesis:
        "Det konkrete og velprøvde tiltrekker deg tydelig mer enn det uprøvde. Du velger gjerne metoder som allerede fungerer, holder deg til en kjent rute på ferie, og bruker sjelden mye tid på kunst eller teori for teoriens skyld. Denne forankringen gjør deg praktisk og forutsigbar å samarbeide med -- andre vet som regel hvor de har deg. Et prosjekt uten fasit, eller en omstilling du ikke har bedt om, krever derimot en bevisst innsats for å legge vante løsninger til side. På jobben handler dette ofte om å få ting unnagjort fremfor å utforske alternativer først. Roller med tydelige rammer -- drift, forvaltning, etablert praksis -- kjennes tryggere for deg enn en nyskapende rolle. I relasjoner veier stabilitet tyngre enn spenning: en partner som deler eller respekterer et rolig tempo passer deg godt, og blant venner er det gjerne de faste, langvarige vennskapene du setter høyest.",
      closingHook:
        "Din styrke ligger i å gjøre det som allerede virker, enda bedre -- ikke i å finne opp noe helt nytt. Bruk det bevisst: du er gjerne den som får et etablert system til å gå enda rundere.",
      funFact:
        "Du er den i vennegjengen som bestiller nøyaktig samme rett hver eneste gang -- og ser ingen grunn til å fikse noe som ikke er ødelagt.",
    },
    mid: {
      overview:
        "Du beveger deg naturlig mellom det kjente og det nye. Byr en anledning seg, blir du gjerne med på noe nytt -- en ny restaurant, en uvant løsning på jobb -- uten at du aktivt søker det uprøvde hele tiden. Verken fast bundet til rutiner eller rastløst på jakt etter noe annet.",
      nuance:
        "Evnen til å bevege deg mellom det kjente og det nye gjør deg tilpasningsdyktig i de fleste sammenhenger. Det kan likevel være vanskelig å kjenne etter i øyeblikket om du egentlig lengter etter noe nytt, eller bare er vant til å tenke at du burde. Privat varierer interessene dine gjerne med hvem du er sammen med. I jobbsammenheng takler du rutinepregede og kreative oppgaver omtrent like godt.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din faktisk slår inn -- og hva er annerledes da?",
      careerNote:
        "Du takler både strukturerte oppgaver og mer utforskende arbeidsformer rimelig greit, og passer derfor inn i mange typer roller -- fra jobber med faste rammer til oppgaver som krever litt nytenkning underveis.",
      relationshipNote:
        "Sammen med en partner beveger du deg naturlig mellom det kjente og det nye, og tilpasser deg gjerne den andres behov for stabilitet eller variasjon underveis.",
      partnerNote:
        "Du passer som regel godt sammen med de fleste partnertyper, fra den som liker faste rutiner til den som stadig søker nye opplevelser -- fleksibiliteten din gjør at begge deler kan fungere.",
      synthesis:
        "Du beveger deg naturlig mellom det kjente og det nye. Byr en anledning seg, blir du gjerne med på noe nytt -- uten at du aktivt søker det uprøvde hele tiden. Denne fleksibiliteten gjør deg tilpasningsdyktig i de fleste sammenhenger. Det kan likevel være vanskelig å vite i farten om du egentlig lengter etter noe nytt, eller bare er vant til å tenke at du burde. Privat varierer interessene dine gjerne med hvem du er sammen med. På jobben takler du rutinepregede og kreative oppgaver omtrent like godt -- en allsidighet som passer inn i mange typer roller. Sammen med en partner tilpasser du deg gjerne den andres behov for stabilitet eller variasjon.",
      closingHook:
        "Du har begge modiene tilgjengelig, og det gir deg et reelt valg -- ikke bare en vane -- når noe nytt dukker opp. Verdt å legge merke til hvilke situasjoner som faktisk får deg til å velge det uprøvde.",
      funFact:
        "Du er helt åpen for å prøve den nye sushiplassen -- helt til du står i døra og likevel bestiller det du pleier.",
    },
    high: {
      overview:
        "Nye ideer, inntrykk og perspektiver tiltrekker deg tydelig. Det viser seg gjerne som interesse for kunst, en uvant idé, eller et sted du ikke kjenner fra før -- og som en vane med å stille spørsmål ved det andre tar for gitt. Det uprøvde er sjelden noe du unngår.",
      nuance:
        "Nysgjerrigheten din gjør deg kreativ, og en pådriver når noe faktisk trenger å tenkes nytt. Ren gjentakelse og stor forutsigbarhet kan derimot fort oppleves som utålmodighet, både for deg selv og andre rundt deg. På jobben er det ofte du som foreslår en annen løsning enn den vante.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det ting du kunne tenke deg å utforske mer av?",
      careerNote:
        "Roller som gir rom for nytenkning, utforsking eller kreativt arbeid passer godt for deg. Sterkt rutinepregede stillinger kan over tid oppleves lite stimulerende, siden trangen til å utforske noe nytt melder seg uansett hvor du er.",
      relationshipNote:
        "I en kjæreste- eller samboerrelasjon fungerer det som regel best med en partner som tåler, eller helst deler, interessen din for det nye og uprøvde -- trygghet handler mer om felles utforsking for deg enn om fast forutsigbarhet. Blant venner trekkes du mot dem som byr på nye perspektiver.",
      partnerNote:
        "En partner som deler nysgjerrigheten din for nye ideer og opplevelser, eller som i det minste ikke trenger alt planlagt i detalj på forhånd, passer deg som regel godt.",
      synthesis:
        "Nye ideer, inntrykk og perspektiver tiltrekker deg tydelig. Det viser seg gjerne som interesse for kunst, en uvant idé, eller et sted du ikke kjenner fra før -- og som en vane med å stille spørsmål ved det andre tar for gitt. Nysgjerrigheten din gjør deg kreativ, og en pådriver når noe faktisk trenger å tenkes nytt. Ren gjentakelse og stor forutsigbarhet kan derimot fort oppleves som utålmodighet, både for deg selv og andre. På jobben er det ofte du som foreslår en annen løsning enn den vante -- roller med rom for nytenkning eller kreativt arbeid passer deg godt, mens sterkt rutinepregede stillinger kan kjennes lite stimulerende over tid. I en kjæreste- eller samboerrelasjon fungerer det som regel best med en partner som tåler, eller helst deler, interessen din for det nye. Blant venner trekkes du gjerne mot dem som byr på nye perspektiver.",
      closingHook:
        "Ideene dine har mest verdi når de faktisk lander et sted -- en skisse, et prosjekt, en samtale som går videre. Uten det blir nysgjerrigheten fort en serie løse tråder.",
      funFact:
        "Du har antagelig et browservindu med 30 faner om alt fra keramikk til gammelegyptisk historie akkurat nå -- pluss en halvferdig strikkepinne fra i fjor.",
    },
  },
  conscientiousness: {
    low: {
      overview:
        "Planer og faste rutiner styrer ikke hverdagen din i særlig grad -- du tar ting som de kommer. Å utsette noe til det faktisk haster, improvisere fremfor å følge en fast plan, og et skrivebord som gjerne ser litt rotete ut, er kjente mønstre for deg.",
      nuance:
        "Friheten fra faste rammer gjør deg god til å improvisere og tilpasse deg når planer endrer seg brått. Krever noe derimot tett oppfølging over lang tid -- et prosjekt med mange detaljer, en avtale langt frem i tid -- kan litt mer bevisst struktur være til god hjelp. Hjemme kan andre oppleve deg som avslappet der de selv ville planlagt. På jobb trives du best med korte, fleksible oppgaver fremfor lange løp med faste milepæler.",
      reflection: "Er det noen bestemte områder der litt mer forhåndsplanlegging ville gjort hverdagen lettere for deg?",
      careerNote:
        "Roller med stor grad av frihet og variasjon passer ofte bedre for deg enn stillinger som krever tett, langsiktig oppfølging av detaljer. Ekstern struktur -- sjekklister, eller faste rutiner satt av andre -- kan være god støtte i oppgaver der presisjon er avgjørende.",
      relationshipNote:
        "En partner eller nære venner opplever deg gjerne som avslappet og fleksibel å være sammen med, men også som noe mindre forutsigbar når det gjelder avtaler og oppfølging. Tydelig kommunikasjon om hva du faktisk kan love, er ekstra nyttig i nære relasjoner.",
      partnerNote:
        "En partner som bidrar med litt struktur uten å kreve det av deg hele tiden, kan være en god match -- like viktig er en partner som tar spontaniteten din med godt humør fremfor å forvente faste planer.",
      synthesis:
        "Faste rutiner og detaljerte planer styrer sjelden hverdagen din. Du forholder deg heller til det som dukker opp, og improviserer når noe endrer seg. Det gjør deg fleksibel når planer legges om på kort varsel. Det kan derimot gjøre det tyngre å holde fokus på noe som krever tett oppfølging over lang tid, som et stort prosjekt eller en avtale langt frem i tid. Du trives best i roller med rom for å tenke underveis, fremfor lange løp med faste milepæler. En partner eller nære venner opplever deg gjerne som avslappet å være sammen med -- men også som noe mindre forutsigbar når det gjelder avtaler. Tydelighet om hva du faktisk kan love er derfor ekstra nyttig.",
      closingHook:
        "Du er sjelden den som bremser noe med for mye planlegging -- den fleksibiliteten er en reell ressurs når ting endrer seg raskt. Skriv ned det du faktisk har lovet noen, så det ikke bare lever i hodet ditt.",
      funFact:
        "Skrivebordet ditt kan se ut som et arkeologisk utgravningsfelt, men du finner kvitteringen fra 2022 på null komma niks hvis noen spør.",
    },
    mid: {
      overview:
        "Struktur kommer og går etter behov hos deg -- verken fast rutine eller mangel på den dominerer. Du lager gjerne en liste til det viktigste, men ikke til alt, og både følger og avviker fra en plan uten at det stresser deg nevneverdig.",
      nuance:
        "Vekslingen mellom struktur og frihet gjør deg tilpasningsdyktig -- verken rigid eller planløs. Utfordringen kan være at det ikke alltid er opplagt, verken for deg selv eller andre, hvor mye struktur en gitt oppgave faktisk krever. I team er du fleksibel nok til å jobbe godt med både svært strukturerte og svært frie kolleger.",
      reflection: "Når merker du at planlegging faktisk hjelper deg -- og når føles den bare som en ekstra byrde?",
      careerNote:
        "Du takler både strukturerte oppgaver og mer frie arbeidsformer -- evnen til å justere hvor mye system du legger på en oppgave er en styrke i roller som varierer mye fra dag til dag.",
      relationshipNote:
        "Du tilpasser graden av planlegging etter hva situasjonen og relasjonen krever, uten at det ene alltid dominerer overfor en partner eller nære venner.",
      partnerNote:
        "Du passer som regel greit sammen med de fleste, særlig en partner som også justerer graden av struktur etter situasjonen fremfor å kreve enten fast rutine eller full frihet.",
      synthesis:
        "Struktur kommer og går etter behov hos deg. Du lager gjerne en liste til det viktigste, men ikke til alt, og både følger og avviker fra en plan uten at det stresser deg nevneverdig. Det gjør deg tilpasningsdyktig i de fleste sammenhenger. Det er derimot ikke alltid opplagt -- verken for deg selv eller andre -- hvor mye struktur en gitt oppgave faktisk krever. Denne vekslingen gjør deg til en fleksibel kollega, som takler både stramt strukturerte og friere arbeidsformer omtrent like godt. I nære relasjoner tilpasser du gjerne graden av planlegging etter hva situasjonen faktisk ber om.",
      closingHook:
        "Du velger struktur der den faktisk trengs, i stedet for å bruke den overalt av vane. Det er en undervurdert ferdighet -- mange bruker enten for mye eller for lite tid på planlegging, uansett situasjon.",
      funFact:
        "Du har en to-do-liste. Den er et sted. Den er sikkert ganske grei, egentlig.",
    },
    high: {
      overview:
        "Grundighet og sans for detaljer peker seg ut som tydelige trekk ved deg. Du fører lister, dobbeltsjekker arbeid før du leverer det, og lover sjelden noe du ikke faktisk følger opp -- pålitelighet kommer naturlig.",
      nuance:
        "Grundigheten din er en klar styrke når noe krever nøyaktighet, oppfølging, eller at andre skal kunne stole på deg over tid. Rask og uforutsigbar endring kan derimot kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt. Andre stoler gjerne på deg med ansvar på jobben. Privat setter du innimellom strengere krav til deg selv enn situasjonen egentlig ber om.",
      reflection: "Er det situasjoner der behovet ditt for orden og kontroll gjør noe vanskeligere enn det egentlig trenger å være?",
      careerNote:
        "Roller som krever nøyaktighet, pålitelighet og evne til å fullføre over tid passer godt for deg. Vær samtidig oppmerksom på at høye krav til deg selv kan gjøre det vanskeligere å delegere, eller akseptere at noe er «godt nok».",
      relationshipNote:
        "En partner eller nære venner stoler gjerne på at du følger opp det du sier -- en styrke i nære relasjoner. Egne høye standarder kan likevel av og til smitte over på forventningene du har til dem.",
      partnerNote:
        "En partner som setter pris på påliteligheten din, og som selv er komfortabel med planer og forpliktelser, passer deg som regel godt -- uten at det betyr at en mer spontan partner ikke også kan fungere, så lenge de respekterer behovet ditt for orden.",
      synthesis:
        "Grundighet og sans for detaljer peker seg tydelig ut hos deg. Du dobbeltsjekker gjerne arbeid før du leverer det, og lover sjelden noe du ikke faktisk følger opp. Den påliteligheten er en klar styrke når noe krever nøyaktighet eller langsiktig oppfølging. Rask og uforutsigbar endring kan derimot kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt. På jobben gjør påliteligheten din at andre gjerne gir deg ansvar uten å måtte følge opp i detalj. I nære relasjoner er det samme mønsteret en styrke -- en partner eller nære venner vet at du følger opp det du sier. Vær samtidig oppmerksom på at egne høye krav lett kan smitte over på forventningene du har til andre, både hjemme og på jobb.",
      closingHook:
        "Ordet ditt veier tungt for folk rundt deg, nettopp fordi du sjelden bryter det. Pass på at den samme påliteligheten ikke stille blir en forventning du legger på deg selv i alt du gjør.",
      funFact:
        "Kalenderen din er fargekodet, sokkeskuffen sortert etter tykkelse, og du har mest sannsynlig en reservekopi av reservekopien.",
    },
  },
  extraversion: {
    low: {
      overview:
        "Ro og egen tid gir deg mer energi enn store forsamlinger av mennesker. Én-til-én-samtaler foretrekker du fremfor store selskaper, og du trenger tid alene for å lade opp etter en sosial dag.",
      nuance:
        "Preferansen for ro gir deg godt fokus og evne til dypere konsentrasjon, uten at du blir avledet av det som skjer rundt deg. Mye sosial energi over tid -- nettverksbygging, store arrangementer -- kan derimot kjennes tyngre å holde ut i enn for andre. Sosialt foretrekker du ofte et lite, fast vennenettverk fremfor mange bekjentskaper. På jobb presterer du best med færre avbrytelser og mer skjermet tid.",
      reflection: "Hvordan balanserer du behovet ditt for ro opp mot situasjoner der du faktisk må være sosial?",
      careerNote:
        "Roller med mer selvstendig arbeid, dybdefokus og færre avbrytelser passer godt for deg. Åpne kontorlandskap, eller jobber med mye uforutsigbar sosial kontakt, kan tappe mer energi enn de gir tilbake.",
      relationshipNote:
        "Du trives best med noen få nære relasjoner fremfor et stort nettverk. En partner som respekterer behovet ditt for egen tid, og venner som forstår at du trenger ro innimellom, passer deg som regel godt.",
      partnerNote:
        "En partner som er bekvem med rolige kvelder og ikke trenger stadig sosialt selskap, matcher deg som regel godt -- noen som forstår at egen tid er noe du trenger, ikke noe du velger bort dem for.",
      synthesis:
        "Ro og egen tid gir deg mer energi enn store forsamlinger av mennesker. Du foretrekker én-til-én-samtaler fremfor store selskaper, og trenger tid alene for å lade opp etter en sosial dag. Denne preferansen gir deg godt fokus og evne til dypere konsentrasjon, uten å bli avledet av det som skjer rundt deg. Mye sosial energi over tid -- nettverksbygging, store arrangementer -- kan derimot kjennes tyngre å holde ut i enn for andre. På jobben presterer du gjerne best med færre avbrytelser og mer skjermet tid. Roller med selvstendig arbeid og dybdefokus passer deg bedre enn åpne kontorlandskap. Du trives best med noen få nære relasjoner fremfor et stort nettverk -- en partner som respekterer behovet ditt for egen tid, og venner som forstår at du trenger ro innimellom, passer deg som regel godt.",
      closingHook:
        "Energien din er en ressurs som må forvaltes bevisst, ikke brukes opp automatisk i enhver sosial sammenheng. Å velge bort noe sosialt er ikke et tegn på at noe er galt -- det er ofte riktig prioritering for deg.",
      funFact:
        "Du har regnet ut nøyaktig hvor lenge et bursdagsselskap må vare før du kan smyge deg ut uten at noen legger merke til det.",
    },
    mid: {
      overview:
        "Sosialt selskap og egen tid deler plassen ganske jevnt i livet ditt, uten at det ene klart dominerer. Du blir gjerne med på sosiale ting, men setter også pris på en kveld helt alene uten at det føles som noe savn.",
      nuance:
        "Vekslingen mellom sosialt og alene gjør deg fleksibel, uansett hvilken sosial situasjon du havner i. Noen ganger kan det likevel være vanskelig å legge merke til, i øyeblikket, om det egentlig er ro eller selskap du trenger mest. Energien din varierer en del fra dag til dag privat, mens du på jobb fungerer godt både i team og med selvstendig arbeid.",
      reflection: "Hva kjennetegner dagene der du kjenner at du har fått nok av begge deler -- sosialt og ro?",
      careerNote:
        "Du fungerer godt både i team og med selvstendig arbeid, og tilpasser deg derfor ulike arbeidsmiljøer uten at det ene tapper deg mer enn det andre.",
      relationshipNote:
        "Sosial energi varierer fra dag til dag for deg, og du finner som regel selv en rimelig balanse mellom samvær med partner og venner, og egen tid.",
      partnerNote:
        "Du fungerer som regel greit med de fleste partnertyper, særlig noen som også setter pris på en blanding av sosialt samvær og rolige stunder alene.",
      synthesis:
        "Sosialt selskap og egen tid deler plassen ganske jevnt i livet ditt, uten at det ene klart dominerer. Du blir gjerne med på sosiale ting, men setter også pris på en kveld helt alene uten at det føles som noe savn. Denne vekslingen gjør deg fleksibel i de fleste sosiale situasjoner. Det kan likevel være vanskelig å kjenne etter i farten om det egentlig er ro eller selskap du trenger mest. Energien din varierer en del fra dag til dag. På jobben fungerer du godt både i team og med selvstendig arbeid, og tilpasser deg dermed ulike arbeidsmiljøer. I relasjonene dine finner du som regel selv en rimelig balanse mellom samvær med partner og venner, og egen tid.",
      closingHook:
        "Du trenger sjelden ekstreme løsninger for å ha det bra sosialt -- verken mye alenetid eller mye selskap over lang tid. Den fleksibiliteten er lett å overse som en styrke, nettopp fordi den ikke skaper problemer.",
      funFact:
        "Du blir gjerne med på festen -- men sjekker rolig klokka rundt time to for å se når det blir sosialt akseptabelt å dra.",
    },
    high: {
      overview:
        "Du får energi av mennesker, og merker det tydelig når det skjer noe rundt deg. Det faller naturlig for deg å ta kontakt først, presentere deg for noen du ikke kjenner, eller foreslå at gruppen gjør noe sammen i stedet for å vente og se. Der andre nøler litt, er du ofte den som setter i gang samtalen eller aktiviteten.",
      nuance:
        "Den sosiale energien din smitter lett over på andre, og du blir ofte den som drar i gang driv og stemning i en gruppe. Baksiden er at det kan bli fristende å fylle kalenderen litt for mye. En helg uten planer, eller en uke med mest arbeid alene, kan kjennes tommere for deg enn for mange andre. Privat henter du overskudd gjennom folk rundt deg. På jobben bidrar du ofte til liv, fremdrift og engasjement i møter og prosjekter.",
      reflection: "Når merker du best forskjellen mellom sosial energi som gir deg overskudd, og sosial aktivitet som bare fyller tiden?",
      careerNote:
        "Arbeid der du får møte mennesker, samarbeide, påvirke eller formidle -- som salg, prosjektledelse eller kundekontakt -- gir deg ofte energi i stedet for å tappe deg. Dager med variasjon og jevnlig kontakt med andre passer deg bedre enn lange strekk med stillesittende arbeid alene.",
      relationshipNote:
        "Du trives som regel best når det skjer noe sammen med andre -- en middag med venner, en tur, en spontan plan. En partner som setter pris på, eller i det minste forstår, behovet ditt for et aktivt sosialt liv, passer deg godt. Venner og familie er ofte en viktig kilde til energi og gode opplevelser for deg.",
      partnerNote:
        "En partner som setter pris på et aktivt sosialt liv sammen med deg, eller i det minste ikke lar seg tappe av det, passer deg som regel godt -- noen som gir deg rom for å ta initiativ uten å oppleve det som at du tar for mye plass.",
      synthesis:
        "Du får tydelig energi av mennesker, og merker det raskt når det skjer noe rundt deg. Det faller naturlig for deg å ta kontakt først, presentere deg for noen du ikke kjenner, eller foreslå at gruppen gjør noe sammen i stedet for å vente og se. Den sosiale energien din smitter lett over på andre -- du blir ofte den som drar i gang driv og stemning i en gruppe. Baksiden er at det kan bli fristende å fylle kalenderen litt for mye. En helg uten planer kan kjennes tommere for deg enn for mange andre. På jobben bidrar du ofte til liv, fremdrift og engasjement i møter og prosjekter. Arbeid der du får møte mennesker, samarbeide eller formidle -- som salg, prosjektledelse eller kundekontakt -- gir deg gjerne energi i stedet for å tappe deg. Du trives som regel best når det skjer noe sammen med andre, og en partner som setter pris på -- eller i det minste forstår -- behovet ditt for et aktivt sosialt liv, passer deg godt.",
      closingHook:
        "Andre merker fort når du er i rommet, og det gir deg en reell innflytelse på stemningen rundt deg. Bruk den bevisst -- den samme energien kan løfte en gruppe, eller ta unødvendig mye plass.",
      funFact:
        "Du kjenner navnet på postbudet, bussjåføren og sikkert naboens katt -- og heisturen er aldri helt stille når du er der.",
    },
  },
  agreeableness: {
    low: {
      overview:
        "Egne vurderinger veier tungt hos deg, også når de støter mot det andre mener. Du sier tydelig fra når du er uenig, forhandler hardt når det trengs, og lar ikke automatisk andres meninger veie tyngst.",
      nuance:
        "Tydeligheten din gjør deg god til å sette grenser og stå støtt i konflikt når det faktisk er nødvendig. Tett samarbeid kan derimot dra nytte av at du bevisst løfter frem den andre partens perspektiv, selv når du er trygg på ditt eget. Beslutninger andre ikke våger å stille spørsmål ved, er ofte noe du utfordrer på jobben.",
      reflection: "Er det relasjoner der litt mer imøtekommenhet kunne styrket samarbeidet, uten at du gir opp det som er viktig for deg?",
      careerNote:
        "Roller som krever tøffe forhandlinger, tydelige beslutninger, eller å stå alene i uenighet, passer ofte godt for deg. I team med mye samarbeid kan det være nyttig å bevisst løfte frem andres perspektiv, selv når du er trygg på ditt eget.",
      relationshipNote:
        "Du setter grenser tydelig overfor en partner eller venner, noe som kan være en styrke. Nære relasjoner trenger likevel av og til at du bevisst viser fram at du bryr deg, ikke bare at du har rett.",
      partnerNote:
        "En partner som tåler direkte tale og ikke trenger konstant bekreftelse eller harmoni, passer deg som regel godt -- noen som kan stå i en uenighet uten å ta det personlig.",
      synthesis:
        "Egne vurderinger veier tungt hos deg, også når de støter mot det andre mener. Du sier tydelig fra når du er uenig, og forhandler hardt når det trengs. Denne tydeligheten gjør deg god til å sette grenser og stå støtt i konflikt når det faktisk er nødvendig. Tett samarbeid kan derimot dra nytte av at du bevisst løfter frem den andre partens perspektiv, selv når du er trygg på ditt eget. På jobben er det ofte du som utfordrer beslutninger andre ikke våger å stille spørsmål ved -- roller som krever tøffe forhandlinger eller tydelige beslutninger passer deg derfor godt. Du setter grenser tydelig overfor en partner eller venner, noe som kan være en styrke i seg selv. Nære relasjoner trenger likevel av og til at du bevisst viser at du bryr deg, ikke bare at du har rett.",
      closingHook:
        "Du er sjelden den som lar andre bestemme premissene for deg -- det er en styrke i forhandlinger og pressede situasjoner. Vurder likevel innimellom om saken faktisk er verdt like mye som prinsippet.",
      funFact:
        "Når gruppechatten spør «hva synes dere om forslaget», er du den som faktisk svarer -- med fullstendige setninger og en klar mening.",
    },
    mid: {
      overview:
        "Egne og andres behov teller omtrent likt for deg, avhengig av situasjonen du står i. Du gir deg gjerne i en diskusjon den ene dagen og holder på ditt den neste, uten noe fast mønster.",
      nuance:
        "Den jevne vektingen gjør deg til en forutsigbar og rettferdig samarbeidspartner. Utfordringen kan være å legge merke til, der og da, når du egentlig burde sette deg selv først -- eller omvendt. På jobb tilpasser du samarbeidsstilen din etter hvem du jobber med.",
      reflection: "Når merker du at du gir mest av deg selv -- og når holder du mest igjen?",
      careerNote:
        "Du tilpasser samarbeidsstilen din etter hvem du jobber med, og fungerer derfor rimelig godt i de fleste team -- verken for ettergivende eller for konfronterende.",
      relationshipNote:
        "Du gir og tar omtrent i lik grad i relasjoner, avhengig av situasjonen -- en balansert stil som en partner eller venner som regel opplever som rimelig.",
      partnerNote:
        "Du passer som regel greit sammen med de fleste, særlig en partner som også balanserer egne behov mot omtanke for den andre, fremfor å alltid sette én av delene først.",
      synthesis:
        "Egne og andres behov teller omtrent likt for deg, avhengig av situasjonen du står i. Du gir deg gjerne i en diskusjon den ene dagen, og holder på ditt den neste, uten noe fast mønster. Denne jevne vektingen gjør deg til en forutsigbar og rettferdig samarbeidspartner. Utfordringen kan være å skjønne i farten når du egentlig burde sette deg selv først -- eller omvendt. På jobben tilpasser du samarbeidsstilen din etter hvem du jobber med, og fungerer derfor rimelig godt i de fleste team. Du gir og tar omtrent i lik grad i relasjoner også -- en balansert stil som en partner eller venner som regel opplever som rimelig.",
      closingHook:
        "Du velger sjelden side automatisk -- verken alltid deg selv eller alltid andre. Den dømmekraften er lettere å ta for gitt enn den burde være.",
      funFact:
        "«Det er helt greit for meg,» sier du -- og mener det, som regel, nesten alltid.",
    },
    high: {
      overview:
        "Andres behov opptar en stor plass hos deg, og du finner ofte glede i å hjelpe. Du sier gjerne ja når noen ber om hjelp, selv når det koster deg noe, og velger heller å unngå konflikt enn å skape uenighet.",
      nuance:
        "Andre lener seg gjerne på deg som en varm, tillitsvekkende samarbeidspartner nettopp derfor. Å sette grenser kan derimot bli vanskeligere med det samme trekket, selv når det går ut over deg selv. Privat bruker du mye energi på å unngå at noen blir skuffet. På jobb tar du ofte på deg mer enn du burde for å hjelpe andre.",
      reflection: "Er det situasjoner der omtanken din for andre går tydelig på bekostning av dine egne behov?",
      careerNote:
        "Du er en verdsatt samarbeidspartner i team, men risikerer å ta på deg mer enn du burde for å hjelpe andre. Bevisst grensesetting på jobb kan derfor være ekstra viktig for deg.",
      relationshipNote:
        "En partner eller venner lener seg gjerne på deg som en varm og støttende person å ha rundt seg. Pass på at det ikke går på bekostning av dine egne behov i det lange løp.",
      partnerNote:
        "En partner som ikke utnytter imøtekommenheten din, og som aktivt inviterer deg til å si fra om egne behov, passer deg som regel godt.",
      synthesis:
        "Andres behov opptar en stor plass hos deg, og du finner ofte glede i å hjelpe. Du sier gjerne ja når noen ber om hjelp, selv når det koster deg noe, og velger heller å unngå konflikt enn å skape uenighet. Andre lener seg gjerne på deg som en varm, tillitsvekkende samarbeidspartner nettopp derfor. Å sette grenser kan derimot bli vanskeligere med det samme trekket, selv når det går ut over deg selv. På jobben tar du ofte på deg mer enn du burde for å hjelpe andre -- bevisst grensesetting kan derfor være ekstra viktig for deg, selv som en verdsatt samarbeidspartner i team. Privat bruker du mye energi på å unngå at noen blir skuffet. En partner eller venner lener seg gjerne på deg som en varm og støttende person å ha rundt seg -- pass på at det ikke går på bekostning av dine egne behov i det lange løp.",
      closingHook:
        "Du er sjelden den som skaper en konflikt, men vær obs på hvor ofte du unngår en du faktisk burde tatt. Noen ganger er det mest omsorgsfulle å si tydelig fra.",
      funFact:
        "Du sier unnskyld til møbler du dunker borti, og ender ofte opp med maten ingen andre ville ha, bare for at alle skal bli fornøyde.",
    },
  },
  stability: {
    low: {
      overview:
        "Bekymring, uro og humørsvingninger rammer deg noe hardere enn mange andre i perioder. Smått kan vokse seg stort i tankene dine, og humøret ditt kan svinge en del i løpet av én og samme dag.",
      nuance:
        "Følsomheten din betyr også at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger som andre overser. I stressende perioder er det ekstra viktig for deg å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned. Forutsigbarhet i relasjoner hjelper deg å kjenne deg trygg. På jobb kjennes press og tidsfrister ofte tyngre enn de ser ut til for andre.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
      careerNote:
        "Høyt tempo, stramme tidsfrister og mye uforutsigbarhet i jobben kan kjennes tyngre for deg enn for mange andre. Roller med noe mer forutsigbarhet, og støtte fra kolleger eller leder, kan gjøre stor forskjell.",
      relationshipNote:
        "Forutsigbarhet og tydelig kommunikasjon fra en partner og nære venner hjelper deg å kjenne deg trygg. Det kan være verdt å være åpen om hva som skaper uro for deg, slik at de rundt deg kan møte det.",
      partnerNote:
        "En partner med en rolig, stødig stil -- som ikke selv blir stresset av at du blir det -- kan være til stor hjelp. Noen som gir tydelig, forutsigbar kommunikasjon fremfor å eskalere når det først butter, passer deg som regel godt.",
      synthesis:
        "Bekymring, uro og humørsvingninger rammer deg noe hardere enn mange andre i perioder. Smått kan vokse seg stort i tankene dine, og humøret ditt kan svinge en del i løpet av én og samme dag. Denne følsomheten betyr også at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger som andre overser. I stressende perioder er det ekstra viktig for deg å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned. På jobben kjennes press og tidsfrister ofte tyngre enn de ser ut til for andre. Roller med noe mer forutsigbarhet, sammen med støtte fra kolleger eller leder, kan gjøre stor forskjell. Forutsigbarhet og tydelig kommunikasjon fra en partner og nære venner hjelper deg å kjenne deg trygg. Det kan være verdt å være åpen om hva som skaper uro for deg, slik at de rundt deg kan møte det.",
      closingHook:
        "Følsomheten din er ikke bare noe å håndtere -- den gjør deg også i stand til å fange opp ting andre går glipp av. Faste holdepunkter hjelper deg mer enn viljestyrke gjør, når presset øker.",
      funFact:
        "Du har med stor sannsynlighet overtenkt en SMS i 20 minutter før du til slutt sendte «ok».",
    },
    mid: {
      overview:
        "Livets opp- og nedturer håndteres med en ganske jevn linje hos deg. Du blir litt stresset eller nedfor når noe faktisk er krevende, men det tar sjelden overhånd eller varer unødvendig lenge.",
      nuance:
        "Den jevne linjen gir deg en solid, stabil grunnmur å møte hverdagen fra. Er flere ting krevende samtidig, eller varer presset lenge, kan det likevel være nyttig å ha noen faste rutiner å støtte deg på. Du er som regel den rolige i konflikter privat, uten at det betyr at ingenting berører deg.",
      reflection: "Hvilke situasjoner er det som best tester roen din -- og hva skjer i deg da?",
      careerNote:
        "Du tåler et visst arbeidspress uten at det går nevneverdig utover deg, men flere krevende ting samtidig kan likevel kjennes tyngre. Faste rutiner på jobb kan være en nyttig støtte i travle perioder.",
      relationshipNote:
        "Du er som regel den nokså rolige i opp- og nedturer sammen med en partner eller venner, uten at det betyr at ingenting berører deg.",
      partnerNote:
        "Du passer som regel greit sammen med de fleste partnertyper, siden du selv håndterer opp- og nedturer nokså jevnt -- en partner som også er noenlunde stabil, kan likevel gjøre hverdagen enda roligere.",
      synthesis:
        "Livets opp- og nedturer håndteres med en ganske jevn linje hos deg. Du blir litt stresset eller nedfor når noe faktisk er krevende, men det tar sjelden overhånd eller varer unødvendig lenge. Denne jevne linjen gir deg en solid, stabil grunnmur å møte hverdagen fra. Er flere ting krevende samtidig, eller varer presset lenge, kan det likevel være nyttig å ha noen faste rutiner å støtte deg på. På jobben tåler du et visst arbeidspress uten at det går nevneverdig utover deg -- faste rutiner kan være en nyttig støtte i travle perioder. Du er som regel den nokså rolige i opp- og nedturer sammen med en partner eller venner også, uten at det betyr at ingenting berører deg.",
      closingHook:
        "Du trenger sjelden store grep for å holde deg noenlunde stødig -- roen din kommer stort sett av seg selv. Det gjør det lett å glemme å bygge opp reserver før en faktisk krevende periode kommer.",
      funFact:
        "Noe kjipt skjer, du blir litt satt ut -- og så er du stort sett tilbake til vanlig humør før neste episode er ferdig.",
    },
    high: {
      overview:
        "Stress og motgang preller lettere av deg enn hos mange andre, selv når mye skjer samtidig. Andre kommer gjerne til deg når noe er vanskelig, fordi du sjelden virker overveldet, og kritikk tar sjelden tak i deg over lang tid.",
      nuance:
        "Roen din gjør deg til en stødig støtte for andre i krevende situasjoner, og gir deg selv ro til å tenke klart under press. Baksiden er at du lettere overser reell risiko og tidlige varselsignaler. Folk rundt deg må privat noen ganger si tydelig ifra før du fanger opp at noe er galt. På jobb er du gjerne den som holder hodet kaldt når andre stresser.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du naturlig tar ting med ro?",
      careerNote:
        "Du takler press og uforutsigbarhet bedre enn mange andre, noe som kan gjøre deg til en verdifull ressurs i krevende eller krisepregede roller. Vær samtidig oppmerksom på at det samme trekket kan gjøre deg mindre lydhør for tidlige varselsignaler.",
      relationshipNote:
        "Du er gjerne den stødige når en partner eller venner går gjennom noe vanskelig. Pass på at de som reagerer sterkere enn deg, ikke opplever at bekymringene deres blir avfeid.",
      partnerNote:
        "En partner kan gjerne være mer følelsesmessig ekspressiv enn deg uten at det blir et problem -- roen din kan bidra som en god motvekt, så lenge den ikke blir tolket som at du ikke bryr deg. En partner som selv er rolig, passer deg også godt, uten at det er en forutsetning.",
      synthesis:
        "Stress og motgang preller lettere av deg enn hos mange andre, selv når mye skjer samtidig. Andre kommer gjerne til deg når noe er vanskelig, fordi du sjelden virker overveldet. Kritikk tar sjelden tak i deg over lang tid. Roen din gjør deg til en stødig støtte for andre i krevende situasjoner, og gir deg selv ro til å tenke klart under press. Baksiden er at du lettere overser reell risiko og tidlige varselsignaler. På jobben er du gjerne den som holder hodet kaldt når andre stresser -- en egenskap som kan gjøre deg til en verdifull ressurs i krevende eller krisepregede roller. Vær bevisst på at folk rundt deg noen ganger må si tydelig ifra før du fanger opp at noe er galt. Du er gjerne den stødige når en partner eller venner går gjennom noe vanskelig -- pass på at de som reagerer sterkere enn deg ikke opplever at bekymringene deres blir avfeid.",
      closingHook:
        "Roen din er en ressurs andre merker og lener seg på, kanskje mer enn du selv legger merke til. Spør innimellom hvordan de faktisk har det -- den samme roen kan gjøre deg vanskelig å lese for dem.",
      funFact:
        "Mens andre får panikk over en sprukket vannledning, googler du rolig etter rørlegger mens du fortsetter å spise lunsjen din.",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";

/**
 * v2.24 (produkteiers ønske 18.07.2026): lavmælt, men tydelig henvisning til
 * reell hjelp -- vises uansett resultat, ikke bare ved bestemte skårer,
 * siden vi ikke skal (og ikke kan) bruke testresultatet til å avgjøre hvem
 * som trenger å se den. Tall verifisert mot Helsenorges offisielle sider.
 */
export const CRISIS_NOTICE =
  'Kjenner du på mye vondt eller vanskelige tanker om deg selv? Dette resultatet er ikke stedet for å håndtere det. Hjelpetelefonen (Mental Helse) er gratis og døgnåpen: 116 123, eller chat på sidetmedord.no. I en akutt situasjon: ring 113.';

export interface ClosingSynthesis {
  text: string;
}

/**
 * v2.33 (produkteiers ønske 19.07.2026): deler en lang, sammenhengende tekst
 * opp i naturlige avsnitt ved setningsgrenser -- "oppsummeringene... kan
 * deles opp i flere avsnitt". Rent presentasjonslag som brukes ved VISNING
 * av `synthesis`- og `closing`-tekstene (se resultat/page.tsx) -- selve
 * datafeltene er fortsatt én sammenhengende streng, så ingen av de 15
 * eksisterende `synthesis`-tekstene måtte skrives om for hånd. Korte tekster
 * (færre enn `targetParagraphs x 2` setninger) deles bevisst IKKE opp --
 * unødvendig fragmentering av noe som allerede er kort.
 */
export function splitIntoParagraphs(text: string, targetParagraphs = 2): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g)?.map((s) => s.trim()) ?? [text];
  if (sentences.length < targetParagraphs * 2) return [text];
  const perParagraph = Math.ceil(sentences.length / targetParagraphs);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += perParagraph) {
    paragraphs.push(sentences.slice(i, i + perParagraph).join(" "));
  }
  return paragraphs;
}

const CLOSING_LINE =
  "Ingen deler av profilen din er faste eller uforanderlige -- de beskriver tendenser nå, ikke et endelig tak for hvem du kan bli.";

const CLOSING_FALLBACK: ClosingSynthesis = {
  text:
    `Profilen din er nokså jevn på tvers av de fem hovedkategoriene, uten at noen av dem peker seg klart ut. Det gir deg trolig en bred fleksibilitet -- du beveger deg naturlig mellom flere ulike måter å møte jobb, folk og oppgaver på, avhengig av situasjonen, i stedet for å falle tilbake på ett fast mønster. ${CLOSING_LINE}`,
};

type ExtremeBand = "low" | "high";
const BAND_ADJECTIVE: Record<ExtremeBand, string> = { low: "lav", high: "høy" };

function formatFactorPhrase(factor: DisplayFactor, band: ExtremeBand): string {
  return `${BAND_ADJECTIVE[band]} ${DISPLAY_FACTOR_LABELS_NO[factor]}`;
}

/** v2.23: gjør et fasettnavn ("Bekymring / ro") naturlig midt i en setning -- unngår at det leses som et feilplassert egennavn. */
function lowerFirst(word: string): string {
  return word.length > 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word;
}

/**
 * Setter sammen en avsluttende, HELHETLIG profiloppsummering. Redesignet
 * (v2.22) etter produkteiers tilbakemelding om at "Hva betyr dette for deg"
 * (a) skal stå som et eget, avsluttende ark -- ikke gjentas etter hver
 * hovedkategori, se resultat/page.tsx sin nye "summary"-fane -- og (b) skal
 * se på tvers av ALLE fem hovedkategoriene og underkategoriene i
 * kombinasjon, forklare HVORFOR en kombinasjon gir det den gir (høye
 * enkeltskårer, eller et samspill mellom to spesifikke trekk), og ALDRI
 * gjenta noe ordrett fra resten av rapporten.
 *
 * Bygger derfor IKKE lenger på careerNote/relationshipNote/reflection (v2.3-
 * originalen) -- de tekstene er allerede vevd inn i hver hovedkategoris egen
 * `synthesis`-tekst (v2.17) og ville gitt reell duplisering. Bruker i stedet:
 *  1. Det ferske `closingHook`-feltet (se Interpretation over) -- egne,
 *     kortere tekster skrevet med annet ordforråd og andre bilder enn resten
 *     av rapporten, KUN brukt her.
 *  2. En fersk, generisk koblingssetning til eventuelle KURATERTE
 *     kombinasjonsfunn (data/combinationInsights.ts) som treffer minst ett
 *     av de mest fremtredende trekkene -- navngir funnet på nytt i stedet
 *     for å gjenbruke kortets egen `text`, og sier eksplisitt at det handler
 *     om et SAMSPILL mellom to trekk (til forskjell fra en bred, jevnt høy/
 *     lav profil, som får en annen, generisk forklaring).
 *
 * v2.33: ny valgfri `skipCombos`-modus -- brukt for den KORTE, "samlede"
 * analysen på gratis-tieren (50 spm, se produkteiers krav om at denne "kan
 * være relativt kort"). Gratis-tieren har verken fasetter eller en egen
 * "Spennende samspill"-seksjon å vise til, så kombinasjonssetningene
 * (som ellers ville pekt på funn brukeren ikke får se) utelates helt i
 * stedet for å falle tilbake på den generiske "bredt mønster"-setningen.
 */
export function buildClosingSynthesis(
  factors: FactorResult[],
  facets: FacetResult[],
  options: { skipCombos?: boolean } = {}
): ClosingSynthesis {
  const sorted = [...factors].sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50));
  const defining = sorted.filter((f) => bandFor(f.score) !== "mid").slice(0, 3);
  if (defining.length === 0) return CLOSING_FALLBACK;

  const definingBands = new Map<DisplayFactor, ExtremeBand>(
    defining.map((f) => [f.factor, bandFor(f.score) as ExtremeBand])
  );

  const phrases = defining.map((f) => formatFactorPhrase(f.factor, definingBands.get(f.factor)!));
  const opener =
    phrases.length === 1
      ? `Det som peker seg tydeligst ut i profilen din, er ${phrases[0]}.`
      : `Det som peker seg tydeligst ut i profilen din, er kombinasjonen av ${phrases.slice(0, -1).join(", ")} og ${phrases[phrases.length - 1]}.`;

  const hooks = defining
    .map((f) => INTERPRETATIONS[f.factor][definingBands.get(f.factor)!].closingHook)
    .filter((h): h is string => Boolean(h));

  if (options.skipCombos) {
    return { text: [opener, ...hooks, CLOSING_LINE].join(" ") };
  }

  // Kuraterte kombinasjonsfunn (hovedfaktor- og fasettnivå) som involverer
  // minst ett av de mest fremtredende trekkene -- fasettnivå først, siden
  // det gir en mer PRESIS "hvorfor"-forklaring enn hovedfaktornivå alene.
  const definingFactors = new Set(defining.map((f) => f.factor));
  const matchedFacetCombos = matchFacetCombinationInsightsFlat(facets, bandFor).filter((c) => {
    const domainA = FACET_INTERPRETATIONS[c.facetA]?.domain;
    const domainB = FACET_INTERPRETATIONS[c.facetB]?.domain;
    return (domainA && definingFactors.has(DOMAIN_TO_DISPLAY[domainA])) || (domainB && definingFactors.has(DOMAIN_TO_DISPLAY[domainB]));
  });
  const matchedDomainCombos = matchCombinationInsights(factors, bandFor).filter(
    (c) => definingFactors.has(c.factorA) || definingFactors.has(c.factorB)
  );

  const comboSentences: string[] = [];
  for (const c of matchedFacetCombos.slice(0, 1)) {
    const labelA = lowerFirst(FACET_INTERPRETATIONS[c.facetA]?.label ?? c.facetA);
    const labelB = lowerFirst(FACET_INTERPRETATIONS[c.facetB]?.label ?? c.facetB);
    comboSentences.push(
      `Underkategoriene gir et mer presist bilde her: samspillet mellom «${labelA}» og «${labelB}» forklarer noe av dette.`
    );
  }
  for (const c of matchedDomainCombos.slice(0, Math.max(0, 2 - comboSentences.length))) {
    comboSentences.push(
      `Kombinasjonen av ${formatFactorPhrase(c.factorA, c.bandA)} og ${formatFactorPhrase(c.factorB, c.bandB)} peker seg spesielt ut hos deg -- her handler resultatet om samspillet mellom to trekk, ikke bare høye eller lave enkeltskårer hver for seg.`
    );
  }
  if (comboSentences.length === 0) {
    comboSentences.push(
      "Dette ser ikke ut til å være drevet av én enkelt uvanlig kombinasjon, men av et gjennomgående mønster på tvers av underkategoriene -- et bredt, konsistent trekk snarere enn ett enkelt utslag."
    );
  }

  return {
    text: [opener, ...hooks, ...comboSentences, CLOSING_LINE].join(" "),
  };
}
