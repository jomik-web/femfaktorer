/**
 * Hverdagssituasjoner per fasett (v2.61, 04.08.2026).
 *
 * HVORFOR DETTE FINNES
 * Betatesteren beskrev Spirs svar som «lite konkrete» -- hun svarte på
 * prinsipielt nivå der hun burde vært spesifikk. «Dette kan tyde på at du
 * verdsetter struktur» er sant om omtrent alle med den skåren, og derfor
 * ikke verdt å lese.
 *
 * Samme tester leverte selv løsningen, i en liste som så tilfeldig ut:
 * «hva med uforutsette ting som ikke er liv og død -- fly som er innstilt,
 * kommer for sent, oppe på vidda uten mobildekning, trygghet rundt egen
 * presentasjon». Det er hverdagssituasjoner som gjør et abstrakt trekk
 * konkret. «Du skårer lavt på engstelse» sier lite; «hva skjer i deg når
 * flyet er innstilt?» kan man svare på.
 *
 * Det er samme mekanikk som gjør at man husker osten på lørdagspizzaen fra
 * «Sånn er du» og ikke tallet den illustrerte. Situasjonen bærer trekket.
 *
 * HVORDAN DE BRUKES
 * Spir får én situasjon herfra sammen med en spørsmålsvinkel (se
 * questionAngles.ts) og setter dem sammen til ett konkret spørsmål.
 * Situasjonen er råstoff, ikke ferdig tekst -- Spir skal formulere den inn i
 * sitt eget språk, ikke sitere den ordrett.
 *
 * SKRIVEREGLER, om du legger til flere:
 *  - Hverdagslig og gjenkjennelig. Ikke dramatisk, ikke «liv og død».
 *  - Nøytral. Situasjonen skal kunne besvares av både høy og lav skår uten
 *    at ordlyden antyder hva som er riktig svar.
 *  - Konkret nok til å se for seg. «Når du er stresset» er for vagt;
 *    «når du står i en kø som ikke beveger seg» er ikke.
 *  - Ingen bebreidelse. Situasjonen beskriver noe som skjer, ikke noe man
 *    gjør feil.
 */

