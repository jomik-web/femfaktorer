/**
 * Spørsmålsvinkler for Spir (v2.61, 04.08.2026).
 *
 * PROBLEMET DETTE LØSER
 * Betatesteren beskrev det slik: «Spir kommenterer på mine svar, men stiller
 * ikke oppfølgende spørsmål. Ofte spør hen om jeg vil gå videre.» Og der hun
 * spurte, spurte hun om det samme igjen med andre ord.
 *
 * Ber man en språkmodell «still noe nytt», får man noe som LIGNER -- den har
 * ingen hukommelse for hva slags spørsmål den allerede har stilt, bare for
 * ordene. Ber man den «still et spørsmål av typen UNNTAKET», får man noe
 * strukturelt annerledes.
 *
 * Derfor velges vinkelen i kode og roteres deterministisk. Spir formulerer
 * den; hun bestemmer den ikke. Samme arbeidsdeling som ellers i tjenesten:
 * strukturen er vår, språket er hennes.
 *
 * HVORFOR «UNNTAKET» STÅR FØRST
 * Betatesteren fikk 100 av 100 på sindighet og sa det ikke stemte. Så
 * forklarte han når det ikke stemmer: når han blir avfeid av en overordnet i
 * en sak han kan mye om. Skåren sa 100; sannheten var BETINGET, og
 * betingelsen var langt mer interessant enn tallet.
 *
 * Den historien kom fram fordi han fikk snakke. Vinkelen som ville hentet
 * den fram, er unntaket -- derfor ligger den først i rotasjonen.
 */

export interface QuestionAngle {
  /** Stabil id -- lagres i klientens tilstand for å unngå gjentakelse. */
  id: string;
  /** Kort navn, kun til utviklerbruk og logging. */
  name: string;
  /** Instruksen Spir faktisk får. Beskriver HVA slags spørsmål, ikke ordlyden. */
  instruction: string;
}

export const QUESTION_ANGLES: readonly QuestionAngle[] = [
  {
    id: "unntaket",
    name: "Unntaket",
    instruction:
      "Spør etter UNNTAKET fra mønsteret -- situasjonen der trekket ikke stemmer. Et tall beskriver et gjennomsnitt, og det interessante ligger som regel i hva som bryter det. Formuler det slik at det er lett å innrømme at det finnes et unntak.",
  },
  {
    id: "situasjonen",
    name: "Situasjonen",
    instruction:
      "Spør etter en KONKRET situasjon der trekket viste seg -- helst noe som faktisk har skjedd, ikke noe hypotetisk. Be gjerne om siste gang det skjedde.",
  },
  {
    id: "andres-blikk",
    name: "Andres blikk",
    instruction:
      "Spør hvordan dette ser ut UTENFRA -- om folk rundt brukeren ville beskrevet ham eller henne på samme måte, eller om de ville lagt merke til noe annet.",
  },
  {
    id: "prisen",
    name: "Prisen",
    instruction:
      "Spør hva trekket KOSTER. Også en styrke har en bakside, og også en svakhet gir noe tilbake. Spør uten å antyde at det ene er bedre enn det andre.",
  },
  {
    id: "opphavet",
    name: "Opphavet",
    instruction:
      "Spør om trekket har vært der LENGE, eller om det har endret seg -- om brukeren kjenner igjen dette fra tidligere i livet, eller om noe har flyttet på seg.",
  },
  {
    id: "onsket",
    name: "Ønsket",
    instruction:
      "Spør om brukeren ville hatt MER eller MINDRE av dette om han eller hun kunne velge -- og hva som ligger bak det svaret.",
  },
];

/**
 * Neste ubrukte vinkel for denne fasetten. Returnerer null når alle er brukt
 * -- da har temaet vært snudd fra seks kanter, og Spir bør si det rett ut i
 * stedet for å begynne på nytt (se buildGuidedFacetSystemPrompt).
 */
export function nextAngle(usedAngleIds: readonly string[]): QuestionAngle | null {
  return QUESTION_ANGLES.find((a) => !usedAngleIds.includes(a.id)) ?? null;
}

export function isValidAngleId(value: unknown): value is string {
  return typeof value === "string" && QUESTION_ANGLES.some((a) => a.id === value);
}
