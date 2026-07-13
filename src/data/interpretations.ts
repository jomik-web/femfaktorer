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
 */

import type { DisplayFactor } from "@/lib/scoring";

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
}

type Copy = Record<DisplayFactor, Record<Band, Interpretation>>;

export const INTERPRETATIONS: Copy = {
  openness: {
    low: {
      overview:
        "Resultatet ditt trekker mot det konkrete og velprøvde. I praksis kan det bety at du foretrekker metoder som allerede har vist seg å fungere, gjerne holder deg til kjente rutiner når du er på ferie, og sjelden bruker mye tid på kunst eller teori bare for teoriens skyld. Det uprøvde og abstrakte tiltrekker deg med andre ord sjeldnere enn det gjør for mange andre.",
      nuance:
        "Denne forankringen i det kjente kan gjøre deg praktisk, jordnær og forutsigbar å samarbeide med -- andre vet gjerne hvor de har deg. Samtidig kan situasjoner som krever en helt ny tilnærming, som et prosjekt uten fasit eller en uvant omstilling, kreve en bevisst innsats fra din side for å legge vante løsninger til side. På jobben er du som regel den som får ting unnagjort fremfor å utforske alternativer først; i relasjoner setter du gjerne stabilitet høyere enn spenning.",
      reflection: "Er det områder i livet ditt der litt mer nysgjerrighet kunne åpnet en dør du ellers går forbi?",
      careerNote:
        "Lav åpenhet for erfaring, som hos deg, betyr ofte at definerte oppgaver og velprøvde metoder passer godt -- roller med tydelige rammer, som drift, forvaltning eller fagområder med etablert praksis, kan kjennes trygge og oversiktlige. Skal du inn i mer nyskapende roller, kan det være til hjelp å bevisst trene på å tåle usikkerhet i en periode.",
      relationshipNote:
        "I en kjæreste- eller samboerrelasjon setter du gjerne pris på faste rammer og et rolig tempo -- en partner som deler eller respekterer det, matcher deg som regel godt. Blant venner er det ofte de faste, langvarige vennskapene du verdsetter mest, fremfor stadig nye bekjentskaper.",
    },
    mid: {
      overview:
        "Du beveger deg naturlig mellom det kjente og det nye. Byr en anledning seg, prøver du gjerne noe nytt, uten at du aktivt søker det uprøvde hele tiden -- verken fast bundet til rutiner eller rastløst på jakt etter noe annet.",
      nuance:
        "Denne evnen til å bevege deg mellom det kjente og det nye gjør deg som regel tilpasningsdyktig, uansett hvilken sammenheng du havner i. Det kan likevel være vanskelig å kjenne etter, i øyeblikket, om du egentlig lengter etter noe nytt eller bare er vant til å tenke at du burde. Privat varierer interessene dine gjerne med hvem du er sammen med, mens du i jobbsammenheng takler både rutinepregede og kreative oppgaver noenlunde likt.",
      reflection: "I hvilke situasjoner merker du at nysgjerrigheten din faktisk slår inn -- og hva er annerledes da?",
      careerNote:
        "Du takler trolig både strukturerte oppgaver og mer utforskende arbeidsformer rimelig greit, og kan derfor passe inn i mange typer roller -- fra jobber med faste rammer til oppgaver som krever en viss nytenkning.",
      relationshipNote:
        "Sammen med en partner beveger du deg naturlig mellom det kjente og det nye, og tilpasser deg gjerne den andres behov for stabilitet eller variasjon underveis.",
    },
    high: {
      overview:
        "Nye ideer, inntrykk og perspektiver tiltrekker deg tydelig. I praksis vises det gjerne som interesse for kunst, ideer eller steder du ikke kjenner fra før, og som en vane med å stille spørsmål ved det andre tar for gitt -- det uprøvde er sjelden noe du unngår.",
      nuance:
        "Denne nysgjerrigheten kan gjøre deg kreativ og en pådriver når noe faktisk trenger å tenkes nytt. Ren gjentakelse og stor forutsigbarhet er derimot situasjoner der den samme trangen til det nye lett kan oppleves som utålmodighet, både for deg selv og for andre rundt deg. På jobben er det gjerne du som foreslår en annen løsning enn den vante.",
      reflection: "Hvordan bruker du nysgjerrigheten din i hverdagen -- og er det ting du kunne tenke deg å utforske mer av?",
      careerNote:
        "Roller som gir rom for nytenkning, utforsking eller kreativt arbeid passer ofte godt for deg. Sterkt rutinepregede stillinger kan over tid oppleves som lite stimulerende, siden trangen til å utforske noe nytt gjerne melder seg uansett hvor du er.",
      relationshipNote:
        "I en kjæreste- eller samboerrelasjon fungerer det som regel best med en partner som tåler, eller helst deler, interessen din for det nye og uprøvde -- trygghet handler nok mer om felles utforsking for deg enn om fast forutsigbarhet. Blant venner trekkes du gjerne mot dem som byr på nye perspektiver.",
    },
  },
  conscientiousness: {
    low: {
      overview:
        "Planer og faste rutiner styrer ikke hverdagen din i særlig grad -- du tar gjerne ting som de kommer. Utsettelse til noe faktisk haster, improvisasjon fremfor faste planer, og et skrivebord som gjerne ser litt rotete ut, er kjente mønstre for deg.",
      nuance:
        "Denne friheten fra faste rammer kan gjøre deg god til å improvisere og til å tilpasse deg når planer endrer seg brått. Krever noe derimot tett oppfølging over lang tid, som et prosjekt med mange detaljer eller en avtale langt frem i tid, kan litt mer bevisst struktur være til god hjelp. Hjemme kan andre oppleve deg som avslappet der de selv ville planlagt; på jobb trives du nok best med korte, fleksible oppgaver fremfor lange løp med faste milepæler.",
      reflection: "Er det noen bestemte områder der litt mer forhåndsplanlegging ville gjort hverdagen lettere for deg?",
      careerNote:
        "Roller med stor grad av frihet og variasjon passer ofte bedre for deg enn stillinger som krever tett, langsiktig oppfølging av detaljer. Ekstern struktur, som sjekklister eller faste rutiner satt av andre, kan være god støtte i oppgaver der presisjon er avgjørende.",
      relationshipNote:
        "En partner eller nære venner kan oppleve deg som avslappet og fleksibel å være sammen med, men også som noe mindre forutsigbar når det gjelder avtaler og oppfølging. Tydelig kommunikasjon om hva du faktisk kan love, er nok ekstra nyttig i nære relasjoner.",
    },
    mid: {
      overview:
        "Struktur later til å komme og gå etter behov hos deg -- verken fast rutine eller mangel på den dominerer. Lister lager du kanskje til det viktigste, men ikke til alt, og du både følger og avviker fra en plan uten at det stresser deg nevneverdig.",
      nuance:
        "Denne vekslingen mellom struktur og frihet gjør deg som regel tilpasningsdyktig -- verken rigid eller planløs. Utfordringen kan være at det ikke alltid er opplagt, verken for deg selv eller andre, hvor mye struktur en gitt oppgave faktisk krever. I team er du fleksibel nok til å jobbe godt med både svært strukturerte og svært frie kolleger.",
      reflection: "Når merker du at planlegging faktisk hjelper deg -- og når føles den bare som en ekstra byrde?",
      careerNote:
        "Du takler trolig både strukturerte oppgaver og mer frie arbeidsformer -- evnen til å justere hvor mye system du legger på en oppgave kan være en styrke i roller som varierer mye fra dag til dag.",
      relationshipNote:
        "Du tilpasser graden av planlegging etter hva situasjonen og relasjonen krever, uten at det ene alltid dominerer overfor en partner eller nære venner.",
    },
    high: {
      overview:
        "Grundighet og sans for detaljer peker seg ut som tydelige trekk ved deg. Du fører gjerne lister, dobbeltsjekker arbeid før du leverer det, og lover sjelden noe du ikke faktisk følger opp -- pålitelighet later til å komme naturlig.",
      nuance:
        "Denne grundigheten er ofte en klar styrke når noe krever nøyaktighet, oppfølging eller at andre skal kunne stole på deg over tid. Rask og uforutsigbar endring kan derimot kreve at du bevisst gir deg selv, og andre, litt mer rom for at ting ikke går helt som planlagt. Andre stoler nok gjerne på deg med ansvar på jobben; privat setter du innimellom strengere krav til deg selv enn situasjonen egentlig ber om.",
      reflection: "Er det situasjoner der behovet ditt for orden og kontroll gjør noe vanskeligere enn det egentlig trenger å være?",
      careerNote:
        "Roller som krever nøyaktighet, pålitelighet og evne til å fullføre over tid passer ofte godt for deg. Vær samtidig oppmerksom på at høye krav til deg selv kan gjøre det vanskeligere å delegere eller akseptere at noe er «godt nok».",
      relationshipNote:
        "En partner eller nære venner stoler nok gjerne på at du følger opp det du sier -- en styrke i nære relasjoner. Egne høye standarder kan likevel av og til smitte over på forventningene du har til dem.",
    },
  },
  extraversion: {
    low: {
      overview:
        "Ro og egen tid gir deg som regel mer energi enn store forsamlinger av mennesker. Én-til-én-samtaler foretrekker du nok fremfor store selskaper, og du trenger tid alene for å lade opp etter mye sosialt.",
      nuance:
        "Denne preferansen for ro gir deg gjerne godt fokus og evne til dypere konsentrasjon, uten at du blir avledet av det som skjer rundt deg. Mye sosial energi over tid, som nettverksbygging eller store arrangementer, kan derimot kjennes tyngre å holde ut i enn for andre. Sosialt foretrekker du ofte et lite, fast vennenettverk fremfor mange bekjentskaper; på jobb presterer du nok best med færre avbrytelser og mer skjermet tid.",
      reflection: "Hvordan balanserer du behovet ditt for ro opp mot situasjoner der du faktisk må være sosial?",
      careerNote:
        "Roller med mer selvstendig arbeid, dybdefokus og færre avbrytelser passer ofte godt for deg. Åpne kontorlandskap eller jobber med mye uforutsigbar sosial kontakt kan tappe mer energi enn de gir tilbake.",
      relationshipNote:
        "Du trives nok best med noen få nære relasjoner fremfor et stort nettverk. En partner som respekterer behovet ditt for egen tid, og venner som forstår at du trenger ro innimellom, passer deg som regel godt.",
    },
    mid: {
      overview:
        "Sosialt selskap og egen tid deler plassen ganske jevnt i livet ditt, uten at det ene klart dominerer. Du blir gjerne med på sosiale ting, men setter også pris på en kveld helt alene uten at det føles som noe savn.",
      nuance:
        "Denne vekslingen mellom sosialt og alene gjør deg som regel fleksibel, uansett hvilken sosial situasjon du havner i. Noen ganger kan det likevel være vanskelig å legge merke til, i øyeblikket, om det egentlig er ro eller selskap du trenger mest. Energien din varierer nok en del fra dag til dag privat, mens du på jobb fungerer godt både i team og med selvstendig arbeid.",
      reflection: "Hva kjennetegner dagene der du kjenner at du har fått nok av begge deler -- sosialt og ro?",
      careerNote:
        "Du fungerer trolig godt både i team og med selvstendig arbeid, og kan derfor tilpasse deg ulike arbeidsmiljøer uten at det ene tapper deg mer enn det andre.",
      relationshipNote:
        "Sosial energi varierer nok fra dag til dag for deg, og du finner som regel selv en rimelig balanse mellom samvær med partner og venner, og egen tid.",
    },
    high: {
      overview:
        "Andre mennesker er som regel en tydelig energikilde for deg, og du finner deg ofte midt i det som skjer. Du tar kontakt lett, liker å være der ting foregår, og er ofte den som drar i gang en samtale eller et initiativ.",
      nuance:
        "Dette engasjementet gjør deg gjerne utadvendt og god til å skape energi rundt deg. Stillhet, tålmodighet og lange perioder alene kan derimot gjøre det vanskeligere for deg å roe helt ned. Privat trenger du nok jevnlig sosial kontakt for å kjenne deg på topp; på jobben blir du gjerne en naturlig pådriver i møter og team.",
      reflection: "Gir du deg selv nok rom for ro, eller søker du sosial energi også når kroppen egentlig trenger en pause?",
      careerNote:
        "Roller med mye menneskelig kontakt, som salg, ledelse eller formidling, gir deg ofte energi fremfor å tappe deg. Rene, stillegående kontoroppgaver over lang tid kan derimot kjennes mer krevende å holde ut i.",
      relationshipNote:
        "Du trenger nok jevnlig sosial kontakt for å kjenne deg på topp. En partner som deler eller i alle fall tåler et høyt sosialt tempo, og et bredt vennenettverk, passer deg som regel godt.",
    },
  },
  agreeableness: {
    low: {
      overview:
        "Egne vurderinger veier tungt hos deg, også når de støter mot det andre mener. Du sier gjerne tydelig fra når du er uenig, forhandler hardt når det trengs, og lar ikke automatisk andres meninger veie tyngst.",
      nuance:
        "Denne tydeligheten kan gjøre deg god til å sette grenser og stå støtt i konflikt når det faktisk er nødvendig. Tett samarbeid kan derimot dra nytte av at du bevisst løfter frem den andre partens perspektiv, selv når du er trygg på ditt eget. Beslutninger andre ikke våger å stille spørsmål ved, er gjerne noe du utfordrer på jobben.",
      reflection: "Er det relasjoner der litt mer imøtekommenhet kunne styrket samarbeidet, uten at du gir opp det som er viktig for deg?",
      careerNote:
        "Roller som krever tøffe forhandlinger, tydelige beslutninger eller å stå alene i uenighet, kan passe godt for deg. I team med mye samarbeid kan det være nyttig å bevisst løfte frem andres perspektiv, selv når du er trygg på ditt eget.",
      relationshipNote:
        "Du setter grenser tydelig overfor en partner eller venner, noe som kan være en styrke. Nære relasjoner kan likevel av og til trenge at du bevisst viser fram at du bryr deg, ikke bare at du har rett.",
    },
    mid: {
      overview:
        "Egne og andres behov teller omtrent likt for deg, avhengig av situasjonen du står i. Du gir deg kanskje i en diskusjon den ene dagen og holder på ditt den neste, uten noe fast mønster.",
      nuance:
        "Denne jevne vektingen gjør deg som regel til en forutsigbar og rettferdig samarbeidspartner. Utfordringen kan være å legge merke til, der og da, når du egentlig burde sette deg selv først -- eller omvendt. På jobb tilpasser du gjerne samarbeidsstilen din etter hvem du jobber med.",
      reflection: "Når merker du at du gir mest av deg selv -- og når holder du mest igjen?",
      careerNote:
        "Du tilpasser samarbeidsstilen din etter hvem du jobber med, og fungerer derfor rimelig godt i de fleste team -- verken for ettergivende eller for konfronterende.",
      relationshipNote:
        "Du gir og tar omtrent i lik grad i relasjoner, avhengig av situasjonen -- en balansert stil som en partner eller venner trolig opplever som rimelig.",
    },
    high: {
      overview:
        "Andres behov opptar en stor plass hos deg, og du finner ofte glede i å hjelpe. Du sier gjerne ja når noen ber om hjelp, selv når det koster deg noe, og unngår helst konflikt fremfor å skape uenighet.",
      nuance:
        "Andre lener seg gjerne på deg som en varm, tillitsvekkende samarbeidspartner nettopp derfor. Å sette grenser kan derimot bli vanskeligere med det samme trekket, selv når det går ut over deg selv. Privat bruker du nok mye energi på å unngå at noen blir skuffet; på jobb tar du kanskje på deg mer enn du burde for å hjelpe andre.",
      reflection: "Er det situasjoner der omtanken din for andre går tydelig på bekostning av dine egne behov?",
      careerNote:
        "Du er nok en verdsatt samarbeidspartner i team, men risikerer å ta på deg mer enn du burde for å hjelpe andre. Bevisst grensesetting på jobb kan derfor være ekstra viktig for deg.",
      relationshipNote:
        "En partner eller venner lener seg nok gjerne på deg som en varm og støttende person å ha rundt seg. Pass på at det ikke går på bekostning av dine egne behov i det lange løp.",
    },
  },
  stability: {
    low: {
      overview:
        "Bekymring, uro og humørsvingninger kan ramme deg noe hardere enn mange andre i perioder. Smått kan vokse seg stort i tankene dine, og humøret ditt kan svinge en del i løpet av en dag.",
      nuance:
        "Denne følsomheten kan også bety at du er følelsesmessig oppmerksom, og legger merke til nyanser i stemninger som andre overser. I stressende perioder er det ekstra viktig for deg å ha noen faste holdepunkter -- rutiner, mennesker eller steder -- som hjelper deg å roe deg selv ned. Mer forutsigbarhet i relasjoner hjelper deg nok å kjenne deg trygg; på jobb kjennes press og tidsfrister ofte tyngre enn de kanskje ser ut til for andre.",
      reflection: "Hva pleier å hjelpe deg mest når bekymringer eller uro tar overhånd?",
      careerNote:
        "Høyt tempo, stramme tidsfrister og mye uforutsigbarhet i jobben kan kjennes tyngre for deg enn for mange andre. Roller med noe mer forutsigbarhet, og støtte fra kolleger eller leder, kan gjøre stor forskjell.",
      relationshipNote:
        "Forutsigbarhet og tydelig kommunikasjon fra en partner og nære venner hjelper deg nok å kjenne deg trygg. Det kan være verdt å være åpen om hva som skaper uro for deg, slik at de rundt deg kan møte det.",
    },
    mid: {
      overview:
        "Livets opp- og nedturer håndteres med en ganske jevn linje hos deg. Du blir litt stresset eller nedfor når noe faktisk er krevende, men uten at det tar overhånd eller varer unødvendig lenge.",
      nuance:
        "Denne jevne linjen kan gi deg en solid, stabil grunnmur å møte hverdagen fra. Er flere ting krevende samtidig, eller varer presset lenge, kan det likevel være nyttig å ha noen faste rutiner å støtte deg på. Du er som regel den rolige i konflikter privat, uten at det betyr at ingenting berører deg.",
      reflection: "Hvilke situasjoner er det som best tester roen din -- og hva skjer i deg da?",
      careerNote:
        "Du tåler et visst arbeidspress uten at det går nevneverdig utover deg, men flere krevende ting samtidig kan likevel kjennes tyngre. Faste rutiner på jobb kan være en nyttig støtte i travle perioder.",
      relationshipNote:
        "Du er som regel den nokså rolige i opp- og nedturer sammen med en partner eller venner, uten at det betyr at ingenting berører deg.",
    },
    high: {
      overview:
        "Stress og motgang ser ut til å prelle noe lettere av deg enn hos mange andre, selv når mye skjer samtidig. Andre kommer gjerne til deg når noe er vanskelig, fordi du sjelden virker overveldet, og kritikk tar sjelden tak i deg over lang tid.",
      nuance:
        "Denne roen kan gjøre deg til en stødig støtte for andre i krevende situasjoner, og gi deg selv ro til å tenke klart under press. Reell risiko og tidlige varselsignaler er derimot noe det samme trekket kan gjøre deg mindre oppmerksom på. Folk rundt deg må privat noen ganger si tydelig ifra før du fanger opp at noe er galt; på jobb er du gjerne den som holder hodet kaldt når andre stresser.",
      reflection: "Er det signaler fra deg selv eller andre du noen ganger overser fordi du naturlig tar ting med ro?",
      careerNote:
        "Du takler press og uforutsigbarhet bedre enn mange andre, noe som kan gjøre deg til en verdifull ressurs i krevende eller krisepregede roller. Vær samtidig oppmerksom på at det samme trekket kan gjøre deg mindre lydhør for tidlige varselsignaler.",
      relationshipNote:
        "Du er nok gjerne den stødige når en partner eller venner går gjennom noe vanskelig. Pass på at de som reagerer sterkere enn deg, ikke opplever at bekymringene deres blir avfeid.",
    },
  },
};

export const NON_DIAGNOSTIC_NOTICE =
  "Dette er ikke en diagnose eller en fasit på hvem du er. Resultatet viser tendenser på et gitt tidspunkt, tolket i lys av offentlig tilgjengelig forskning på femfaktormodellen -- ikke en klinisk vurdering.";