/** Fire til seks situasjoner per fasett. Nøkkelen er IPIP-fasettkoden. */
export const FACET_SITUATIONS: Record<string, readonly string[]> = {
  // ---------- Nevrotisisme (vist som Emosjonell stabilitet) ----------
  N1: [
    "flyet er innstilt og køen foran skranken beveger seg ikke",
    "du oppdager at du er langt fra folk og uten mobildekning",
    "du venter på et svar som skulle kommet for lenge siden",
    "du skal si noe foran en forsamling du ikke kjenner",
    "du hører en lyd i huset om natten",
  ],
  N2: [
    "noen avbryter deg midt i noe du mener er viktig",
    "en avtale flyttes i siste liten, for tredje gang",
    "du blir avfeid av noen som tydelig ikke hører etter",
    "du står i en kasse-kø og den ved siden av går fortere",
    "noen tar æren for noe du gjorde",
  ],
  N3: [
    "du våkner uten at noe spesielt har skjedd, men dagen kjennes tung",
    "du gjør en tabbe foran folk du gjerne vil imponere",
    "en søndag ettermiddag når det ikke er noe som må gjøres",
    "du får en tilbakemelding som treffer et sted du visste var ømt",
  ],
  N4: [
    "du kommer inn i et rom der alle allerede snakker sammen",
    "du må be om hjelp fra noen du ikke kjenner",
    "du sier noe og merker at det ble stille etterpå",
    "du skal spise sammen med kolleger du ikke kjenner godt",
  ],
  N5: [
    "det står noe godt framme på kjøkkenbenken sent på kvelden",
    "du er sliten, og noe du har lyst på er ett klikk unna",
    "du har bestemt deg for å vente med noe, og så dukker anledningen opp",
    "du er ute med folk og runden kommer til deg igjen",
  ],
  N6: [
    "flere ting går galt samme dag, ingen av dem alvorlige",
    "du får en beskjed du ikke var forberedt på, midt i noe annet",
    "planen ryker og du må finne på noe nytt der og da",
    "du har for mye å gjøre og for lite tid, og noen spør om enda en ting",
  ],

  // ---------- Ekstroversjon ----------
  E1: [
    "du møter noen nye i en sammenheng der ingen kjenner hverandre",
    "en du så vidt kjenner setter seg ned ved siden av deg",
    "du skal ta kontakt med noen du gjerne vil bli kjent med",
    "noen forteller deg noe personlig ganske tidlig i bekjentskapet",
  ],
  E2: [
    "du får en invitasjon til noe der det blir mange folk",
    "en helg uten planer ligger foran deg",
    "du står i et selskap og kan velge mellom to samtaler",
    "noen foreslår å ta med flere på noe dere hadde planlagt to og to",
  ],
  E3: [
    "en gruppe skal bestemme noe og ingen tar ordet",
    "du er uenig med noen som har mer makt enn deg",
    "et møte sklir ut og noen må ta styringen",
    "noen spør hva du synes, foran flere andre",
  ],
  E4: [
    "en dag uten avtaler ligger foran deg",
    "du blir sittende og vente på noe i tjue minutter",
    "flere ting kunne vært gjort samtidig, og ingen haster",
    "noen foreslår å ta det litt med ro i dag",
  ],
  E5: [
    "noen foreslår noe du aldri har gjort før, med kort varsel",
    "du står øverst i en bakke som er brattere enn du trodde",
    "et valg mellom det trygge og det ukjente, og begge går an",
    "musikken settes høyere enn du hadde valgt selv",
  ],
  E6: [
    "noe uventet morsomt skjer midt i en alvorlig situasjon",
    "du forteller om noe som gikk galt for deg",
    "en helt vanlig tirsdag uten noe spesielt",
    "noen andre er tydelig nedfor, og du er ikke det",
  ],

  // ---------- Åpenhet ----------
  O1: [
    "du sitter på bussen uten telefon og har tjue minutter igjen",
    "du skal sovne, men tankene løper",
    "noen beskriver et sted du aldri har vært",
    "en helt vanlig oppgave som kunne vært løst på flere måter",
  ],
  O2: [
    "du går forbi noe vakkert på vei et sted du må rekke",
    "musikk du ikke kjenner spilles et sted du er",
    "noen viser deg noe de har laget selv",
    "en bygning eller et landskap får deg til å stoppe",
  ],
  O3: [
    "en film eller sang treffer deg sterkere enn du hadde ventet",
    "noen forteller deg noe vondt som har hendt dem",
    "du kjenner noe uten å helt kunne sette ord på hva",
    "et minne dukker opp uten at du hentet det fram",
  ],
  O4: [
    "menyen har både det du alltid tar og noe du aldri har smakt",
    "en ny rutine skal innføres på noe som fungerte fint fra før",
    "du har mulighet til å reise et sted du ikke kan språket",
    "noen foreslår å gjøre noe på en helt annen måte enn dere pleier",
  ],
  O5: [
    "en samtale glir over i noe abstrakt og prinsipielt",
    "du støter på en forklaring du ikke helt forstår",
    "noen påstår noe du mistenker er feil, men ikke vet",
    "du har tid til overs og kan lese hva du vil",
  ],

  // ---------- Medmenneskelighet ----------
  A1: [
    "noen du nettopp har møtt ber deg om en tjeneste",
    "en selger forklarer hvorfor nettopp dette er et godt tilbud",
    "noen forklarer hvorfor de kom for sent, og forklaringen er litt tynn",
    "du må overlate noe viktig til en annen",
  ],
  A2: [
    "du kunne fått noe du vil ha ved å utelate en detalj",
    "noen spør om noe der det sanne svaret er ubeleilig",
    "en regel står i veien for noe som ville vært lettere",
    "du oppdager at du har fått for mye igjen på veksel",
  ],
  A3: [
    "noen trenger hjelp akkurat når du har dårlig tid",
    "du ser at en kollega sliter uten å ha sagt noe",
    "en ny person står alene i et selskap",
    "noen spør om hjelp til noe du egentlig ikke har lyst til",
  ],
  A4: [
    "noen sier noe du er uenig i, foran andre",
    "en diskusjon holder på å bli en krangel",
    "du får kritikk du mener er urettferdig",
    "to du er glad i er uenige og begge vil ha deg med på laget",
  ],
  A5: [
    "noen roser deg for noe du faktisk var god på",
    "du kan nevne noe du har fått til, eller la være",
    "en samtale der alle forteller hva de driver med",
    "du kan mer om et tema enn de andre rundt bordet",
  ],
  A6: [
    "du går forbi noen som tydelig har det vanskelig",
    "en nyhetssak om folk som har mistet alt",
    "noen forteller om noe vondt de har vært gjennom",
    "en kollega gjør en tabbe som får følger for dem",
  ],

  // ---------- Planmessighet ----------
  C1: [
    "du får en oppgave du ikke har gjort noe lignende før",
    "noe går galt underveis og må løses der og da",
    "noen spør om du kan ta ansvar for noe stort",
    "du står fast og vet ikke helt hva neste steg er",
  ],
  C2: [
    "du kommer hjem til et kjøkken andre har brukt",
    "noen har flyttet på tingene dine",
    "du skal finne et dokument du la et sted for to uker siden",
    "koffertpakking kvelden før avreise",
  ],
  C3: [
    "du har lovet noe, og så dukker det opp noe bedre",
    "ingen ville oppdaget om du lot være",
    "en frist nærmer seg på noe ingen har spurt om",
    "du har sagt ja til noe du nå angrer på",
  ],
  C4: [
    "noe er godt nok, men kunne blitt bedre med to timer til",
    "du sammenligner det du har gjort med det andre har gjort",
    "en oppgave uten noen som følger med på resultatet",
    "du får til noe du har jobbet lenge med",
  ],
  C5: [
    "noe du har utsatt ligger og venter, og du har tid nå",
    "du skal begynne på noe kjedelig som må gjøres",
    "midt i en oppgave dukker det opp noe mer fristende",
    "du har satt deg et mål som ingen andre vet om",
  ],
  C6: [
    "et tilbud som går ut i kveld",
    "du kan svare med en gang eller sove på det",
    "noen venter på et svar mens du fortsatt tenker",
    "en avgjørelse der du har nok informasjon til å velge, men ikke all",
  ],
};

/** Trygg oppslagsfunksjon -- tom liste hvis fasetten mangler. */
export function situationsFor(facetCode: string): readonly string[] {
  return FACET_SITUATIONS[facetCode] ?? [];
}
