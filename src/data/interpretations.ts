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

import type { DisplayFactor, FactorResult } from "@/lib/scoring";

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
   * NYTT FELT (v2.17). Én sammenhengende avsluttende analyse for hele
   * hovedkategorien -- skrevet EFTER at underkategoriene er presentert på
   * siden, så den skal aldri gjenta ordrett det fasettekstene allerede har
   * sagt. Vever inn jobb- og relasjonsimplikasjoner som en naturlig del av
   * teksten (ikke egne avsnitt/overskrifter), og nevner gjerne "til tross
   * for" eller "i kombinasjon med"-mønstre der det er dekning for det.
   * Valgfritt inntil ALLE fem hovedkategorier er migrert -- se filhode.
   */
  synthesis?: string;
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
    },
    mid: {
      overview:
        "Du beveger deg naturlig mellom det kjente og det nye. Byr en anledning seg, blir du gjerne med på noe nytt -- en ny restaurant, en uvant løsning på jobb -- uten at du aktivt søker det uprøvde hele tiden. Verken fast bundet til rutiner eller rastløst på jakt etter noe annet.",
      nuance:
        "Evnen til å bevege deg mellom det kjente og det nye gjør deg tilpasningsdyktig i de fleste sammenhenger. Det kan likevel være vanskelig å kjenne etter i øyeblikket om du egentlig lengter etter noe nytt, eller bare er vant til å tenke at du burde. Privat varierer interessene dine gjerne med hvem du er sammen med; i jobbsammenheng takler du rutinepregede og kreative oppgaver omtrent like godt.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din faktisk slår inn -- og hva er annerledes da?",
      careerNote:
        "Du takler både strukturerte oppgaver og mer utforskende arbeidsformer rimelig greit, og passer derfor inn i mange typer roller -- fra jobber med faste rammer til oppgaver som krever litt nytenkning underveis.",
      relationshipNote:
        "Sammen med en partner beveger du deg naturlig mellom det kjente og det nye, og tilpasser deg gjerne den andres behov for stabilitet eller variasjon underveis.",
    },
    high: {
      overview:
        "Nye ideer, inntrykk og perspektiver tiltrekker deg tydelig. Det viser seg gjerne som interesse for kunst, en uvant idé, eller et sted du ikke kjenner fra før -- og som en vane med å stille spørsmål ved det andre tar for gitt. Det uprøvde er sjelden noe du unngår.",
      nuance:
        "Nysgjerrigheten din gjør deg kreativ, og en pådriver når noe faktisk trenger å tenkes nytt. Ren gjentakelse og stor forutsigbarhet er derimot situasjoner der den samme trangen til det nye lett kan oppleves som utålmodighet -- både for deg selv og andre rundt deg. På jobben er det ofte du som foreslår en annen løsning enn den vante.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det ting du kunne tenke deg å utforske mer av?",
      careerNote:
        "Roller som gir rom for nytenkning, utforsking eller kreativt arbeid passer godt for deg. Sterkt rutinepregede stillinger kan over tid oppleves lite stimulerende, siden trangen til å utforske noe nytt melder seg uansett hvor du er.",
      relationshipNote:
        "I en kjæreste- eller samboerrelasjon fungerer det som regel best med en partner som tåler, eller helst deler, interessen din for det nye og uprøvde -- trygghet handler mer om felles utforsking for deg enn om fast forutsigbarhet. Blant venner trekkes du mot dem som byr på nye perspektiver.",
    },
  },
  conscientiousness: {
    low: {
      overview:
        "Planer og faste rutiner styrer ikke hverdagen din i særlig grad -- du tar ting som de kommer. Å utsette noe til det faktisk haster, improvisere fremfor å følge en fast plan, og et skrivebord som gjerne ser litt rotete ut, er kjente mønstre for deg.",
      nuance:
        "Friheten fra faste rammer gjør deg god til å improvisere og tilpasse deg når planer endrer seg brått. Krever noe derimot tett oppfølging over lang tid -- et prosjekt med mange detaljer, en avtale langt frem i tid -- kan litt mer bevisst struktur være til god hjelp. Hjemme kan andre oppleve deg som avslappet der de selv ville planlagt; på jobb trives du best med korte, fleksible oppgaver fremfor lange løp med faste milepæler.",
      reflection: "Er det noen bestemte områder der litt mer forhåndsplanlegging ville gjort hverdagen lettere for deg?",
      careerNote:
        "Roller med stor grad av frihet og variasjon passer ofte bedre for deg enn stillinger som krever tett, langsiktig oppfølging av detaljer. Ekstern struktur -- sjekklister, eller faste rutiner satt av andre -- kan være god støtte i oppgaver der presisjon er avgjørende.",
      relationshipNote:
        "En partner eller nære venner opplever deg gjerne som avslappet og fleksibel å være sammen med, men også som noe mindre forutsigbar når det gjelder avtaler og oppfølging. Tydelig kommunikasjon om hva du faktisk kan love, er ekstra nyttig i nære relasjoner.",
      synthesis:
        "Faste rutiner og detaljerte planer styrer sjelden hverdagen din -- du forholder deg heller til det som dukker opp, og improviserer når noe endrer seg. Det gjør deg fleksibel når planer legges om på kort varsel, men kan gjøre det tyngre å holde fokus på noe som krever tett oppfølging over lang tid, som et stort prosjekt eller en avtale langt frem i tid. Denne friheten fra faste rammer preger både jobb og relasjoner: du trives best i roller med rom for å tenke underveis fremfor lange løp med faste milepæler, og en partner eller nære venner opplever deg gjerne som avslappet å være sammen med -- men også som noe mindre forutsigbar når det gjelder avtaler, så tydelighet om hva du faktisk kan love er ekstra nyttig.",
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
      synthesis:
        "Struktur kommer og går etter behov hos deg -- du lager gjerne en liste til det viktigste, men ikke til alt, og både følger og avviker fra en plan uten at det stresser deg nevneverdig. Det gjør deg tilpasningsdyktig i de fleste sammenhenger, men det er ikke alltid opplagt -- verken for deg selv eller andre -- hvor mye struktur en gitt oppgave faktisk krever. Denne vekslingen gjør deg til en fleksibel kollega som takler både stramt strukturerte og friere arbeidsformer omtrent like godt, og i nære relasjoner tilpasser du gjerne graden av planlegging etter hva situasjonen faktisk ber om, uten at det ene alltid dominerer.",
    },
    high: {
      overview:
        "Grundighet og sans for detaljer peker seg ut som tydelige trekk ved deg. Du fører lister, dobbeltsjekker arbeid før du leverer det, og lover sjelden noe du ikke faktisk følger opp -- pålitelighet kommer naturlig.",
      nuance:
        "Grundigheten din er en klar styrke når noe krever nøyaktighet, oppfølging, eller at andre skal kunne stole på deg over tid. Rask og uforutsigbar endring kan derimot kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt. Andre stoler gjerne på deg med ansvar på jobben; privat setter du innimellom strengere krav til deg selv enn situasjonen egentlig ber om.",
      reflection: "Er det situasjoner der behovet ditt for orden og kontroll gjør noe vanskeligere enn det egentlig trenger å være?",
      careerNote:
        "Roller som krever nøyaktighet, pålitelighet og evne til å fullføre over tid passer godt for deg. Vær samtidig oppmerksom på at høye krav til deg selv kan gjøre det vanskeligere å delegere, eller akseptere at noe er «godt nok».",
      relationshipNote:
        "En partner eller nære venner stoler gjerne på at du følger opp det du sier -- en styrke i nære relasjoner. Egne høye standarder kan likevel av og til smitte over på forventningene du har til dem.",
      synthesis:
        "Grundighet og sans for detaljer peker seg tydelig ut hos deg -- du dobbeltsjekker gjerne arbeid før du leverer det, og lover sjelden noe du ikke faktisk følger opp. Den påliteligheten er en klar styrke når noe krever nøyaktighet eller langsiktig oppfølging, men rask og uforutsigbar endring kan kreve at du bevisst gir deg selv -- og andre -- litt mer rom for at ting ikke går helt som planlagt. På jobben gjør denne påliteligheten at andre gjerne gir deg ansvar uten å måtte følge opp i detalj, og i nære relasjoner er det samme mønsteret en styrke -- en partner eller nære venner vet at du følger opp det du sier. Vær samtidig oppmerksom på at egne høye krav lett kan smitte over på forventningene du har til andre, både hjemme og på jobb.",
    },
  },
  extraversion: {
    low: {
      overview:
        "Ro og egen tid gir deg mer energi enn store forsamlinger av mennesker. Én-til-én-samtaler foretrekker du fremfor store selskaper, og du trenger tid alene for å lade opp etter en sosial dag.",
      nuance:
        "Preferansen for ro gir deg godt fokus og evne til dypere konsentrasjon, uten at du blir avledet av det som skjer rundt deg. Mye sosial energi over tid -- nettverksbygging, store arrangementer -- kan derimot kjennes tyngre å holde ut i enn for andre. Sosialt foretrekker du ofte et lite, fast vennenettverk fremfor mange bekjentskaper; på jobb presterer du best med færre avbrytelser og mer skjermet tid.",
      reflection: "Hvordan balanserer du behovet ditt for ro opp mot situasjoner der du faktisk må være sosial?",
      careerNote:
        "Roller med mer selvstendig arbeid, dybdefokus og færre avbrytelser passer godt for deg. Åpne kontorlandskap, eller jobber med mye uforutsigbar sosial kontakt, kan tappe mer energi enn de gir tilbake.",
      relationshipNote:
        "Du trives best med noen få nære relasjoner fremfor et stort nettverk. En partner som respekterer behovet ditt for egen tid, og venner som forstår at du trenger ro innimellom, passer deg som regel godt.",
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
    },
    high: {
      overview:
        "Du får energi av mennesker, og merker det tydelig når det skjer noe rundt deg. Det faller naturlig for deg å ta kontakt først, presentere deg for noen du ikke kjenner, eller foreslå at gruppen gjør noe sammen i stedet for å vente og se. Der andre nøler litt, er du ofte den som setter i gang samtalen eller aktiviteten.",
      nuance:
        "Den sosiale energien din smitter lett over på andre, og du blir ofte den som drar i gang driv og stemning i en gruppe. Baksiden er at det kan bli fristende å fylle kalenderen litt for mye. En helg uten planer, eller en uke med mest arbeid alene, kan kjennes tommere for deg enn for mange andre. Privat henter du overskudd gjennom folk rundt deg; på jobben bidrar du ofte til liv, fremdrift og engasjement i møter og prosjekter.",
      reflection: "Når merker du best forskjellen mellom sosial energi som gir deg overskudd, og sosial aktivitet som bare fyller tiden?",
      careerNote:
        "Arbeid der du får møte mennesker, samarbeide, påvirke eller formidle -- som salg, prosjektledelse eller kundekontakt -- gir deg ofte energi i stedet for å tappe deg. Dager med variasjon og jevnlig kontakt med andre passer deg bedre enn lange strekk med stillesittende arbeid alene.",
      relationshipNote:
        "Du trives som regel best når det skjer noe sammen med andre -- en middag med venner, en tur, en spontan plan. En partner som setter pris på, eller i det minste forstår, behovet ditt for et aktivt sosialt liv, passer deg godt. Venner og familie er ofte en viktig kilde til energi og gode opplevelser for deg.",
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
    },
    high: {
      overview:
        "Andres behov opptar en stor plass hos deg, og du finner ofte glede i å hjelpe. Du sier gjerne ja når noen ber om hjelp, selv når det koster deg noe, og velger heller å unngå konflikt enn å skape uenighet.",
      nuance:
        "Andre lener seg gjerne på deg som en varm, tillitsvekkende samarbeidspartner nettopp derfor. Å sette grenser kan derimot bli vanskeligere med det samme trekket, selv når det går ut over deg selv. Privat bruker du mye energi på å unngå at noen blir skuffet; på jobb tar du ofte på deg mer enn du burde for å hjelpe andre.",
      reflection: "Er det situasjoner der omtanken din for andre går tydelig på bekostning av dine egne behov?",
      careerNote:
        "Du er en verdsatt samarbeidspartner i team, men risikerer å ta på deg mer enn du burde for å hjelpe andre. Bevisst grensesetting på jobb kan derfor være ekstra viktig for deg.",
      relationshipNote:
        "En partner eller venner lener seg gjerne på deg som en varm og støttende person å ha rundt seg. Pass på at det ikke går på bekostning av dine egne behov i det lange løp.",
    },
  },
  stability: {
    low: {
      overview:
        "Bekymring, uro og humørsvingninger rammer deg noe hardere enn mange andre i perioder. Smått kan vokse seg stort i tankene dine, og humøret ditt kan svinge en del i løpet av én og samme dag.",
      nuance:
        "Følsomheten din betyr også at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger som andre overser. I stressende perioder er det ekstra viktig for deg å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned. Forutsigbarhet i relasjoner hjelper deg å kjenne deg trygg; på jobb kjennes press og tidsfrister ofte tyngre enn de ser ut til for andre.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
      careerNote:
        "Høyt tempo, stramme tidsfrister og mye uforutsigbarhet i jobben kan kjennes tyngre for deg enn for mange andre. Roller med noe mer forutsigbarhet, og støtte fra kolleger eller leder, kan gjøre stor forskjell.",
      relationshipNote:
        "Forutsigbarhet og tydelig kommunikasjon fra en partner og nære venner hjelper deg å kjenne deg trygg. Det kan være verdt å være åpen om hva som skaper uro for deg, slik at de rundt deg kan møte det.",
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
    },
    high: {
      overview:
        "Stress og motgang preller lettere av deg enn hos mange andre, selv når mye skjer samtidig. Andre kommer gjerne til deg når noe er vanskelig, fordi du sjelden virker overveldet, og kritikk tar sjelden tak i deg over lang tid.",
      nuance:
        "Roen din gjør deg til en stødig støtte for andre i krevende situasjoner, og gir deg selv ro til å tenke klart under press. Reell risiko og tidlige varselsignaler er derimot noe det samme trekket kan gjøre deg mindre oppmerksom på. Folk rundt deg må privat noen ganger si tydelig ifra før du fanger opp at noe er galt; på jobb er du gjerne den som holder hodet kaldt når andre stresser.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du naturlig tar ting med ro?",
      careerNote:
        "Du takler press og uforutsigbarhet bedre enn mange andre, noe som kan gjøre deg til en verdifull ressurs i krevende eller krisepregede roller. Vær samtidig oppmerksom på at det samme trekket kan gjøre deg mindre lydhør for tidlige varselsignaler.",
      relationshipNote:
        "Du er gjerne den stødige når en partner eller venner går gjennom noe vanskelig. Pass på at de som reagerer sterkere enn deg, ikke opplever at bekymringene deres blir avfeid.",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";

export interface ClosingSynthesis {
  career: string;
  relationships: string;
  personalDevelopment: string;
}

const CLOSING_FALLBACK: ClosingSynthesis = {
  career:
    "Profilen din er nokså jevn på tvers av de fem faktorene, uten noen sterkt fremtredende retning -- det gir gjerne fleksibilitet til å fungere godt i mange ulike typer roller, uten at én bestemt arbeidsform peker seg klart ut.",
  relationships:
    "Uten noen sterkt fremtredende faktor er det vanskelig å peke på ett bestemt relasjonsmønster hos deg -- du beveger deg trolig naturlig mellom flere ulike måter å møte andre på, avhengig av hvem du er sammen med og situasjonen du står i.",
  personalDevelopment:
    "Det kan være verdt å utforske alle fem faktorene noe likt videre, siden ingen av dem peker seg klart ut som mest fremtredende akkurat nå. Profilen din beskriver uansett tendenser på et gitt tidspunkt, ikke et endelig tak for hvem du kan bli.",
};

/**
 * Setter sammen en avsluttende oppsummering om jobb, relasjoner og personlig
 * utvikling -- lagt til v2.3 etter produkteiers ønske ("helt til slutt bør
 * det stå noe tekstlig om hva resultatet kan ha å si for jobb, relasjoner og
 * personlig utvikling"). Bygges av de 1-2 mest FREMTREDENDE faktorene (størst
 * avstand fra midtpunktet 50) sitt allerede skrevne careerNote/
 * relationshipNote/reflection -- ikke ny, uavhengig fritekst -- slik at
 * innholdet forblir forankret i faktisk gjennomgått og godkjent tekst.
 */
export function buildClosingSynthesis(factors: FactorResult[]): ClosingSynthesis {
  const sorted = [...factors].sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50));
  const primary = sorted[0];
  if (!primary) return CLOSING_FALLBACK;

  const primaryBand = bandFor(primary.score);
  if (primaryBand === "mid") return CLOSING_FALLBACK; // ingen faktor er tydelig nok til en meningsfull oppsummering

  const primaryCopy = INTERPRETATIONS[primary.factor][primaryBand];

  const secondary = sorted[1];
  const secondaryBand = secondary ? bandFor(secondary.score) : "mid";
  const secondaryCopy = secondary && secondaryBand !== "mid" ? INTERPRETATIONS[secondary.factor][secondaryBand] : null;

  const closingLine =
    "Ingen deler av profilen din er faste eller uforanderlige -- de beskriver tendenser nå, ikke et endelig tak for hvem du kan bli.";

  return {
    career: secondaryCopy ? `${primaryCopy.careerNote} ${secondaryCopy.careerNote}` : primaryCopy.careerNote,
    relationships: secondaryCopy
      ? `${primaryCopy.relationshipNote} ${secondaryCopy.relationshipNote}`
      : primaryCopy.relationshipNote,
    personalDevelopment: secondaryCopy
      ? `${primaryCopy.reflection} ${secondaryCopy.reflection} ${closingLine}`
      : `${primaryCopy.reflection} ${closingLine}`,
  };
}
