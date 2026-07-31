/**
 * Register over ferdige, AI-illustrerte "meme-kort" -- Spir i en
 * gjenkjennelig hverdagsscene, med sitat malt inn i selve bildet (gyllen
 * gradient-skrift) og en påført dinefasetter.no-footer. Produsert i batcher
 * utenfor kodebasen (se prosjektloggen/Dokumentbibliotek for ChatGPT-
 * promptene), lagt inn i public/meme-kort/ og registrert her.
 *
 * v1 (26.07.2026, produkteiers ønske): dette registeret er eneste kilde til
 * sannhet for HVILKE fasett+bånd-kombinasjoner som faktisk har et ferdig
 * kort -- `pickMemeCards` under viser ALDRI en kombinasjon som ikke står
 * her. Kun 11 av ~58 mulige fasett+bånd-kombinasjoner er dekket foreløpig;
 * flere legges til etter hvert som de produseres (se ShareCard.tsx for
 * fallback-oppførsel når ingen kort finnes for brukerens mest utpregede
 * fasetter -- eller når brukeren har gratis-tieren, som ikke har
 * fasettdata i det hele tatt).
 *
 * To formater lagres: `square` (1080x1080) og `story` (1080x1920). Bruk
 * ALDRI faste pixel-mål på disse i UI -- vis dem med naturlig aspect ratio
 * (height: auto), se ShareCard.tsx.
 *
 * v2.43 (Kvalitetsrevisjon 31.07.2026, kap. 3, lav alvorlighet): A3-high sitt
 * kvadrat-bilde var tidligere 1080x1190 (110px ekstra pga. en
 * footer-kollisjonsfiks -- se git-historikk) -- ga en liten, synlig
 * høydeforskjell når tre kandidatkort vises side ved side. Normalisert til
 * eksakt 1080x1080 ved en marginal (~9%) ikke-uniform skalering i høyden --
 * alt innhold (footer-bar inkludert) er bevart, ingenting beskåret. De to
 * andre kortene i samme kort-triplett var allerede korrekt 1080x1080/
 * 1080x1920, se identify-sjekk i git-historikk.
 *
 * v2.44 (Kvalitetsrevisjon 31.07.2026, kap. 4 funn 1 -- kryssreferert til
 * kap. 6 funn 1, "kritisk"/"høy"): alle 34 bildene lå som PNG (63,9 MB
 * totalt, enkeltfiler opptil 2,9 MB). Resultatsiden viser opptil 3
 * kandidatkort samtidig, så et førstegangsbesøk på mobildata kunne laste
 * ~7-8 MB før brukeren i det hele tatt ba om noe. Alle bildene er
 * konvertert til WebP (kvalitet ~82, samme 1080x1080/1080x1920-mål som før
 * -- ca. 93 % mindre, 63,9 MB -> 4,5 MB totalt). I TILLEGG er det generert
 * separate, mindre "thumbs" (480px bredde, kvalitet ~78, i
 * public/meme-kort/thumbs/) KUN til bruk i selve kandidat-velgeren --
 * selve del-/nedlastingsbildet bruker fortsatt full oppløsning (se
 * `memeCardThumbSrc` og bruken i ShareCard.tsx). Dette løser samtidig
 * kvalitetsrevisjonens kap. 6 funn 1 og 2 (bildestørrelse og manglende
 * lazy-loading) i praksis, siden det er nøyaktig samme bilder/kode.
 *
 * NB: de gamle .png-filene ligger fortsatt fysisk i public/meme-kort/ --
 * sandkassen jeg jobber i kunne ikke slette dem (samme
 * iCloud-synk-begrensning som er dokumentert andre steder i prosjektet for
 * git-lock-filer). Slett dem selv når du har verifisert at webp-versjonene
 * fungerer i nettleseren.
 */

import type { Band } from "@/data/interpretations";
import { bandFor } from "@/data/interpretations";
import type { DisplayFactor, FacetResult, FactorResult } from "@/lib/scoring";

