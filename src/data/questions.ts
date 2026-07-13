/**
 * De 120 spørsmålene i FemFaktorer, jf. Dokument 03 (Teststruktur, skåring
 * og resultatformidling) og beslutningen om full IPIP-NEO-120-utvidelse
 * (v0.4/v2.0 -- se endringslogg i Grunnlagsdokumentet og Dokument 06).
 *
 * Kilder (begge offentlig tilgjengelig, public domain, ingen lisenskrav):
 *  - Item-tekst og fasettnøkkel: IPIP sin offisielle NEO-fasettnøkkel
 *    (https://ipip.ori.org/newNEOFacetsKey.htm).
 *  - Faktisk itemvalg og rekkefølge i Johnsons IPIP-NEO-120: kryssjekket mot
 *    den offentlig publiserte 120-spørsmål-listen (Johnson, 2014, via OSF/
 *    NeuroQuestAi sin åpne datakatalog).
 *
 * VIKTIG -- O6 (Liberalism) er UTELATT. Fasetten er i IPIP utelukkende
 * operasjonalisert gjennom politiske/religiøse påstander (f.eks. stemmegiving
 * for liberale/konservative kandidater) -- dette er særlig kategori
 * persondata under GDPR art. 9. Beslutningen ble tatt allerede i den
 * opprinnelige 30-spørsmål-versjonen (se Dokument 03 §7/§20.1) og videreføres
 * her. For å beholde 120 spørsmål totalt er O6 sine 4 posisjoner erstattet
 * med fire ekstra spørsmål fordelt på O1, O2, O3 og O5 (hentet fra IPIP sin
 * bredere, offentlige spørsmålsbank for samme fasetter -- se
 * `compensatesForO6: true`-feltet under). Alle fem domener ender dermed på
 * nøyaktig 24 spørsmål hver (120 totalt).
 *
 * KORREKSJON FRA v1-UTKAST: Den opprinnelige 30-spørsmål-versjonen brukte for
 * fire fasetter (A2, A4, A5, C6) et positivt formulert item hentet fra IPIP
 * sin bredere pool, fordi Johnsons faktiske 120-utvalg for akkurat disse
 * fire fasettene utelukkende består av reverserte (negativt formulerte)
 * item. For å faktisk matche det ekte IPIP-NEO-120-instrumentet (bruker sitt
 * uttrykte ønske, se prosjektlogg) er disse fire nå rettet til Johnsons
 * egentlige item, med `reverse: true` satt korrekt. Skåringsmotoren støtter
 * dette som en generell, testet regel -- se scoring.ts.
 *
 * Norsk tekst er en første arbeidsoversettelse og skal språklig
 * kvalitetssikres før publisering (se Grunnlagsdokumentet §11).
 *
 * TO-TRINNS TEST: De første 50 spørsmålene (order 1-50) gir et foreløpig
 * resultat for de fem hovedfaktorene (10 spørsmål per domene). Alle 120
 * (24 per domene) gir et mer presist resultat og låser opp Spir. Se
 * `FREE_TIER_LENGTH` og testflyten i src/app/test/page.tsx.
 */

export type Domain = "N" | "E" | "O" | "A" | "C";

export interface Question {
  /** Stabil id -- brukes i lokal lagring. Skal ALDRI gjenbrukes/endres etter publisering. */
  id: string;
  /** IPIP-fasettkode, f.eks. "N1" (Anxiety). */
  facet: string;
  facetName: string;
  domain: Domain;
  textEn: string;
  textNo: string;
  reverse: boolean;
  /** Posisjon 1-120 -- avgjør hva som havner i de første 50 (gratis) spørsmålene. */
  order: number;
  /** Sant for de fire itemene som erstatter det utelatte O6 (se filhode). */
  compensatesForO6?: boolean;
}

export const FREE_TIER_LENGTH = 50;

