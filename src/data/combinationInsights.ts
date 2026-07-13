/**
 * Kuraterte tolkninger av KOMBINASJONER av to hovedfaktorer -- lagt til v2.1
 * etter produkteiers ønske ("sette sammen ulike hoved- og underkategorier og
 * presentere resultater fra det også, ikke bare isolert for den enkelte
 * kategori").
 *
 * Viktig avgrensning (bevisst valg, ikke en mangel): å skrive tolkningstekst
 * for ALLE mulige kombinasjoner av alle bånd på fasettnivå er kombinatorisk
 * uoverkommelig (29 fasetter x 3 bånd gir astronomisk mange par) og ville gitt
 * tynt, generisk innhold. Denne filen dekker derfor et KURATERT utvalg av
 * kjente, godt dokumenterte mønstre på HOVEDFAKTORNIVÅ (kun når begge
 * faktorer er tydelig "lavt" eller "høyt" -- ikke "middels"). Se
 * Grunnlagsdokumentet -- produkteier har eksplisitt valgt "begge deler"
 * (statisk innhold + dynamisk via Spir), så dette er den STATISKE halvparten.
 * Spir (se systemPrompt.ts) kan gå dypere og dekke kombinasjoner som IKKE er
 * kuratert her, siden den har hele profilen (inkl. fasetter) tilgjengelig.
 *
 * Tonekrav er identiske med resten av tolkningsteksten: aldri bastant, alltid
 * "kan tyde på"/"ofte", vis både ressurser og utfordringer der det passer.
 */

import type { DisplayFactor, FactorResult } from "@/lib/scoring";

type ExtremeBand = "low" | "high";

export interface CombinationInsight {
  id: string;
  factorA: DisplayFactor;
  bandA: ExtremeBand;
  factorB: DisplayFactor;
  bandB: ExtremeBand;
  title: string;
  text: string;
}