/**
 * Utleder stien til den mindre "thumb"-varianten av et meme-kort-bilde
 * (480px bredde, se filhode) fra den registrerte full-oppløsnings-stien --
 * rent strengmanipulasjon, ingen egen registrering trengs siden ALLE
 * bildene i public/meme-kort/ har en thumb med identisk filnavn under
 * thumbs/-undermappen (se bash-konverteringsloggen i git-historikk).
 * Brukes KUN til den lille kandidat-velgeren i ShareCard.tsx -- selve
 * del-/nedlastingsbildet skal alltid bruke full oppløsning (`asset.square`/
 * `asset.story` direkte, ikke denne funksjonen).
 */
export function memeCardThumbSrc(fullSrc: string): string {
  const lastSlash = fullSrc.lastIndexOf("/");
  return `${fullSrc.slice(0, lastSlash)}/thumbs${fullSrc.slice(lastSlash)}`;
}

export interface MemeCardAsset {
  /** Sitatet malt inn i bildet -- vises som bildetekst/alt-tekst i UI-et. */
  quote: string;
  square: string;
  story: string;
  /**
   * v2 (26.07.2026, produkteiers ønske): valgfri liste over ANDRE
   * fasett+bånd-kombinasjoner som gjør scenen i DETTE kortet usannsynlig
   * for brukeren, selv om kortets EGEN fasett+bånd stemmer med skåren.
   * Oppdaget via konkret brukertilbakemelding: Ettergivenhet-høy-kortet
   * ("sa ja til alt, ingen anelse hva jeg egentlig ville") forutsetter
   * egentlig også LAV Overveielse (man tenker seg ikke om før man sier ja)
   * -- for en bruker som samtidig er høy på Overveielse motsier scenen seg
   * selv, selv om ettergivenheten stemmer.
   *
   * Kun brukt der vitsens PREMISS strukturelt krever en bestemt retning på
   * en annen fasett (ikke der det bare er én av flere mulige, like
   * plausible varianter av trekket) -- se `pickMemeCards` under for hvordan
   * dette faktisk filtreres bort. Ikke alle kort har (eller trenger) denne
   * -- de fleste illustrerer sin egen fasett uten å låne fra en annen.
   */
  conflictsIfFacetIs?: { facet: string; band: Band }[];
}

type MemeCardRegistry = Record<string, Partial<Record<Band, MemeCardAsset>>>;

