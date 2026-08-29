/**
 * Versjonsstempel for SPØRSMÅLSSETTET (v2.46, 31.07.2026).
 *
 * Bakgrunn: den anonyme forskningsinnsamlingen (se src/lib/research/) samler
 * svar på enkeltspørsmål for at leddstatistikk (svarfordeling per ledd,
 * ledd-total-korrelasjon, alfa per fasett) skal kunne regnes ut senere -- jf.
 * ITCs retningslinjer for løpende kvalitetskontroll av datastyrte tester.
 *
 * DETTE STEMPELET ER SELVE FORUTSETNINGEN FOR AT DE DATAENE ER BRUKBARE.
 * Endres teksten i et spørsmål, er svarene før og etter endringen svar på to
 * ULIKE spørsmål. Blandes de i samme analyse, blir resultatet meningsløst --
 * og verre: det ser ut som gyldige tall. Derfor stemples hver innsending med
 * hvilken utgave av spørsmålssettet den gjelder, slik at analysen kan skille
 * dem fra hverandre i ettertid.
 *
 * TO LAG, MED VILJE:
 *
 *  1. `QUESTION_SET_REVISION` -- et tall du selv setter opp. Dette er det
 *     som betyr noe rent faktisk: du bestemmer når en endring er stor nok
 *     til å utgjøre et nytt spørsmålssett.
 *
 *  2. `QUESTION_SET_FINGERPRINT` -- et kontrolltall regnet ut automatisk fra
 *     selve spørsmålstekstene. Det er der for å FANGE OPP at noen (inkludert
 *     meg) har endret en tekst uten å huske å øke revisjonsnummeret. Kommer
 *     det plutselig inn data med samme revisjon men nytt kontrolltall, vet du
 *     at noe har glidd -- se advarselen i adminpanelet.
 *
 * NÅR SKAL DU ØKE `QUESTION_SET_REVISION`?
 *  - Ja: spørsmålstekst endret, spørsmål lagt til/fjernet, `reverse` snudd.
 *  - Nei: rettskrivingsfeil i en kommentar, endret rekkefølge i filen,
 *    endringer som ikke berører hva respondenten faktisk leser.
 *
 * Ved tvil: øk. Kostnaden ved å dele et datasett i to unødvendig er lav.
 * Kostnaden ved å slå sammen to som ikke hører sammen, er at hele
 * leddanalysen blir feil uten at det synes.
 */
import { ALL_QUESTIONS_EXTENDED } from "@/data/questions";

/**
 * Økes manuelt ved reell endring i spørsmålssettet. Se filhodet.
 *
 * Revisjon 1 = spørsmålssettet slik det stod fra 19.07.2026 til 04.08.2026
 * (siste endring i questions.ts, commit 5bb6f80).
 *
 * Revisjon 2 = språkgjennomgangen påbegynt 04.08.2026. To ting skjedde:
 *
 *  a) ALLE 290 item har fått subjektet «Jeg». Engelsk IPIP er laget for å
 *     følge en innledning og tåler underforstått subjekt; norsk gjør ikke
 *     det, og «Bekymrer meg for ting» leste som et fragment. Rent mekanisk
 *     endring, ingen betydning er rørt. Unntaket er `n2_4`, der «Det skal
 *     mye til før jeg blir irritert» er valgt bevisst.
 *
 *  b) Nevrotisisme (60 item) er i tillegg gjennomgått innholdsmessig mot
 *     engelsk original og fasettdefinisjonene. Sju formuleringer er endret.
 *     Én av dem, «Overdriver sjelden» for `Rarely overindulge`, målte et
 *     annet begrep enn fasetten — svar på det item fra revisjon 1 kan derfor
 *     IKKE sammenlignes med revisjon 2.
 *
 * E, O, A og C er foreløpig kun endret språklig (punkt a), ikke innholdsmessig.
 * Hver kommende domenegjennomgang øker revisjonen på nytt.
 */
export const QUESTION_SET_REVISION = 2;

/**
 * FNV-1a, 32 bit. Valgt fordi den er kort, deterministisk og ikke krever noe
 * bibliotek -- dette er et kontrolltall for å oppdage utilsiktet endring,
 * ikke en kryptografisk sikring, og trenger ikke være kollisjonssikker mot
 * en angriper.
 */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // Multiplikasjon med FNV-primtallet 16777619, gjort med skift for å
    // holde seg innenfor 32 bit uten å miste presisjon.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Kontrolltall over alt respondenten faktisk ser og som påvirker skåringen:
 * id, norsk tekst og reverseringsflagg. Sortert på id slik at ren omrokering
 * i filen IKKE gir nytt kontrolltall -- bare reelle innholdsendringer gjør
 * det.
 *
 * Regnes ut én gang når modulen lastes. 290 spørsmål er så lite at kostnaden
 * er uten betydning.
 */
export const QUESTION_SET_FINGERPRINT: string = fnv1a(
  [...ALL_QUESTIONS_EXTENDED]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((q) => `${q.id}|${q.textNo}|${q.reverse ? "R" : "-"}`)
    .join("\n")
);

/**
 * Den sammensatte verdien som faktisk lagres med hver innsending, f.eks.
 * "1-3f2a91c4". Ett felt å sammenligne på, og begge lagene er lesbare i det.
 */
export const QUESTION_SET_VERSION = `${QUESTION_SET_REVISION}-${QUESTION_SET_FINGERPRINT}`;
