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

import type { Domain } from "@/data/questions";
import { FACET_INTERPRETATIONS } from "@/data/facetInterpretations";
import type { DisplayFactor, FactorResult, FacetResult } from "@/lib/scoring";

type ExtremeBand = "low" | "high";

/** Visningsrekkefølge for domener -- samme rekkefølge som hovedfaktorene faktisk vises i (se scoring.ts computeDomainRawScores). */
export const DOMAIN_DISPLAY_ORDER: Domain[] = ["N", "E", "O", "A", "C"];

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

/**
 * Samme som matchCombinationInsights, men gruppert etter hvilket hoveddomene
 * hver kombinasjon skal vises under -- se plasseringsregelen i filhodet til
 * FACET_COMBINATION_INSIGHTS under (samme regel gjelder her: vises under det
 * domenet som kommer SIST i visningsrekkefølgen av de to involverte).
 */
export function matchCombinationInsightsByDomain(
  factors: FactorResult[],
  bandFor: (score: number) => "low" | "mid" | "high",
  displayToDomain: Record<DisplayFactor, Domain>
): Map<Domain, CombinationInsight[]> {
  const byDomain = new Map<Domain, CombinationInsight[]>();
  for (const combo of matchCombinationInsights(factors, bandFor)) {
    const domainA = displayToDomain[combo.factorA];
    const domainB = displayToDomain[combo.factorB];
    const placementDomain =
      DOMAIN_DISPLAY_ORDER.indexOf(domainA) > DOMAIN_DISPLAY_ORDER.indexOf(domainB) ? domainA : domainB;
    const list = byDomain.get(placementDomain) ?? [];
    list.push(combo);
    byDomain.set(placementDomain, list);
  }
  return byDomain;
}

/**
 * Kuraterte tolkninger av kombinasjoner mellom to FASETTER (underkategorier)
 * -- lagt til v2.3 etter produkteiers ønske ("spennende samspill mellom
 * flere underkategorier"). Samme avgrensning som COMBINATION_INSIGHTS over:
 * dette er et KURATERT utvalg, ikke en uttømmende liste (29 fasetter gir
 * astronomisk mange mulige par) -- valgt fordi de er kjente, tydelig
 * beskrivbare mønstre. Spir kan gå videre og dekke par som ikke er kuratert
 * her (den har hele fasettprofilen tilgjengelig, se systemPrompt.ts).
 *
 * Plassering i rapporten (se resultat/page.tsx):
 *  - Er begge fasettene i SAMME hoveddomene, vises kommentaren til slutt i
 *    det domenets fasettliste.
 *  - Er fasettene fra ULIKE hoveddomener, vises kommentaren under det
 *    domenet som kommer SIST i visningsrekkefølgen
 *    (N, E, O, A, C -- se DOMAIN_DISPLAY_ORDER).
 */
export interface FacetCombinationInsight {
  id: string;
  facetA: string;
  bandA: ExtremeBand;
  facetB: string;
  bandB: ExtremeBand;
  title: string;
  text: string;
}