export const MEME_CARDS: MemeCardRegistry = {
  N1: {
    low: {
      quote: "Har allerede planlagt reaksjonen min på ting som aldri kommer til å skje.",
      square: "/meme-kort/N1-low-square.webp",
      story: "/meme-kort/N1-low-story.webp",
    },
  },
  N2: {
    // v1 (26.07.2026) plasserte dette kortet feilaktig under "high" -- selve
    // scenen (Spir tydelig irritert/på grensen) er en lav-Irritabilitet/
    // sindighet-skildring (kort lunte), ikke høy (høy = uforstyrrelig ro,
    // se facetInterpretations.ts N2.high). Rettet 26.07.2026 etter at en
    // bruker med N2=100 (høyeste mulige "sindighet") fikk vist dette kortet
    // og påpekte at det ikke stemte -- filene er også omdøpt til -low i
    // public/meme-kort/. Et ekte "urokkelig rolig under kaos"-kort for
    // high-båndet er ikke produsert ennå.
    low: {
      quote: "Alt er fint. ALT er fint. Spør meg ikke igjen.",
      square: "/meme-kort/N2-low-square.webp",
      story: "/meme-kort/N2-low-story.webp",
    },
  },
  N5: {
    low: {
      quote: "Handlekurven min er full av ting jeg bare 'skulle se på'.",
      square: "/meme-kort/N5-low-square.webp",
      story: "/meme-kort/N5-low-story.webp",
    },
  },
  E1: {
    high: {
      quote: "Har kjent deg i tre minutter. Du er nå familie.",
      square: "/meme-kort/E1-high-square.webp",
      story: "/meme-kort/E1-high-story.webp",
      // Å klemme/åpne seg for en fremmed etter tre minutter forutsetter en
      // grunnleggende tillit til folk -- usannsynlig for noen med lav Tillit.
      conflictsIfFacetIs: [{ facet: "A1", band: "low" }],
    },
  },
  E2: {
    low: {
      quote: "En rolig kveld under pleddet slår et selskap med 100 mennesker. Hver eneste gang.",
      square: "/meme-kort/E2-low-square.webp",
      story: "/meme-kort/E2-low-story.webp",
    },
  },
  E4: {
    low: {
      quote: "Rakk å tenke på å trene i dag. Det teller, ikke sant?",
      square: "/meme-kort/E4-low-square.webp",
      story: "/meme-kort/E4-low-story.webp",
    },
  },
  E5: {
    high: {
      quote: "Sa ja før jeg i det hele tatt hørte hva planen var.",
      square: "/meme-kort/E5-high-square.webp",
      story: "/meme-kort/E5-high-story.webp",
      // Å si ja før man har hørt planen forutsetter at man IKKE tenker
      // gjennom konsekvenser før man handler -- motsier høy Overveielse.
      conflictsIfFacetIs: [{ facet: "C6", band: "high" }],
    },
  },
  O1: {
    high: {
      quote: "Jeg er visstnok fysisk til stede -- resten av meg er et helt annet sted.",
      square: "/meme-kort/O1-high-square.webp",
      story: "/meme-kort/O1-high-story.webp",
    },
  },
  O4: {
    low: {
      quote: "Prøvde noe nytt en gang. Bestilte det samme igjen neste dag.",
      square: "/meme-kort/O4-low-square.webp",
      story: "/meme-kort/O4-low-story.webp",
    },
  },
  O5: {
    high: {
      quote: "Skulle bare slå opp én ting. Det var to timer og elleve faner siden.",
      square: "/meme-kort/O5-high-square.webp",
      story: "/meme-kort/O5-high-story.webp",
    },
  },
  A3: {
    high: {
      quote: "Noens problem blir automatisk mitt problem. Alltid. Uten unntak.",
      square: "/meme-kort/A3-high-square.webp",
      story: "/meme-kort/A3-high-story.webp",
    },
  },
  A4: {
    high: {
      quote: "Sa ja til alt i dag. Har ingen anelse hva jeg egentlig ville.",
      square: "/meme-kort/A4-high-square.webp",
      story: "/meme-kort/A4-high-story.webp",
      // Oppdaget via brukertilbakemelding 26.07.2026: "ingen anelse hva jeg
      // egentlig ville" forutsetter lav Overveielse (ingen gjennomtenkning
      // før man sier ja) -- motsier høy Overveielse, selv om ettergivenheten
      // i seg selv stemmer.
      conflictsIfFacetIs: [{ facet: "C6", band: "high" }],
    },
  },
  A5: {
    high: {
      quote: "Vant prisen. Sa det var 'egentlig bare flaks og gode kollegaer'.",
      square: "/meme-kort/A5-high-square.webp",
      story: "/meme-kort/A5-high-story.webp",
    },
  },
  C2: {
    high: {
      quote: "Skapet mitt er fargekodet og sortert etter type. Bare hyggelig at du spurte.",
      square: "/meme-kort/C2-high-square.webp",
      story: "/meme-kort/C2-high-story.webp",
    },
  },
  C5: {
    low: {
      quote: "I morgen begynner jeg. Har sagt det i tre uker.",
      square: "/meme-kort/C5-low-square.webp",
      story: "/meme-kort/C5-low-story.webp",
    },
  },
  C3: {
    high: {
      quote: "Syk med 39 i feber. Leverte rapporten en dag før frist likevel.",
      square: "/meme-kort/C3-high-square.webp",
      story: "/meme-kort/C3-high-story.webp",
    },
  },
  C6: {
    high: {
      quote: "Brukte 40 minutter på å velge middag. Spiste til slutt en brødskive.",
      square: "/meme-kort/C6-high-square.webp",
      story: "/meme-kort/C6-high-story.webp",
    },
  },
};