export const ALL_QUESTIONS: readonly Question[] = [
  // ---- Runde 1 (order 1-30): ett item per fasett ----
  { id: "n1_1", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Worry about things.", textNo: "Bekymrer meg for ting.", reverse: false, order: 1 },
  { id: "e1_1", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Make friends easily.", textNo: "Får lett venner.", reverse: false, order: 2 },
  { id: "o1_1", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Have a vivid imagination.", textNo: "Har en levende fantasi.", reverse: false, order: 3 },
  { id: "a1_1", facet: "A1", facetName: "Trust", domain: "A", textEn: "Trust others.", textNo: "Stoler på andre.", reverse: false, order: 4 },
  { id: "c1_1", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Complete tasks successfully.", textNo: "Fullfører oppgaver på en god måte.", reverse: false, order: 5 },
  { id: "n2_1", facet: "N2", facetName: "Anger", domain: "N", textEn: "Get angry easily.", textNo: "Blir lett sint.", reverse: false, order: 6 },
  { id: "e2_1", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Love large parties.", textNo: "Elsker store fester.", reverse: false, order: 7 },
  { id: "o2_1", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Believe in the importance of art.", textNo: "Mener kunst er viktig.", reverse: false, order: 8 },
  { id: "a2_1", facet: "A2", facetName: "Morality", domain: "A", textEn: "Use others for my own ends.", textNo: "Bruker andre for å oppnå egne mål.", reverse: true, order: 9 },
  { id: "c2_1", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Like to tidy up.", textNo: "Liker å rydde.", reverse: false, order: 10 },
  { id: "n3_1", facet: "N3", facetName: "Depression", domain: "N", textEn: "Often feel blue.", textNo: "Føler meg ofte nedfor.", reverse: false, order: 11 },
  { id: "e3_1", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Take charge.", textNo: "Tar lederskap.", reverse: false, order: 12 },
  { id: "o3_1", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Experience my emotions intensely.", textNo: "Opplever følelsene mine sterkt.", reverse: false, order: 13 },
  { id: "a3_1", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Love to help others.", textNo: "Liker godt å hjelpe andre.", reverse: false, order: 14 },
  { id: "c3_1", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Keep my promises.", textNo: "Holder løftene mine.", reverse: false, order: 15 },
  { id: "n4_1", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Find it difficult to approach others.", textNo: "Synes det er vanskelig å ta kontakt med andre.", reverse: false, order: 16 },
  { id: "e4_1", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Am always busy.", textNo: "Er alltid opptatt med noe.", reverse: false, order: 17 },
  { id: "o4_1", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Prefer variety to routine.", textNo: "Foretrekker variasjon fremfor rutine.", reverse: false, order: 18 },
  { id: "a4_1", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Love a good fight.", textNo: "Elsker en god krangel.", reverse: true, order: 19 },
  { id: "c4_1", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Work hard.", textNo: "Jobber hardt.", reverse: false, order: 20 },
  { id: "n5_1", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Go on binges.", textNo: "Overdriver lett når jeg først setter i gang.", reverse: false, order: 21 },
  { id: "e5_1", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Love excitement.", textNo: "Elsker spenning.", reverse: false, order: 22 },
  { id: "o5_1", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Love to read challenging material.", textNo: "Liker å lese krevende stoff.", reverse: false, order: 23 },
  { id: "a5_1", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Believe that I am better than others.", textNo: "Tror jeg er bedre enn andre.", reverse: true, order: 24 },
  { id: "c5_1", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Am always prepared.", textNo: "Er alltid forberedt.", reverse: false, order: 25 },
  { id: "n6_1", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Panic easily.", textNo: "Får lett panikk.", reverse: false, order: 26 },
  { id: "e6_1", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Radiate joy.", textNo: "Utstråler glede.", reverse: false, order: 27 },
  { id: "o1_comp", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Spend time reflecting on things.", textNo: "Bruker tid på å reflektere over ting.", reverse: false, order: 28, compensatesForO6: true },
  { id: "a6_1", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Sympathize with the homeless.", textNo: "Føler medynk med hjemløse.", reverse: false, order: 29 },
  { id: "c6_1", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Jump into things without thinking.", textNo: "Kaster meg ut i ting uten å tenke meg om.", reverse: true, order: 30 },

  // ---- Runde 2 (order 31-50 er fortsatt del av gratisversjonen) ----
  { id: "n1_2", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Fear for the worst.", textNo: "Frykter det verste.", reverse: false, order: 31 },
  { id: "e1_2", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Feel comfortable around people.", textNo: "Føler meg komfortabel blant folk.", reverse: false, order: 32 },
  { id: "o1_2", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Enjoy wild flights of fantasy.", textNo: "Liker å fantasere fritt.", reverse: false, order: 33 },
  { id: "a1_2", facet: "A1", facetName: "Trust", domain: "A", textEn: "Believe that others have good intentions.", textNo: "Tror at andre har gode hensikter.", reverse: false, order: 34 },
  { id: "c1_2", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Excel in what I do.", textNo: "Utmerker meg i det jeg gjør.", reverse: false, order: 35 },
  { id: "n2_2", facet: "N2", facetName: "Anger", domain: "N", textEn: "Get irritated easily.", textNo: "Blir lett irritert.", reverse: false, order: 36 },
  { id: "e2_2", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Talk to a lot of different people at parties.", textNo: "Snakker med mange forskjellige folk i selskaper.", reverse: false, order: 37 },
  { id: "o2_2", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "See beauty in things that others might not notice.", textNo: "Legger merke til skjønnhet andre kan overse.", reverse: false, order: 38 },
  { id: "a2_2", facet: "A2", facetName: "Morality", domain: "A", textEn: "Cheat to get ahead.", textNo: "Jukser for å komme seg frem.", reverse: true, order: 39 },
  { id: "c2_2", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Often forget to put things back in their proper place.", textNo: "Glemmer ofte å legge ting tilbake på plass.", reverse: true, order: 40 },
  { id: "n3_2", facet: "N3", facetName: "Depression", domain: "N", textEn: "Dislike myself.", textNo: "Liker ikke meg selv.", reverse: false, order: 41 },
  { id: "e3_2", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Try to lead others.", textNo: "Forsøker å lede andre.", reverse: false, order: 42 },
  { id: "o3_2", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Feel others' emotions.", textNo: "Kjenner på andres følelser.", reverse: false, order: 43 },
  { id: "a3_2", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Am concerned about others.", textNo: "Bryr meg om andre.", reverse: false, order: 44 },
  { id: "c3_2", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Tell the truth.", textNo: "Snakker sant.", reverse: false, order: 45 },
  { id: "n4_2", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am afraid to draw attention to myself.", textNo: "Er redd for å trekke oppmerksomhet mot meg selv.", reverse: false, order: 46 },
  { id: "e4_2", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Am always on the go.", textNo: "Er alltid i farta.", reverse: false, order: 47 },
  { id: "o4_2", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Prefer to stick with things that I know.", textNo: "Foretrekker å holde meg til det jeg kjenner.", reverse: true, order: 48 },
  { id: "a4_2", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Yell at people.", textNo: "Roper til folk.", reverse: true, order: 49 },
  { id: "c4_2", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Do more than what's expected of me.", textNo: "Gjør mer enn det som forventes av meg.", reverse: false, order: 50 },

  // ---- Runde 2 fortsetter (order 51-60) -- del av full test (51-120) ----
  { id: "n5_2", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Rarely overindulge.", textNo: "Overdriver sjelden.", reverse: true, order: 51 },
  { id: "e5_2", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Seek adventure.", textNo: "Søker eventyr.", reverse: false, order: 52 },
  { id: "o5_2", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Avoid philosophical discussions.", textNo: "Unngår filosofiske diskusjoner.", reverse: true, order: 53 },
  { id: "a5_2", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Think highly of myself.", textNo: "Har høye tanker om meg selv.", reverse: true, order: 54 },
  { id: "c5_2", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Carry out my plans.", textNo: "Gjennomfører planene mine.", reverse: false, order: 55 },
  { id: "n6_2", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Become overwhelmed by events.", textNo: "Blir lett overveldet av det som skjer.", reverse: false, order: 56 },
  { id: "e6_2", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Have a lot of fun.", textNo: "Har det gøy.", reverse: false, order: 57 },
  { id: "o2_comp", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Enjoy the beauty of nature.", textNo: "Setter pris på naturens skjønnhet.", reverse: false, order: 58, compensatesForO6: true },
  { id: "a6_2", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Feel sympathy for those who are worse off than myself.", textNo: "Føler sympati for de som har det verre enn meg selv.", reverse: false, order: 59 },
  { id: "c6_2", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Make rash decisions.", textNo: "Tar forhastede beslutninger.", reverse: true, order: 60 },

  // ---- Runde 3 (order 61-90) ----
  { id: "n1_3", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Am afraid of many things.", textNo: "Er redd for mange ting.", reverse: false, order: 61 },
  { id: "e1_3", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Avoid contacts with others.", textNo: "Unngår kontakt med andre.", reverse: true, order: 62 },
  { id: "o1_3", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Love to daydream.", textNo: "Elsker å dagdrømme.", reverse: false, order: 63 },
  { id: "a1_3", facet: "A1", facetName: "Trust", domain: "A", textEn: "Trust what people say.", textNo: "Stoler på det folk sier.", reverse: false, order: 64 },
  { id: "c1_3", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Handle tasks smoothly.", textNo: "Håndterer oppgaver uten problemer.", reverse: false, order: 65 },
  { id: "n2_3", facet: "N2", facetName: "Anger", domain: "N", textEn: "Lose my temper.", textNo: "Mister besinnelsen lett.", reverse: false, order: 66 },
  { id: "e2_3", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Prefer to be alone.", textNo: "Foretrekker å være alene.", reverse: true, order: 67 },
  { id: "o2_3", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Do not like poetry.", textNo: "Liker ikke poesi.", reverse: true, order: 68 },
  { id: "a2_3", facet: "A2", facetName: "Morality", domain: "A", textEn: "Take advantage of others.", textNo: "Utnytter andre.", reverse: true, order: 69 },
  { id: "c2_3", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Leave a mess in my room.", textNo: "Etterlater rot på rommet mitt.", reverse: true, order: 70 },
  { id: "n3_3", facet: "N3", facetName: "Depression", domain: "N", textEn: "Am often down in the dumps.", textNo: "Er ofte nedfor.", reverse: false, order: 71 },
  { id: "e3_3", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Take control of things.", textNo: "Tar kontroll over ting.", reverse: false, order: 72 },
  { id: "o3_3", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Rarely notice my emotional reactions.", textNo: "Legger sjelden merke til egne følelsesmessige reaksjoner.", reverse: true, order: 73 },
  { id: "a3_3", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Am indifferent to the feelings of others.", textNo: "Er likegyldig til andres følelser.", reverse: true, order: 74 },
  { id: "c3_3", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Break rules.", textNo: "Bryter regler.", reverse: true, order: 75 },
  { id: "n4_3", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Only feel comfortable with friends.", textNo: "Føler meg bare komfortabel sammen med venner.", reverse: false, order: 76 },
  { id: "e4_3", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Do a lot in my spare time.", textNo: "Gjør mye på fritiden.", reverse: false, order: 77 },
  { id: "o4_3", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Dislike changes.", textNo: "Liker ikke endringer.", reverse: true, order: 78 },
  { id: "a4_3", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Insult people.", textNo: "Fornærmer folk.", reverse: true, order: 79 },
  { id: "c4_3", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Do just enough work to get by.", textNo: "Gjør akkurat nok til å komme gjennom.", reverse: true, order: 80 },
  { id: "n5_3", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Easily resist temptations.", textNo: "Motstår fristelser lett.", reverse: true, order: 81 },
  { id: "e5_3", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Enjoy being reckless.", textNo: "Liker å være vågal.", reverse: false, order: 82 },
  { id: "o5_3", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Have difficulty understanding abstract ideas.", textNo: "Har vanskelig for å forstå abstrakte ideer.", reverse: true, order: 83 },
  { id: "a5_3", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Have a high opinion of myself.", textNo: "Har en høy oppfatning av meg selv.", reverse: true, order: 84 },
  { id: "c5_3", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Waste my time.", textNo: "Kaster bort tiden min.", reverse: true, order: 85 },
  { id: "n6_3", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Feel that I'm unable to deal with things.", textNo: "Føler at jeg ikke klarer å håndtere ting.", reverse: false, order: 86 },
  { id: "e6_3", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Love life.", textNo: "Elsker livet.", reverse: false, order: 87 },
  { id: "o3_comp", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Try to understand myself.", textNo: "Prøver å forstå meg selv.", reverse: false, order: 88, compensatesForO6: true },
  { id: "a6_3", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Am not interested in other people's problems.", textNo: "Er ikke interessert i andres problemer.", reverse: true, order: 89 },
  { id: "c6_3", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Rush into things.", textNo: "Kaster meg over ting i full fart.", reverse: true, order: 90 },

  // ---- Runde 4 (order 91-120) ----
  { id: "n1_4", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Get stressed out easily.", textNo: "Blir lett stresset.", reverse: false, order: 91 },
  { id: "e1_4", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Keep others at a distance.", textNo: "Holder andre på avstand.", reverse: true, order: 92 },
  { id: "o1_4", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Like to get lost in thought.", textNo: "Liker å forsvinne inn i egne tanker.", reverse: false, order: 93 },
  { id: "a1_4", facet: "A1", facetName: "Trust", domain: "A", textEn: "Distrust people.", textNo: "Mistror folk.", reverse: true, order: 94 },
  { id: "c1_4", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Know how to get things done.", textNo: "Vet hvordan jeg får ting gjort.", reverse: false, order: 95 },
  { id: "n2_4", facet: "N2", facetName: "Anger", domain: "N", textEn: "Am not easily annoyed.", textNo: "Blir ikke lett irritert.", reverse: true, order: 96 },
  { id: "e2_4", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Avoid crowds.", textNo: "Unngår folkemengder.", reverse: true, order: 97 },
  { id: "o2_4", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Do not enjoy going to art museums.", textNo: "Liker ikke å gå på kunstmuseer.", reverse: true, order: 98 },
  { id: "a2_4", facet: "A2", facetName: "Morality", domain: "A", textEn: "Obstruct others' plans.", textNo: "Saboterer andres planer.", reverse: true, order: 99 },
  { id: "c2_4", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Leave my belongings around.", textNo: "Lar tingene mine ligge og flyte.", reverse: true, order: 100 },
  { id: "n3_4", facet: "N3", facetName: "Depression", domain: "N", textEn: "Feel comfortable with myself.", textNo: "Er komfortabel med meg selv.", reverse: true, order: 101 },
  { id: "e3_4", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Wait for others to lead the way.", textNo: "Venter på at andre skal vise vei.", reverse: true, order: 102 },
  { id: "o3_4", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Don't understand people who get emotional.", textNo: "Forstår ikke folk som blir følelsesladde.", reverse: true, order: 103 },
  { id: "a3_4", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Take no time for others.", textNo: "Tar meg ikke tid til andre.", reverse: true, order: 104 },
  { id: "c3_4", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Break my promises.", textNo: "Bryter løftene mine.", reverse: true, order: 105 },
  { id: "n4_4", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am not bothered by difficult social situations.", textNo: "Blir ikke satt ut av vanskelige sosiale situasjoner.", reverse: true, order: 106 },
  { id: "e4_4", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Like to take it easy.", textNo: "Liker å ta det med ro.", reverse: true, order: 107 },
  { id: "o4_4", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Am attached to conventional ways.", textNo: "Er glad i tradisjonelle måter å gjøre ting på.", reverse: true, order: 108 },
  { id: "a4_4", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Get back at others.", textNo: "Tar igjen overfor andre.", reverse: true, order: 109 },
  { id: "c4_4", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Put little time and effort into my work.", textNo: "Legger lite tid og innsats i arbeidet mitt.", reverse: true, order: 110 },
  { id: "n5_4", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Am able to control my cravings.", textNo: "Klarer å kontrollere sug og fristelser.", reverse: true, order: 111 },
  { id: "e5_4", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Act wild and crazy.", textNo: "Kan finne på ville og gale ting.", reverse: false, order: 112 },
  { id: "o5_4", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Am not interested in theoretical discussions.", textNo: "Er ikke interessert i teoretiske diskusjoner.", reverse: true, order: 113 },
  { id: "a5_4", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Boast about my virtues.", textNo: "Skryter av mine gode egenskaper.", reverse: true, order: 114 },
  { id: "c5_4", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Have difficulty starting tasks.", textNo: "Har vanskelig for å komme i gang med oppgaver.", reverse: true, order: 115 },
  { id: "n6_4", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Remain calm under pressure.", textNo: "Holder meg rolig under press.", reverse: true, order: 116 },
  { id: "e6_4", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Look at the bright side of life.", textNo: "Ser lyst på livet.", reverse: false, order: 117 },
  { id: "o5_comp", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Enjoy thinking about things.", textNo: "Liker å tenke grundig gjennom ting.", reverse: false, order: 118, compensatesForO6: true },
  { id: "a6_4", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Try not to think about the needy.", textNo: "Prøver å ikke tenke på de som har det vanskelig.", reverse: true, order: 119 },
  { id: "c6_4", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Act without thinking.", textNo: "Handler uten å tenke.", reverse: true, order: 120 },
] as const;

/** De første 50 (order 1-50) -- det gratis, foreløpige resultatet. */
export const FREE_QUESTIONS: readonly Question[] = ALL_QUESTIONS.filter(
  (q) => q.order <= FREE_TIER_LENGTH
);

// Vaktpost mot at noen ved et uhell endrer listen uten å holde riktig struktur
// (Dokument 09 §10.3): 5 domener x 24 spørsmål = 120, og de første 50 skal gi
// nøyaktig 10 spørsmål per domene (jevn dekning av alle fem hovedfaktorer).
const EXPECTED_TOTAL = 120;
const EXPECTED_PER_DOMAIN_FULL = 24;
const EXPECTED_PER_DOMAIN_FREE = 10;

export function assertQuestionSetIntegrity(): void {
  if (ALL_QUESTIONS.length !== EXPECTED_TOTAL) {
    throw new Error(`Forventet ${EXPECTED_TOTAL} spørsmål totalt, fant ${ALL_QUESTIONS.length}.`);
  }
  const fullCounts: Record<Domain, number> = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const freeCounts: Record<Domain, number> = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();

  for (const q of ALL_QUESTIONS) {
    if (seenIds.has(q.id)) throw new Error(`Duplikat spørsmåls-id: ${q.id}`);
    seenIds.add(q.id);
    if (seenOrders.has(q.order)) throw new Error(`Duplikat order-verdi: ${q.order}`);
    seenOrders.add(q.order);
    fullCounts[q.domain]++;
    if (q.order <= FREE_TIER_LENGTH) freeCounts[q.domain]++;
  }

  for (const domain of Object.keys(fullCounts) as Domain[]) {
    if (fullCounts[domain] !== EXPECTED_PER_DOMAIN_FULL) {
      throw new Error(
        `Spørsmålsintegritet brutt: domene ${domain} har ${fullCounts[domain]} spørsmål totalt, forventet ${EXPECTED_PER_DOMAIN_FULL}.`
      );
    }
    if (freeCounts[domain] !== EXPECTED_PER_DOMAIN_FREE) {
      throw new Error(
        `Spørsmålsintegritet brutt: domene ${domain} har ${freeCounts[domain]} spørsmål i gratisversjonen, forventet ${EXPECTED_PER_DOMAIN_FREE}.`
      );
    }
  }
}