export const FACET_COMBINATION_INSIGHTS: FacetCombinationInsight[] = [
  {
    id: "n5-low-n6-low",
    facetA: "N5",
    bandA: "low",
    facetB: "N6",
    bandB: "low",
    title: "Impulskontroll og sårbarhet under press peker begge mot den mer reaktive enden",
    text: "Denne kombinasjonen kan bety at sterke ønsker eller fristelser lettere tar styringen samtidig som du kjenner deg mer overveldet når flere krav kommer på én gang. De to forsterker gjerne hverandre i pressede situasjoner. Faste, forhåndsbestemte rutiner for nettopp slike øyeblikk -- planlagt på forhånd, ikke i stunden -- kan være til god hjelp.",
  },
  {
    id: "c1-high-c5-low",
    facetA: "C1",
    bandA: "high",
    facetB: "C5",
    bandB: "low",
    title: "Høy mestringstro, men lavere selvdisiplin",
    text: "Denne kombinasjonen kan bety at du stoler på at du KAN løse oppgaven, samtidig som det er krevende å faktisk komme i gang eller holde ut til den er ferdig. Troen på egen evne er en ressurs -- utfordringen ligger mer i oppstart og utholdenhet enn i tvil om resultatet. Korte, konkrete første steg kan gjøre terskelen for å begynne lavere.",
  },
  {
    id: "e3-high-e1-low",
    facetA: "E3",
    bandA: "high",
    facetB: "E1",
    bandB: "low",
    title: "Høy selvhevdelse, men mindre varme",
    text: "Denne kombinasjonen kan gi en tydelig, pådrivende stil uten at det samme følelsesmessige nærværet nødvendigvis følger med. Andre kan oppfatte deg som besluttsom og retningsgivende, men også som noe mer distansert enn du selv opplever deg. Et bevisst signal om at du bryr deg -- ikke bare hva du mener -- kan bygge bro mellom de to.",
  },
  {
    id: "o1-high-o5-high",
    facetA: "O1",
    bandA: "high",
    facetB: "O5",
    bandB: "high",
    title: "Sterk fantasi og sterk intellektuell nysgjerrighet",
    text: "Denne kombinasjonen gir ofte en uvanlig produktiv blanding: forestillingsevne til å se det som ikke finnes ennå, og en analytisk interesse for å forstå det grundig. Idéarbeid og komplekse problemstillinger kan derfor kjennes spesielt givende. Å sette av tid til å faktisk lande ideene, ikke bare utforske dem videre, kan være noe å være bevisst på.",
  },
  {
    id: "a1-low-a2-high",
    facetA: "A1",
    bandA: "low",
    facetB: "A2",
    bandB: "high",
    title: "Lavere tillit, men høy rettframhet",
    text: "Denne kombinasjonen kan bety at du er varsom med å stole på andres intensjoner, samtidig som du selv er åpen og direkte om dine egne. Det gir en ærlig, forutsigbar stil, men kan også skape en viss asymmetri i relasjoner -- du gir mer åpenhet enn du selv umiddelbart forventer tilbake.",
  },
  {
    id: "c2-high-c6-low",
    facetA: "C2",
    bandA: "high",
    facetB: "C6",
    bandB: "low",
    title: "Høy orden, men lavere overveielse",
    text: "Denne kombinasjonen kan bety at du liker struktur og system i det du allerede har foran deg, men handler raskere og mer spontant enn du planlegger for. Systemene dine er gjerne solide -- selve beslutningene kan noen ganger tas litt fortere enn konsekvensene er tenkt helt gjennom.",
  },
  {
    id: "n6-low-c1-high",
    facetA: "N6",
    bandA: "low",
    facetB: "C1",
    bandB: "high",
    title: "Sårbarhet under press og høy mestringstro",
    text: "Denne kombinasjonen kan virke motstridende: du stoler på egen evne til å løse oppgaver, men merker samtidig at kapasiteten strekker seg tynnere når flere krav kommer samtidig. Selvtilliten er ofte reell og velfundert -- det som svikter under høyt press er mer kapasitet der og da enn selve troen på egen dyktighet.",
  },
  {
    id: "e5-high-n1-low",
    facetA: "E5",
    bandA: "high",
    facetB: "N1",
    bandB: "high",
    title: "Høy spenningssøking og høy emosjonell stabilitet på bekymring-fasetten",
    text: "Denne kombinasjonen kan bety at du søker fart, risiko og sterke opplevelser uten at bekymring bremser deg i særlig grad. Det kan gjøre deg til en som går løs på nye og usikre situasjoner uten å nøle -- verdt å være bevisst på er at den samme lave bekymringsterskelen også kan gjøre reell risiko vanskeligere å fange opp i tide.",
  },
  {
    id: "a6-high-n1-low",
    facetA: "A6",
    bandA: "high",
    facetB: "N1",
    bandB: "low",
    title: "Høy medfølelse og lavere emosjonell stabilitet på bekymring-fasetten",
    text: "Denne kombinasjonen kan bety at du berøres lett av andres smerte, samtidig som du selv bekymrer deg relativt mye. De to kan forsterke hverandre -- andres vanskelige situasjoner kan feste seg hos deg lenger enn du skulle ønske. Bevisste grenser for hvor mye du tar innover deg, kan være til hjelp uten at det går på bekostning av omsorgen din.",
  },
  {
    id: "o5-high-c5-low",
    facetA: "O5",
    bandA: "high",
    facetB: "C5",
    bandB: "low",
    title: "Høy intellektuell nysgjerrighet, men lavere selvdisiplin",
    text: "Denne kombinasjonen kan bety at nye ideer og problemstillinger stadig fanger interessen din, samtidig som det er krevende å holde fast ved én av dem til den faktisk er fullført. Bredden i interessene er en styrke -- noe struktur rundt hva som faktisk skal fullføres, kan hjelpe deg å høste mer av den.",
  },
  {
    id: "c4-high-n1-low",
    facetA: "C4",
    bandA: "high",
    facetB: "N1",
    bandB: "low",
    title: "Høy prestasjonsstreben og lavere emosjonell stabilitet på bekymring-fasetten",
    text: "Denne kombinasjonen kan bety at høye mål kombineres med en tendens til å bekymre deg for om du når dem. Ambisjonene driver deg gjerne fremover, men kan også gjøre at ting sjelden føles «godt nok». Å bevisst anerkjenne det du faktisk har oppnådd underveis, ikke bare målet lenger frem, kan dempe noe av presset.",
  },
  {
    id: "e3-high-a4-low",
    facetA: "E3",
    bandA: "high",
    facetB: "A4",
    bandB: "low",
    title: "Høy selvhevdelse og lavere ettergivenhet",
    text: "Denne kombinasjonen kan gi en tydelig, konfronterende stil i uenighet -- du tar plass og gir deg ikke lett. Det kan være en klar styrke i forhandlinger eller beslutninger som må tas raskt, men tett samarbeid kan noen ganger dra nytte av at du bevisst går inn for kompromiss selv når du er sikker i din sak.",
  },
  {
    id: "o4-high-n1-low",
    facetA: "O4",
    bandA: "high",
    facetB: "N1",
    bandB: "low",
    title: "Høy eventyrlyst og lavere emosjonell stabilitet på bekymring-fasetten",
    text: "Denne kombinasjonen kan bety at du oppsøker nye erfaringer, steder og arbeidsmåter uten at bekymring holder deg tilbake. Det åpner ofte dører andre nøler ved -- verdt å ha i bakhodet er at det samme gjør det lettere å undervurdere reell risiko ved det ukjente.",
  },
  {
    id: "a3-high-c1-low",
    facetA: "A3",
    bandA: "high",
    facetB: "C1",
    bandB: "low",
    title: "Høy hjelpsomhet, men lavere mestringstro",
    text: "Denne kombinasjonen kan bety at du sier ja til å hjelpe andre samtidig som du selv tviler på om du strekker til. Viljen til å bidra er tydelig -- risikoen er å ta på deg mer enn du egentlig har tro på at du kan levere, noe som kan gjøre belastningen tyngre enn den trenger å være.",
  },
];

