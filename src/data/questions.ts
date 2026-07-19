/**
 * De 120 spørsmålene i Dine Fasetter, jf. Dokument 03 (Teststruktur, skåring
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

/**
 * UTVIDET SPØRSMÅLSSETT (v2.10, tredje testtrapp -- "utvidet versjon") --
 * UNDER OVERSETTELSE, IKKE FERDIG. Kilde: samme kanoniske IPIP-liste som
 * resten av spørsmålene (ipip.ori.org/newNEOFacetsKey.htm, hentet og
 * kryssjekket 14.07.2026 -- alle 120 eksisterende spørsmål stemte nøyaktig
 * med denne kilden). Hver fasett har 10 spørsmål totalt der; de 6 (eller 5
 * for O1/O2/O3/O5, som allerede har 5 pga. O6-kompensasjon) som IKKE finnes
 * i ALL_QUESTIONS legges til her, domene for domene, til produkteier har
 * sett gjennom hver oversettelse. O6 holdes fortsatt utenfor (se filhode).
 * Målet er 29 fasetter x 10 = 290 spørsmål
 * totalt (ALL_QUESTIONS + dette settet), IKKE 300 -- se beslutning
 * 14.07.2026: å fylle Åpenhet-domenet opp til 60 ville krevd en mindre
 * verifiserbar IPIP-kilde, og ble bevisst valgt bort.
 *
 * STATUS PER DOMENE: alle fem domener (N, E, O, A, C) -- utkast klart,
 * kryssjekket mot IPIP-kilden og oversatt 14.07.2026. Til sammen 170 nye
 * spørsmål (36+36+26+36+36), som sammen med de 120 eksisterende gir 290.
 *
 * TIER-INTEGRASJON FULLFØRT (v2.11, 14.07.2026): "extended" er nå et gyldig
 * ResultTier (se scoring.ts), koblet inn i hele testflyten (test/page.tsx:
 * nytt sjekkpunkt etter 120, tilbyr "Utvidet versjon"), resultatvisningen
 * (resultat/page.tsx, delt visning med "full" via `isDetailed`), Spir
 * (spir/page.tsx, bruker riktig spørsmålssett/tier), kontolagring
 * (StoredAccountResult har nå `tier`, vises ved gjeninnlogging), PDF-
 * nedlasting (samme knapp som "full") og en egen, separat normtall-pott
 * (lib/stats/blobs.ts) siden 10 item/fasett gir mer pålitelige skårer enn
 * 4-5 og ikke bør blandes med full-testens pott.
 */