export const COMBINATION_INSIGHTS: CombinationInsight[] = [
  {
    id: "high-consc-low-stability",
    factorA: "conscientiousness",
    bandA: "high",
    factorB: "stability",
    bandB: "low",
    title: "Høy planmessighet + lavere emosjonell stabilitet",
    text: "Denne kombinasjonen kan gi svært høye krav til egen prestasjon, kombinert med en tendens til å bekymre seg for om det er godt nok. Styrken er grundighet og pålitelighet -- utfordringen kan være at feil eller usikkerhet oppleves tyngre enn nødvendig. Faste rutiner for å «erklære noe ferdig» kan være til hjelp.",
  },
  {
    id: "high-consc-high-stability",
    factorA: "conscientiousness",
    bandA: "high",
    factorB: "stability",
    bandB: "high",
    title: "Høy planmessighet + høy emosjonell stabilitet",
    text: "Denne kombinasjonen peker ofte mot noen som er strukturert, pålitelig og samtidig beholder roen under press -- en profil som ofte fungerer godt i roller med ansvar og høye krav. Vær oppmerksom på at høy egen ro noen ganger kan gjøre det vanskeligere å fange opp stress hos andre rundt deg.",
  },
  {
    id: "high-extra-high-agree",
    factorA: "extraversion",
    bandA: "high",
    factorB: "agreeableness",
    bandB: "high",
    title: "Høy ekstroversjon + høy medmenneskelighet",
    text: "Denne kombinasjonen gir ofte en naturlig, varm sosial stil -- du oppsøker kontakt med andre og bryr deg genuint om hvordan de har det. En mulig utfordring er å si nei, siden både sosial energi og hjelpsomhet trekker deg mot å bli involvert i mer enn du strengt tatt har kapasitet til.",
  },
  {
    id: "high-extra-low-agree",
    factorA: "extraversion",
    bandA: "high",
    factorB: "agreeableness",
    bandB: "low",
    title: "Høy ekstroversjon + lavere medmenneskelighet",
    text: "Denne kombinasjonen kan gi en tydelig, pågående og selvsikker stil -- du tar gjerne plass og sier klart fra hva du mener. Andre kan noen ganger oppleve deg som mer dominerende enn du selv har til hensikt; bevisst lytting kan balansere dette godt.",
  },
  {
    id: "low-extra-high-open",
    factorA: "extraversion",
    bandA: "low",
    factorB: "openness",
    bandB: "high",
    title: "Lavere ekstroversjon + høy åpenhet for erfaring",
    text: "Denne kombinasjonen finnes ofte hos folk som tenker og skaper best alene eller i små grupper -- rikt indre tankeliv kombinert med lite behov for stor sosial stimulering. Kan gi dyp, original tenkning som likevel krever bevisst innsats å dele og formidle til andre.",
  },
  {
    id: "high-open-low-consc",
    factorA: "openness",
    bandA: "high",
    factorB: "conscientiousness",
    bandB: "low",
    title: "Høy åpenhet for erfaring + lavere planmessighet",
    text: "Denne kombinasjonen gir ofte mange ideer og stor kreativ energi, men kan gjøre det krevende å faktisk følge en idé helt fram til den er ferdig. Å pare deg med noen -- eller noe system -- som er sterk på gjennomføring, kan utfylle dette godt.",
  },
  {
    id: "high-open-high-consc",
    factorA: "openness",
    bandA: "high",
    factorB: "conscientiousness",
    bandB: "high",
    title: "Høy åpenhet for erfaring + høy planmessighet",
    text: "Denne kombinasjonen kan gi en sjelden god blanding av kreativitet og gjennomføringsevne -- ideer som faktisk blir realisert, ikke bare tenkt. Utfordringen kan være å vite når «godt nok» faktisk er ferdig, siden nysgjerrigheten stadig frister med justeringer.",
  },
  {
    id: "low-agree-high-consc",
    factorA: "agreeableness",
    bandA: "low",
    factorB: "conscientiousness",
    bandB: "high",
    title: "Lavere medmenneskelighet + høy planmessighet",
    text: "Denne kombinasjonen kan gi en resultatorientert, direkte stil der du er villig til å ta upopulære beslutninger for å nå et mål. Kan oppfattes som en styrke i roller som krever tøffe prioriteringer, men er verdt å balansere med bevisst oppmerksomhet på hvordan beskjeder mottas av andre.",
  },
  {
    id: "high-agree-low-stability",
    factorA: "agreeableness",
    bandA: "high",
    factorB: "stability",
    bandB: "low",
    title: "Høy medmenneskelighet + lavere emosjonell stabilitet",
    text: "Denne kombinasjonen kan gi en sterk vilje til å stille opp for andre, samtidig som konflikt eller andres skuffelse kjennes ekstra tungt. Risikoen er å love bort mer enn du har kapasitet til fordi det er vanskelig å si nei -- bevisst grensesetting kan være ekstra viktig for nettopp denne kombinasjonen.",
  },
  {
    id: "high-extra-low-stability",
    factorA: "extraversion",
    bandA: "high",
    factorB: "stability",
    bandB: "low",
    title: "Høy ekstroversjon + lavere emosjonell stabilitet",
    text: "Denne kombinasjonen kan gi et livlig, engasjert følelsesuttrykk -- du søker sosial stimulering og opplever både opp- og nedturer tydelig og synlig for andre. Faste holdepunkter (rutiner, folk du stoler på) kan hjelpe deg å roe ned når mye skjer samtidig.",
  },
  {
    id: "low-extra-low-stability",
    factorA: "extraversion",
    bandA: "low",
    factorB: "stability",
    bandB: "low",
    title: "Lavere ekstroversjon + lavere emosjonell stabilitet",
    text: "Denne kombinasjonen kan gjøre at bekymring eller uro lettere bearbeides alene enn sammen med andre -- noe som gir rom for refleksjon, men også en risiko for at det blir for lite ekstern støtte i krevende perioder. Noen få nære relasjoner du aktivt oppsøker i vanskelige tider, kan gjøre stor forskjell.",
  },
  {
    id: "high-open-high-extra",
    factorA: "openness",
    bandA: "high",
    factorB: "extraversion",
    bandB: "high",
    title: "Høy åpenhet for erfaring + høy ekstroversjon",
    text: "Denne kombinasjonen peker ofte mot en person som genererer ideer sammen med andre -- trives i idémyldring, nettverksbygging og situasjoner der nye tanker møter mange mennesker. Kan gjøre det krevende å sette av nok tid til den dypere, mer stillegående utforskingen enkelte ideer trenger.",
  },
];

/**
 * Finner alle kuraterte kombinasjoner som treffer brukerens faktiske profil.
 * Bruker samme bånd-grenser som resten av tolkningsteksten (< 40 lav, > 60
 * høy, se interpretations.ts bandFor) -- "middels" gir aldri et treff, siden
 * de kuraterte tekstene forutsetter en tydelig retning på begge faktorer.
 */
export function matchCombinationInsights(
  factors: FactorResult[],
  bandFor: (score: number) => "low" | "mid" | "high"
): CombinationInsight[] {
  const extremeByFactor = new Map<DisplayFactor, ExtremeBand>();
  for (const f of factors) {
    const band = bandFor(f.score);
    if (band === "low" || band === "high") extremeByFactor.set(f.factor, band);
  }

  return COMBINATION_INSIGHTS.filter(
    (c) => extremeByFactor.get(c.factorA) === c.bandA && extremeByFactor.get(c.factorB) === c.bandB
  );
}