export interface MemeCardCandidate {
  facet: FacetResult;
  band: Band;
  asset: MemeCardAsset;
  distanceFromMid: number;
}

/**
 * Plukker de N fasettene (standard 3, produkteiers ønske 26.07.2026) som
 * ligger lengst fra midtpunktet 50 blant brukerens fasettskår, MEN kun
 * blant fasett+bånd-kombinasjoner som faktisk har et ferdig meme-kort (se
 * MEME_CARDS over). En fasett med "mid"-bånd har aldri et kort (vi
 * produserer bevisst kun tydelige low/high-varianter -- en midt-på-treet-
 * skår er ikke "meme-bar"), og filtreres derfor automatisk bort her.
 *
 * v2 (26.07.2026, produkteiers ønske etter konkret brukertilbakemelding):
 * sjekker i tillegg hvert kort sin `conflictsIfFacetIs` mot brukerens FULLE
 * fasettprofil -- ikke bare den ene fasetten kortet selv representerer.
 * Et kort hvis premiss motsier en annen, tydelig fasett hos brukeren (f.eks.
 * et "sa ja uten å tenke meg om"-kort for noen med svært høy Overveielse)
 * blir aldri foreslått, selv om kortets EGEN fasett+bånd stemmer.
 *
 * Returnerer færre enn `maxCount` kandidater (også 0) dersom brukerens mest
 * utpregede fasetter ennå ikke har et produsert kort, eller alle treff er
 * filtrert bort av en konflikt -- kalleren (ShareCard.tsx) håndterer det
 * tilfellet med en fallback.
 */
export function pickMemeCards(facets: FacetResult[], maxCount = 3): MemeCardCandidate[] {
  const bandByFacet = new Map<string, Band>(facets.map((f) => [f.facet, bandFor(f.score)]));

  const candidates: MemeCardCandidate[] = [];
  for (const facet of facets) {
    const band = bandFor(facet.score);
    const asset = MEME_CARDS[facet.facet]?.[band];
    if (!asset) continue;

    const hasConflict = (asset.conflictsIfFacetIs ?? []).some(
      (c) => bandByFacet.get(c.facet) === c.band
    );
    if (hasConflict) continue;

    candidates.push({ facet, band, asset, distanceFromMid: Math.abs(facet.score - 50) });
  }
  candidates.sort((a, b) => b.distanceFromMid - a.distanceFromMid);
  return candidates.slice(0, maxCount);
}

/**
 * Register over domenenivå-meme-kort (v3.0, produkteiers ønske 27.07.2026).
 * Gratis-tieren (50 spørsmål) har ALDRI fasettdata -- kun de fem
 * hovedkategori-skårene -- så `pickMemeCards` over returnerer alltid tomt
 * for disse brukerne. Dette registeret dekker samme 5 hovedkategorier x
 * 2 bånd (10 kombinasjoner totalt, "mid"-bånd er bevisst ikke meme-bart,
 * se samme resonnement som MEME_CARDS over), med sitater skrevet BREDT nok
 * til å dekke hele hovedkategorien -- IKKE låst til én enkelt fasett-nyanse
 * slik de fasettspesifikke kortene over er. Ingen `conflictsIfFacetIs` her:
 * uten fasettdata har vi ingenting å sjekke konflikten mot.
 *
 * Bildene er IKKE produsert ennå (se
 * Dokumentbibliotek/Spir_meme-kort_batch5_domenekort_ChatGPT-prompts.md for
 * ferdige ChatGPT-prompter) -- stiene under er placeholder og peker til
 * filer som ikke finnes i public/meme-kort/ ennå. `pickDomainMemeCard`
 * returnerer likevel kandidater basert på disse placeholder-stiene; det er
 * ShareCard.tsx sitt ansvar å falle videre tilbake til det gamle
 * SVG-domenekortet dersom bildet faktisk 404-er (se `onError` der).
 */
