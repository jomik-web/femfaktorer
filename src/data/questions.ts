/**
 * De 30 korttest-spørsmålene, jf. Dokument 03 (Teststruktur, skåring og
 * resultatformidling, v1.1) §7/§20 og Grunnlagsdokumentet §7.1.
 *
 * Kilde for engelsk originaltekst: IPIP sin offentlige item-bank
 * (ipip.ori.org), offentlig eiendom -- ingen opphavsrettslige begrensninger.
 * Norsk tekst er en første arbeidsoversettelse og skal språklig
 * kvalitetssikres før publisering (se Grunnlagsdokumentet §11).
 *
 * MERK OM RETNING: alle 30 item er valgt som de POSITIVT nøkkeltbeskrevne
 * markørene for sin fasett (dvs. "enig" betyr høyere verdi på selve
 * faktoren de tilhører, uten reversering). Dette er lagt merke til ved
 * gjennomgang av item-teksten, ikke bekreftet mot Johnsons originale
 * skåringsnøkkel direkte (ingen internettilgang tilgjengelig ved skriving).
 * Skåringsmotoren (se scoring.ts) støtter uansett reversert skåring som en
 * generell, testet regel -- sett `reverse: true` her dersom en fremtidig
 * gjennomgang avdekker at et item faktisk skal reverseres.
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
}

export const QUESTIONS: readonly Question[] = [
  // Nevrotisisme (lagres internt som N; vises som "Emosjonell stabilitet", jf. §9.3/§12.1)
  { id: "n1", facet: "N1", facetName: "Anxiety", domain: "N", textEn: "Worry about things.", textNo: "Bekymrer meg for ting.", reverse: false },
  { id: "n2", facet: "N2", facetName: "Anger", domain: "N", textEn: "Get angry easily.", textNo: "Blir lett sint.", reverse: false },
  { id: "n3", facet: "N3", facetName: "Depression", domain: "N", textEn: "Often feel blue.", textNo: "Føler meg ofte nedfor.", reverse: false },
  { id: "n4", facet: "N4", facetName: "Self-Consciousness", domain: "N", textEn: "Am easily intimidated.", textNo: "Blir lett satt ut.", reverse: false },
  { id: "n5", facet: "N5", facetName: "Immoderation", domain: "N", textEn: "Do things I later regret.", textNo: "Gjør ting jeg angrer på senere.", reverse: false },
  { id: "n6", facet: "N6", facetName: "Vulnerability", domain: "N", textEn: "Panic easily.", textNo: "Får lett panikk.", reverse: false },

  // Ekstroversjon
  { id: "e1", facet: "E1", facetName: "Friendliness", domain: "E", textEn: "Make friends easily.", textNo: "Får lett venner.", reverse: false },
  { id: "e2", facet: "E2", facetName: "Gregariousness", domain: "E", textEn: "Enjoy being part of a group.", textNo: "Liker å være del av en gruppe.", reverse: false },
  { id: "e3", facet: "E3", facetName: "Assertiveness", domain: "E", textEn: "Take charge.", textNo: "Tar lederskap.", reverse: false },
  { id: "e4", facet: "E4", facetName: "Activity Level", domain: "E", textEn: "Am always busy.", textNo: "Er alltid opptatt med noe.", reverse: false },
  { id: "e5", facet: "E5", facetName: "Excitement-Seeking", domain: "E", textEn: "Love excitement.", textNo: "Elsker spenning.", reverse: false },
  { id: "e6", facet: "E6", facetName: "Cheerfulness", domain: "E", textEn: "Love life.", textNo: "Elsker livet.", reverse: false },

  // Åpenhet for erfaring (O6 Liberalism byttet ut med et ekstra O4-item, se Dokument 03 §7/§20.1)
  { id: "o1", facet: "O1", facetName: "Imagination", domain: "O", textEn: "Have a vivid imagination.", textNo: "Har en levende fantasi.", reverse: false },
  { id: "o2", facet: "O2", facetName: "Artistic Interests", domain: "O", textEn: "Believe in the importance of art.", textNo: "Mener kunst er viktig.", reverse: false },
  { id: "o3", facet: "O3", facetName: "Emotionality", domain: "O", textEn: "Experience my emotions intensely.", textNo: "Opplever følelsene mine sterkt.", reverse: false },
  { id: "o4a", facet: "O4", facetName: "Adventurousness", domain: "O", textEn: "Like to visit new places.", textNo: "Liker å besøke nye steder.", reverse: false },
  { id: "o4b", facet: "O4", facetName: "Adventurousness (erstatter O6)", domain: "O", textEn: "Am interested in many things.", textNo: "Er interessert i mange ting.", reverse: false },
  { id: "o5", facet: "O5", facetName: "Intellect", domain: "O", textEn: "Like to solve complex problems.", textNo: "Liker å løse kompliserte problemer.", reverse: false },

  // Medmenneskelighet
  { id: "a1", facet: "A1", facetName: "Trust", domain: "A", textEn: "Trust others.", textNo: "Stoler på andre.", reverse: false },
  { id: "a2", facet: "A2", facetName: "Morality", domain: "A", textEn: "Stick to the rules.", textNo: "Holder meg til reglene.", reverse: false },
  { id: "a3", facet: "A3", facetName: "Altruism", domain: "A", textEn: "Love to help others.", textNo: "Liker godt å hjelpe andre.", reverse: false },
  { id: "a4", facet: "A4", facetName: "Cooperation", domain: "A", textEn: "Am easy to satisfy.", textNo: "Er lett å tilfredsstille.", reverse: false },
  { id: "a5", facet: "A5", facetName: "Modesty", domain: "A", textEn: "Dislike being the center of attention.", textNo: "Liker ikke å være i sentrum for oppmerksomhet.", reverse: false },
  { id: "a6", facet: "A6", facetName: "Sympathy", domain: "A", textEn: "Feel sympathy for those who are worse off than myself.", textNo: "Føler sympati for de som har det verre enn meg selv.", reverse: false },

  // Planmessighet
  { id: "c1", facet: "C1", facetName: "Self-Efficacy", domain: "C", textEn: "Complete tasks successfully.", textNo: "Fullfører oppgaver på en god måte.", reverse: false },
  { id: "c2", facet: "C2", facetName: "Orderliness", domain: "C", textEn: "Like order.", textNo: "Liker orden.", reverse: false },
  { id: "c3", facet: "C3", facetName: "Dutifulness", domain: "C", textEn: "Keep my promises.", textNo: "Holder løftene mine.", reverse: false },
  { id: "c4", facet: "C4", facetName: "Achievement-Striving", domain: "C", textEn: "Work hard.", textNo: "Jobber hardt.", reverse: false },
  { id: "c5", facet: "C5", facetName: "Self-Discipline", domain: "C", textEn: "Am always prepared.", textNo: "Er alltid forberedt.", reverse: false },
  { id: "c6", facet: "C6", facetName: "Cautiousness", domain: "C", textEn: "Avoid mistakes.", textNo: "Unngår feil.", reverse: false },
] as const;

// Systemet skal aldri anta et nøytralt svar for manglende data (Dokument 09 §10.3) --
// denne sjekken er en tidlig, billig vaktpost mot at noen ved et uhell endrer listen
// uten å holde 6 spørsmål per domene.
const EXPECTED_PER_DOMAIN = 6;
export function assertQuestionSetIntegrity(): void {
  const counts: Record<Domain, number> = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  for (const q of QUESTIONS) counts[q.domain]++;
  for (const [domain, count] of Object.entries(counts)) {
    if (count !== EXPECTED_PER_DOMAIN) {
      throw new Error(
        `Spørsmålsintegritet brutt: domene ${domain} har ${count} spørsmål, forventet ${EXPECTED_PER_DOMAIN}.`
      );
    }
  }
  if (QUESTIONS.length !== EXPECTED_PER_DOMAIN * 5) {
    throw new Error(`Forventet 30 spørsmål totalt, fant ${QUESTIONS.length}.`);
  }
}