export const EXTENDED_QUESTIONS_N: readonly Question[] = [
  { id: "n1_5", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Get caught up in my problems.", textNo: "Blir lett oppslukt av egne problemer.", reverse: false, order: 121 },
  { id: "n1_6", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Am not easily bothered by things.", textNo: "Lar meg ikke lett stresse av ting.", reverse: true, order: 122 },
  { id: "n1_7", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Am relaxed most of the time.", textNo: "Er avslappet det meste av tiden.", reverse: true, order: 123 },
  { id: "n1_8", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Am not easily disturbed by events.", textNo: "Lar meg ikke lett forstyrre av det som skjer.", reverse: true, order: 124 },
  { id: "n1_9", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Don't worry about things that have already happened.", textNo: "Bekymrer meg ikke for ting som allerede har skjedd.", reverse: true, order: 125 },
  { id: "n1_10", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Adapt easily to new situations.", textNo: "Tilpasser meg lett nye situasjoner.", reverse: true, order: 126 },

  { id: "n2_5", facet: "N2", facetName: "Anger", domain: "N", textEn: "Get upset easily.", textNo: "Blir lett opprørt.", reverse: false, order: 127 },
  { id: "n2_6", facet: "N2", facetName: "Anger", domain: "N", textEn: "Am often in a bad mood.", textNo: "Er ofte i dårlig humør.", reverse: false, order: 128 },
  { id: "n2_7", facet: "N2", facetName: "Anger", domain: "N", textEn: "Rarely get irritated.", textNo: "Blir sjelden irritert.", reverse: true, order: 129 },
  { id: "n2_8", facet: "N2", facetName: "Anger", domain: "N", textEn: "Seldom get mad.", textNo: "Blir sjelden sint.", reverse: true, order: 130 },
  { id: "n2_9", facet: "N2", facetName: "Anger", domain: "N", textEn: "Keep my cool.", textNo: "Holder hodet kaldt.", reverse: true, order: 131 },
  { id: "n2_10", facet: "N2", facetName: "Anger", domain: "N", textEn: "Rarely complain.", textNo: "Klager sjelden.", reverse: true, order: 132 },

  { id: "n3_5", facet: "N3", facetName: "Depression", domain: "N", textEn: "Have a low opinion of myself.", textNo: "Har en dårlig oppfatning av meg selv.", reverse: false, order: 133 },
  { id: "n3_6", facet: "N3", facetName: "Depression", domain: "N", textEn: "Have frequent mood swings.", textNo: "Har hyppige humørsvingninger.", reverse: false, order: 134 },
  { id: "n3_7", facet: "N3", facetName: "Depression", domain: "N", textEn: "Feel desperate.", textNo: "Føler meg fortvilet.", reverse: false, order: 135 },
  { id: "n3_8", facet: "N3", facetName: "Depression", domain: "N", textEn: "Feel that my life lacks direction.", textNo: "Føler at livet mitt mangler retning.", reverse: false, order: 136 },
  { id: "n3_9", facet: "N3", facetName: "Depression", domain: "N", textEn: "Seldom feel blue.", textNo: "Føler meg sjelden nedfor.", reverse: true, order: 137 },
  { id: "n3_10", facet: "N3", facetName: "Depression", domain: "N", textEn: "Am very pleased with myself.", textNo: "Er godt fornøyd med meg selv.", reverse: true, order: 138 },

  { id: "n4_5", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am easily intimidated.", textNo: "Lar meg lett skremme.", reverse: false, order: 139 },
  { id: "n4_6", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am afraid that I will do the wrong thing.", textNo: "Er redd for å gjøre det gale.", reverse: false, order: 140 },
  { id: "n4_7", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Stumble over my words.", textNo: "Snubler i ordene mine.", reverse: false, order: 141 },
  { id: "n4_8", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am not embarrassed easily.", textNo: "Blir ikke lett flau.", reverse: true, order: 142 },
  { id: "n4_9", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am comfortable in unfamiliar situations.", textNo: "Er komfortabel i ukjente situasjoner.", reverse: true, order: 143 },
  { id: "n4_10", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am able to stand up for myself.", textNo: "Klarer å stå opp for meg selv.", reverse: true, order: 144 },

  { id: "n5_5", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Often eat too much.", textNo: "Spiser ofte for mye.", reverse: false, order: 145 },
  { id: "n5_6", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Don't know why I do some of the things I do.", textNo: "Skjønner ikke alltid hvorfor jeg gjør enkelte ting.", reverse: false, order: 146 },
  { id: "n5_7", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Do things I later regret.", textNo: "Gjør ting jeg angrer på senere.", reverse: false, order: 147 },
  { id: "n5_8", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Love to eat.", textNo: "Elsker å spise.", reverse: false, order: 148 },
  { id: "n5_9", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Never spend more than I can afford.", textNo: "Bruker aldri mer penger enn jeg har råd til.", reverse: true, order: 149 },
  { id: "n5_10", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Never splurge.", textNo: "Unner meg aldri overdrevent luksus.", reverse: true, order: 150 },

  { id: "n6_5", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Can't make up my mind.", textNo: "Klarer ikke å bestemme meg.", reverse: false, order: 151 },
  { id: "n6_6", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Get overwhelmed by emotions.", textNo: "Blir overveldet av følelser.", reverse: false, order: 152 },
  { id: "n6_7", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Can handle complex problems.", textNo: "Takler kompliserte problemer godt.", reverse: true, order: 153 },
  { id: "n6_8", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Know how to cope.", textNo: "Vet hvordan jeg skal takle ting.", reverse: true, order: 154 },
  { id: "n6_9", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Readily overcome setbacks.", textNo: "Kommer lett over tilbakeslag.", reverse: true, order: 155 },
  { id: "n6_10", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Am calm even in tense situations.", textNo: "Er rolig selv i anspente situasjoner.", reverse: true, order: 156 },
] as const;

export const EXTENDED_QUESTIONS_E: readonly Question[] = [
  { id: "e1_5", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Warm up quickly to others.", textNo: "Åpner meg raskt for nye mennesker.", reverse: false, order: 157 },
  { id: "e1_6", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Act comfortably with others.", textNo: "Opptrer avslappet sammen med andre.", reverse: false, order: 158 },
  { id: "e1_7", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Cheer people up.", textNo: "Får andre i bedre humør.", reverse: false, order: 159 },
  { id: "e1_8", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Am hard to get to know.", textNo: "Er vanskelig å bli kjent med.", reverse: true, order: 160 },
  { id: "e1_9", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Often feel uncomfortable around others.", textNo: "Føler meg ofte utilpass sammen med andre.", reverse: true, order: 161 },
  { id: "e1_10", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Am not really interested in others.", textNo: "Er egentlig ikke så interessert i andre.", reverse: true, order: 162 },

  { id: "e2_5", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Enjoy being part of a group.", textNo: "Trives med å være del av en gruppe.", reverse: false, order: 163 },
  { id: "e2_6", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Involve others in what I am doing.", textNo: "Involverer gjerne andre i det jeg holder på med.", reverse: false, order: 164 },
  { id: "e2_7", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Love surprise parties.", textNo: "Elsker overraskelsesfester.", reverse: false, order: 165 },
  { id: "e2_8", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Want to be left alone.", textNo: "Vil helst være i fred.", reverse: true, order: 166 },
  { id: "e2_9", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Don't like crowded events.", textNo: "Liker ikke folkemengder.", reverse: true, order: 167 },
  { id: "e2_10", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Seek quiet.", textNo: "Søker ro.", reverse: true, order: 168 },

  { id: "e3_5", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Can talk others into doing things.", textNo: "Klarer å overtale andre til å gjøre ting.", reverse: false, order: 169 },
  { id: "e3_6", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Seek to influence others.", textNo: "Søker å påvirke andre.", reverse: false, order: 170 },
  { id: "e3_7", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Keep in the background.", textNo: "Holder meg gjerne i bakgrunnen.", reverse: true, order: 171 },
  { id: "e3_8", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Have little to say.", textNo: "Har lite å si.", reverse: true, order: 172 },
  { id: "e3_9", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Don't like to draw attention to myself.", textNo: "Liker ikke å trekke oppmerksomhet mot meg selv.", reverse: true, order: 173 },
  { id: "e3_10", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Hold back my opinions.", textNo: "Holder tilbake egne meninger.", reverse: true, order: 174 },

  { id: "e4_5", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Can manage many things at the same time.", textNo: "Klarer å håndtere mange ting samtidig.", reverse: false, order: 175 },
  { id: "e4_6", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "React quickly.", textNo: "Reagerer raskt.", reverse: false, order: 176 },
  { id: "e4_7", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Like to take my time.", textNo: "Liker å ta meg god tid.", reverse: true, order: 177 },
  { id: "e4_8", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Like a leisurely lifestyle.", textNo: "Trives med et rolig levesett.", reverse: true, order: 178 },
  { id: "e4_9", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Let things proceed at their own pace.", textNo: "Lar ting ta den tiden de trenger.", reverse: true, order: 179 },
  { id: "e4_10", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "React slowly.", textNo: "Reagerer sakte.", reverse: true, order: 180 },

  { id: "e5_5", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Love action.", textNo: "Elsker spenning og action.", reverse: false, order: 181 },
  { id: "e5_6", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Enjoy being part of a loud crowd.", textNo: "Trives i høylytte folkemengder.", reverse: false, order: 182 },
  { id: "e5_7", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Am willing to try anything once.", textNo: "Er villig til å prøve hva som helst én gang.", reverse: false, order: 183 },
  { id: "e5_8", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Seek danger.", textNo: "Søker fare.", reverse: false, order: 184 },
  { id: "e5_9", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Would never go hang gliding or bungee jumping.", textNo: "Ville aldri prøvd hanggliding eller strikkhopp.", reverse: true, order: 185 },
  { id: "e5_10", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Dislike loud music.", textNo: "Liker ikke høy musikk.", reverse: true, order: 186 },

  { id: "e6_5", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Express childlike joy.", textNo: "Uttrykker barnlig glede.", reverse: false, order: 187 },
  { id: "e6_6", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Laugh my way through life.", textNo: "Ler meg gjennom livet.", reverse: false, order: 188 },
  { id: "e6_7", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Laugh aloud.", textNo: "Ler høyt.", reverse: false, order: 189 },
  { id: "e6_8", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Amuse my friends.", textNo: "Underholder gjerne vennene mine.", reverse: false, order: 190 },
  { id: "e6_9", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Am not easily amused.", textNo: "Blir ikke lett underholdt.", reverse: true, order: 191 },
  { id: "e6_10", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Seldom joke around.", textNo: "Tuller sjelden.", reverse: true, order: 192 },
] as const;

export const EXTENDED_QUESTIONS_O: readonly Question[] = [
  { id: "o1_6", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Indulge in my fantasies.", textNo: "Dveler gjerne ved egne fantasier.", reverse: false, order: 193 },
  { id: "o1_7", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Seldom daydream.", textNo: "Dagdrømmer sjelden.", reverse: true, order: 194 },
  { id: "o1_8", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Do not have a good imagination.", textNo: "Har ikke en spesielt god fantasi.", reverse: true, order: 195 },
  { id: "o1_9", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Seldom get lost in thought.", textNo: "Blir sjelden oppslukt av egne tanker.", reverse: true, order: 196 },
  { id: "o1_10", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Have difficulty imagining things.", textNo: "Har vanskelig for å forestille meg ting.", reverse: true, order: 197 },

  { id: "o2_6", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Like music.", textNo: "Liker musikk.", reverse: false, order: 198 },
  { id: "o2_7", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Love flowers.", textNo: "Elsker blomster.", reverse: false, order: 199 },
  { id: "o2_8", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Do not like art.", textNo: "Liker ikke kunst.", reverse: true, order: 200 },
  { id: "o2_9", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Do not like concerts.", textNo: "Liker ikke konserter.", reverse: true, order: 201 },
  { id: "o2_10", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Do not enjoy watching dance performances.", textNo: "Liker ikke å se danseforestillinger.", reverse: true, order: 202 },

  { id: "o3_6", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Am passionate about causes.", textNo: "Engasjerer meg sterkt i saker jeg bryr meg om.", reverse: false, order: 203 },
  { id: "o3_7", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Enjoy examining myself and my life.", textNo: "Liker å utforske meg selv og livet mitt.", reverse: false, order: 204 },
  { id: "o3_8", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Seldom get emotional.", textNo: "Blir sjelden følelsesladet.", reverse: true, order: 205 },
  { id: "o3_9", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Am not easily affected by my emotions.", textNo: "Lar meg ikke lett påvirke av egne følelser.", reverse: true, order: 206 },
  { id: "o3_10", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Experience very few emotional highs and lows.", textNo: "Har svært få følelsesmessige opp- og nedturer.", reverse: true, order: 207 },

  { id: "o4_5", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Like to visit new places.", textNo: "Liker å besøke nye steder.", reverse: false, order: 208 },
  { id: "o4_6", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Am interested in many things.", textNo: "Er interessert i mange ting.", reverse: false, order: 209 },
  { id: "o4_7", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Like to begin new things.", textNo: "Liker å starte på nye ting.", reverse: false, order: 210 },
  { id: "o4_8", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Don't like the idea of change.", textNo: "Liker ikke tanken på forandring.", reverse: true, order: 211 },
  { id: "o4_9", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Am a creature of habit.", textNo: "Er et vanemenneske.", reverse: true, order: 212 },
  { id: "o4_10", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Dislike new foods.", textNo: "Liker ikke ny mat.", reverse: true, order: 213 },

  { id: "o5_6", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Like to solve complex problems.", textNo: "Liker å løse kompliserte problemer.", reverse: false, order: 214 },
  { id: "o5_7", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Have a rich vocabulary.", textNo: "Har et rikt ordforråd.", reverse: false, order: 215 },
  { id: "o5_8", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Can handle a lot of information.", textNo: "Klarer å håndtere mye informasjon.", reverse: false, order: 216 },
  { id: "o5_9", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Am not interested in abstract ideas.", textNo: "Er ikke interessert i abstrakte ideer.", reverse: true, order: 217 },
  { id: "o5_10", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Avoid difficult reading material.", textNo: "Unngår krevende lesestoff.", reverse: true, order: 218 },
] as const;

export const EXTENDED_QUESTIONS_A: readonly Question[] = [
  { id: "a1_5", facet: "A1", facetName: "Trust", domain: "A", textEn: "Believe that people are basically moral.", textNo: "Tror folk grunnleggende sett er moralske.", reverse: false, order: 219 },
  { id: "a1_6", facet: "A1", facetName: "Trust", domain: "A", textEn: "Believe in human goodness.", textNo: "Tror på det gode i mennesket.", reverse: false, order: 220 },
  { id: "a1_7", facet: "A1", facetName: "Trust", domain: "A", textEn: "Think that all will be well.", textNo: "Tror som regel at alt ordner seg.", reverse: false, order: 221 },
  { id: "a1_8", facet: "A1", facetName: "Trust", domain: "A", textEn: "Suspect hidden motives in others.", textNo: "Mistenker ofte andre for skjulte motiver.", reverse: true, order: 222 },
  { id: "a1_9", facet: "A1", facetName: "Trust", domain: "A", textEn: "Am wary of others.", textNo: "Er på vakt overfor andre.", reverse: true, order: 223 },
  { id: "a1_10", facet: "A1", facetName: "Trust", domain: "A", textEn: "Believe that people are essentially evil.", textNo: "Tror grunnleggende sett at folk er onde.", reverse: true, order: 224 },

  { id: "a2_5", facet: "A2", facetName: "Morality", domain: "A", textEn: "Would never cheat on my taxes.", textNo: "Ville aldri jukset med skatten.", reverse: false, order: 225 },
  { id: "a2_6", facet: "A2", facetName: "Morality", domain: "A", textEn: "Stick to the rules.", textNo: "Holder meg til reglene.", reverse: false, order: 226 },
  { id: "a2_7", facet: "A2", facetName: "Morality", domain: "A", textEn: "Use flattery to get ahead.", textNo: "Bruker smiger for å komme meg frem.", reverse: true, order: 227 },
  { id: "a2_8", facet: "A2", facetName: "Morality", domain: "A", textEn: "Know how to get around the rules.", textNo: "Vet hvordan jeg kan omgå reglene.", reverse: true, order: 228 },
  { id: "a2_9", facet: "A2", facetName: "Morality", domain: "A", textEn: "Put people under pressure.", textNo: "Legger press på andre.", reverse: true, order: 229 },
  { id: "a2_10", facet: "A2", facetName: "Morality", domain: "A", textEn: "Pretend to be concerned for others.", textNo: "Later som jeg bryr meg om andre.", reverse: true, order: 230 },

  { id: "a3_5", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Make people feel welcome.", textNo: "Får andre til å føle seg velkomne.", reverse: false, order: 231 },
  { id: "a3_6", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Anticipate the needs of others.", textNo: "Ser andres behov før de sier ifra.", reverse: false, order: 232 },
  { id: "a3_7", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Have a good word for everyone.", textNo: "Har et godt ord å si om alle.", reverse: false, order: 233 },
  { id: "a3_8", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Look down on others.", textNo: "Ser ned på andre.", reverse: true, order: 234 },
  { id: "a3_9", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Make people feel uncomfortable.", textNo: "Får andre til å føle seg utilpass.", reverse: true, order: 235 },
  { id: "a3_10", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Turn my back on others.", textNo: "Snur ryggen til andre.", reverse: true, order: 236 },

  { id: "a4_5", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Am easy to satisfy.", textNo: "Er lett å tilfredsstille.", reverse: false, order: 237 },
  { id: "a4_6", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Can't stand confrontations.", textNo: "Tåler ikke konfrontasjoner.", reverse: false, order: 238 },
  { id: "a4_7", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Hate to seem pushy.", textNo: "Hater å virke pågående.", reverse: false, order: 239 },
  { id: "a4_8", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Have a sharp tongue.", textNo: "Har en skarp tunge.", reverse: true, order: 240 },
  { id: "a4_9", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Contradict others.", textNo: "Motsier andre.", reverse: true, order: 241 },
  { id: "a4_10", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Hold a grudge.", textNo: "Bærer nag.", reverse: true, order: 242 },

  { id: "a5_5", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Dislike being the center of attention.", textNo: "Liker ikke å være midtpunktet.", reverse: false, order: 243 },
  { id: "a5_6", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Dislike talking about myself.", textNo: "Liker ikke å snakke om meg selv.", reverse: false, order: 244 },
  { id: "a5_7", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Consider myself an average person.", textNo: "Anser meg selv som ganske gjennomsnittlig.", reverse: false, order: 245 },
  { id: "a5_8", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Seldom toot my own horn.", textNo: "Skryter sjelden av meg selv.", reverse: false, order: 246 },
  { id: "a5_9", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Know the answers to many questions.", textNo: "Vet svaret på mange spørsmål.", reverse: true, order: 247 },
  { id: "a5_10", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Make myself the center of attention.", textNo: "Gjør meg selv til midtpunktet.", reverse: true, order: 248 },

  { id: "a6_5", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Value cooperation over competition.", textNo: "Verdsetter samarbeid høyere enn konkurranse.", reverse: false, order: 249 },
  { id: "a6_6", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Suffer from others' sorrows.", textNo: "Kjenner andres sorger på kroppen.", reverse: false, order: 250 },
  { id: "a6_7", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Tend to dislike soft-hearted people.", textNo: "Liker som regel ikke bløthjertede mennesker.", reverse: true, order: 251 },
  { id: "a6_8", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Believe in an eye for an eye.", textNo: "Tror på øye for øye.", reverse: true, order: 252 },
  { id: "a6_9", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Believe people should fend for themselves.", textNo: "Mener folk bør klare seg selv.", reverse: true, order: 253 },
  { id: "a6_10", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Can't stand weak people.", textNo: "Tåler ikke svake mennesker.", reverse: true, order: 254 },
] as const;

export const EXTENDED_QUESTIONS_C: readonly Question[] = [
  { id: "c1_5", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Am sure of my ground.", textNo: "Er trygg i det jeg gjør.", reverse: false, order: 255 },
  { id: "c1_6", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Come up with good solutions.", textNo: "Kommer opp med gode løsninger.", reverse: false, order: 256 },
  { id: "c1_7", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Misjudge situations.", textNo: "Feilvurderer situasjoner.", reverse: true, order: 257 },
  { id: "c1_8", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Don't understand things.", textNo: "Forstår ikke alltid ting.", reverse: true, order: 258 },
  { id: "c1_9", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Have little to contribute.", textNo: "Har lite å bidra med.", reverse: true, order: 259 },
  { id: "c1_10", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Don't see the consequences of things.", textNo: "Ser ikke alltid konsekvensene av ting.", reverse: true, order: 260 },

  { id: "c2_5", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Like order.", textNo: "Liker orden.", reverse: false, order: 261 },
  { id: "c2_6", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Want everything to be \"just right.\"", textNo: "Vil at alt skal være akkurat riktig.", reverse: false, order: 262 },
  { id: "c2_7", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Love order and regularity.", textNo: "Elsker orden og faste rutiner.", reverse: false, order: 263 },
  { id: "c2_8", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Do things according to a plan.", textNo: "Gjør ting etter en plan.", reverse: false, order: 264 },
  { id: "c2_9", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Am not bothered by messy people.", textNo: "Bryr meg ikke om rotete mennesker.", reverse: true, order: 265 },
  { id: "c2_10", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Am not bothered by disorder.", textNo: "Bryr meg ikke om uorden.", reverse: true, order: 266 },

  { id: "c3_5", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Try to follow the rules.", textNo: "Prøver å følge reglene.", reverse: false, order: 267 },
  { id: "c3_6", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Pay my bills on time.", textNo: "Betaler regningene i tide.", reverse: false, order: 268 },
  { id: "c3_7", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Listen to my conscience.", textNo: "Følger samvittigheten min.", reverse: false, order: 269 },
  { id: "c3_8", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Get others to do my duties.", textNo: "Får andre til å gjøre pliktene mine.", reverse: true, order: 270 },
  { id: "c3_9", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Do the opposite of what is asked.", textNo: "Gjør det motsatte av det som blir bedt om.", reverse: true, order: 271 },
  { id: "c3_10", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Misrepresent the facts.", textNo: "Fremstiller fakta feil.", reverse: true, order: 272 },

  { id: "c4_5", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Go straight for the goal.", textNo: "Går rett på målet.", reverse: false, order: 273 },
  { id: "c4_6", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Turn plans into actions.", textNo: "Omsetter planer til handling.", reverse: false, order: 274 },
  { id: "c4_7", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Plunge into tasks with all my heart.", textNo: "Kaster meg helhjertet inn i oppgaver.", reverse: false, order: 275 },
  { id: "c4_8", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Set high standards for myself and others.", textNo: "Setter høye standarder for meg selv og andre.", reverse: false, order: 276 },
  { id: "c4_9", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Demand quality.", textNo: "Krever kvalitet.", reverse: false, order: 277 },
  { id: "c4_10", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Am not highly motivated to succeed.", textNo: "Er ikke spesielt motivert for å lykkes.", reverse: true, order: 278 },

  { id: "c5_5", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Get chores done right away.", textNo: "Gjør unna gjøremål med en gang.", reverse: false, order: 279 },
  { id: "c5_6", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Start tasks right away.", textNo: "Starter oppgaver umiddelbart.", reverse: false, order: 280 },
  { id: "c5_7", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Get to work at once.", textNo: "Går rett i gang med arbeidet.", reverse: false, order: 281 },
  { id: "c5_8", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Find it difficult to get down to work.", textNo: "Synes det er vanskelig å komme i gang med arbeid.", reverse: true, order: 282 },
  { id: "c5_9", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Need a push to get started.", textNo: "Trenger et puff for å komme i gang.", reverse: true, order: 283 },
  { id: "c5_10", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Postpone decisions.", textNo: "Utsetter beslutninger.", reverse: true, order: 284 },

  { id: "c6_5", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Avoid mistakes.", textNo: "Unngår feil.", reverse: false, order: 285 },
  { id: "c6_6", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Choose my words with care.", textNo: "Velger ordene mine med omhu.", reverse: false, order: 286 },
  { id: "c6_7", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Stick to my chosen path.", textNo: "Holder meg til den valgte veien.", reverse: false, order: 287 },
  { id: "c6_8", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Like to act on a whim.", textNo: "Liker å handle på impuls.", reverse: true, order: 288 },
  { id: "c6_9", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Do crazy things.", textNo: "Gjør sprø ting.", reverse: true, order: 289 },
  { id: "c6_10", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Often make last-minute plans.", textNo: "Legger ofte planer i siste liten.", reverse: true, order: 290 },
] as const;

/**
 * Alle 290 spørsmål (v2.11, tredje trapp -- "Utvidet versjon"). ALL_QUESTIONS
 * (120) pluss de fem EXTENDED_QUESTIONS_*-blokkene over (170), sortert på
 * `order` slik at rekkefølgen blir sammenhengende 1-290.
 *
 * IKKE jevnt fordelt per domene: N/E/A/C har 6 fasetter x 10 spørsmål = 60
 * hver, mens Åpenhet (O) kun har 5 fasetter (O6/Liberalism er fortsatt
 * utelatt, se filhode) x 10 = 50. Det er forskjellig fra
 * 120-settet, der O var kunstig jevnet ut til 24 via fire "kompensasjons"-
 * spørsmål -- her trengs ikke det trikset, siden hver fasett uansett får sine
 * fulle 10 IPIP-spørsmål. Se assertExtendedQuestionSetIntegrity for vaktposten.
 */
export const ALL_QUESTIONS_EXTENDED: readonly Question[] = [
  ...ALL_QUESTIONS,
  ...EXTENDED_QUESTIONS_N,
  ...EXTENDED_QUESTIONS_E,
  ...EXTENDED_QUESTIONS_O,
  ...EXTENDED_QUESTIONS_A,
  ...EXTENDED_QUESTIONS_C,
]
  .slice()
  .sort((a, b) => a.order - b.order);

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

/**
 * O6 (Liberalism) -- utelatt fra testen i sin helhet. I IPIP er fasetten
 * utelukkende operasjonalisert gjennom politiske og religiøse påstander --
 * særlig kategori persondata etter GDPR art. 9. Prosjektet utelot fasetten
 * helt i første versjon (Dokument 03 §7/§20.1). Den ble en periode (14.07.--
 * 19.07.2026) tilbudt som en isolert, eksplisitt samtykkebasert
 * tilleggsseksjon, men produkteier besluttet 19.07.2026 å fjerne den helt
 * (spørsmål, samtykkeflyt, skåring, kontolagring og CSV-verktøy) -- se
 * git-historikken for den koden dersom den skal gjenopplives.
 */
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

// Vaktpost for den utvidede 290-versjonen (v2.11) -- EGEN sjekk, siden
// fordelingen IKKE er jevn som i 120-settet: N/E/A/C har 6 fasetter x 10 = 60
// hver, Åpenhet (O) har 5 fasetter (O6 utelatt) x 10 = 50. 4x60 + 50 = 290.
const EXPECTED_TOTAL_EXTENDED = 290;
const EXPECTED_PER_DOMAIN_EXTENDED: Record<Domain, number> = {
  N: 60,
  E: 60,
  O: 50,
  A: 60,
  C: 60,
};

export function assertExtendedQuestionSetIntegrity(): void {
  if (ALL_QUESTIONS_EXTENDED.length !== EXPECTED_TOTAL_EXTENDED) {
    throw new Error(
      `Forventet ${EXPECTED_TOTAL_EXTENDED} spørsmål totalt i den utvidede versjonen, fant ${ALL_QUESTIONS_EXTENDED.length}.`
    );
  }
  const counts: Record<Domain, number> = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();

  let previousOrder = 0;
  for (const q of ALL_QUESTIONS_EXTENDED) {
    if (seenIds.has(q.id)) throw new Error(`Duplikat spørsmåls-id (utvidet sett): ${q.id}`);
    seenIds.add(q.id);
    if (seenOrders.has(q.order)) throw new Error(`Duplikat order-verdi (utvidet sett): ${q.order}`);
    seenOrders.add(q.order);
    if (q.order !== previousOrder + 1) {
      throw new Error(
        `Order-rekkefølge brutt i det utvidede settet: forventet ${previousOrder + 1}, fant ${q.order}.`
      );
    }
    previousOrder = q.order;
    counts[q.domain]++;
  }

  for (const domain of Object.keys(counts) as Domain[]) {
    if (counts[domain] !== EXPECTED_PER_DOMAIN_EXTENDED[domain]) {
      throw new Error(
        `Spørsmålsintegritet brutt (utvidet sett): domene ${domain} har ${counts[domain]} spørsmål, forventet ${EXPECTED_PER_DOMAIN_EXTENDED[domain]}.`
      );
    }
  }

  // De første 120 (etter sortering på order) skal være nøyaktig ALL_QUESTIONS,
  // uendret -- den utvidede versjonen skal ALDRI endre på hva 120-testen selv
  // består av, kun legge til bak den.
  const first120Ids = ALL_QUESTIONS_EXTENDED.slice(0, 120)
    .map((q) => q.id)
    .sort();
  const allQuestionsIds = ALL_QUESTIONS.map((q) => q.id)
    .slice()
    .sort();
  if (JSON.stringify(first120Ids) !== JSON.stringify(allQuestionsIds)) {
    throw new Error(
      "Integritetsbrudd: de første 120 spørsmålene i det utvidede settet stemmer ikke overens med ALL_QUESTIONS."
    );
  }
}