export const DOMAIN_MEME_CARDS: Partial<Record<DisplayFactor, Partial<Record<Band, MemeCardAsset>>>> = {
  stability: {
    high: {
      quote: "Ingenting er egentlig en krise. De fleste ting ordner seg med litt tid.",
      square: "/meme-kort/domain-stability-high-square.webp",
      story: "/meme-kort/domain-stability-high-story.webp",
    },
    low: {
      quote: "Ett lite uheldig blikk fra noen, og hele dagen er plutselig ødelagt.",
      square: "/meme-kort/domain-stability-low-square.webp",
      story: "/meme-kort/domain-stability-low-story.webp",
    },
  },
  extraversion: {
    high: {
      quote: "Kom for å hente melk. Ble stående og prate med tre fremmede i butikken.",
      square: "/meme-kort/domain-extraversion-high-square.webp",
      story: "/meme-kort/domain-extraversion-high-story.webp",
    },
    low: {
      quote: "Sa jeg skulle bli en halvtime. Dro etter ti minutter. Ingen sa noe -- alle forsto.",
      square: "/meme-kort/domain-extraversion-low-square.webp",
      story: "/meme-kort/domain-extraversion-low-story.webp",
    },
  },
  openness: {
    high: {
      quote: "Ny by, ny meny, ny vei hjem. Det kjente er sjelden det jeg velger først.",
      square: "/meme-kort/domain-openness-high-square.webp",
      story: "/meme-kort/domain-openness-high-story.webp",
    },
    low: {
      quote: "Samme frokost. Samme rute. Samme alt. Sånn liker jeg det aller best.",
      square: "/meme-kort/domain-openness-low-square.webp",
      story: "/meme-kort/domain-openness-low-story.webp",
    },
  },
  agreeableness: {
    high: {
      quote: "Endte opp med å hjelpe en fremmed flytte en sofa. Fortsatt ikke helt sikker på hvordan.",
      square: "/meme-kort/domain-agreeableness-high-square.webp",
      story: "/meme-kort/domain-agreeableness-high-story.webp",
    },
    low: {
      quote: "Så ingen god grunn til å la noen andre få det siste ordet. Så jeg gjorde ikke det.",
      square: "/meme-kort/domain-agreeableness-low-square.webp",
      story: "/meme-kort/domain-agreeableness-low-story.webp",
    },
  },
  conscientiousness: {
    high: {
      quote: "Pakket sekken kvelden før. Dobbeltsjekket den to ganger til, for sikkerhets skyld.",
      square: "/meme-kort/domain-conscientiousness-high-square.webp",
      story: "/meme-kort/domain-conscientiousness-high-story.webp",
    },
    low: {
      quote: "Planen var løs fra start. Den ble bare enda løsere etter hvert som dagen gikk.",
      square: "/meme-kort/domain-conscientiousness-low-square.webp",
      story: "/meme-kort/domain-conscientiousness-low-story.webp",
    },
  },
};

export interface DomainMemeCardCandidate {
  factor: FactorResult;
  band: Band;
  asset: MemeCardAsset;
}

/**
 * Velger ETT domenenivå-kort -- den hovedkategorien som ligger lengst fra
 * midtpunktet 50 (mest "utpreget"), forutsatt at bånd og hovedkategori
 * faktisk har et kort i DOMAIN_MEME_CARDS. Brukes KUN som fallback når
 * `pickMemeCards` ikke fant noe (typisk: gratis-tieren, som mangler
 * fasettdata helt) -- se MemeShareCard i ShareCard.tsx.
 */
export function pickDomainMemeCard(factors: FactorResult[]): DomainMemeCardCandidate | null {
  const candidates: DomainMemeCardCandidate[] = [];
  for (const factor of factors) {
    const band = bandFor(factor.score);
    const asset = DOMAIN_MEME_CARDS[factor.factor]?.[band];
    if (!asset) continue;
    candidates.push({ factor, band, asset });
  }
  candidates.sort((a, b) => Math.abs(b.factor.score - 50) - Math.abs(a.factor.score - 50));
  return candidates[0] ?? null;
}