/**
 * Finner alle kuraterte FASETT-kombinasjoner som treffer brukerens faktiske
 * profil, og grupperer dem etter hvilket hoveddomene de skal vises under
 * (se filhode om plasseringsregelen).
 */
export function matchFacetCombinationInsights(
  facets: FacetResult[],
  bandFor: (score: number) => "low" | "mid" | "high"
): Map<Domain, FacetCombinationInsight[]> {
  const extremeByFacet = new Map<string, ExtremeBand>();
  for (const f of facets) {
    const band = bandFor(f.score);
    if (band === "low" || band === "high") extremeByFacet.set(f.facet, band);
  }

  const byDomain = new Map<Domain, FacetCombinationInsight[]>();
  for (const combo of FACET_COMBINATION_INSIGHTS) {
    if (extremeByFacet.get(combo.facetA) !== combo.bandA) continue;
    if (extremeByFacet.get(combo.facetB) !== combo.bandB) continue;

    const domainA = FACET_INTERPRETATIONS[combo.facetA]?.domain;
    const domainB = FACET_INTERPRETATIONS[combo.facetB]?.domain;
    if (!domainA || !domainB) continue; // ukjent fasettkode -- ignorer defensivt

    // Samme domene -> vises der. Ulike domener -> vises under det som
    // kommer SIST i visningsrekkefølgen (se filhode).
    const placementDomain =
      domainA === domainB
        ? domainA
        : DOMAIN_DISPLAY_ORDER.indexOf(domainA) > DOMAIN_DISPLAY_ORDER.indexOf(domainB)
          ? domainA
          : domainB;

    const list = byDomain.get(placementDomain) ?? [];
    list.push(combo);
    byDomain.set(placementDomain, list);
  }

  return byDomain;
}
