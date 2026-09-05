import { FACET_INTERPRETATIONS } from "@/data/facetInterpretations";
import { bandFor } from "@/data/interpretations";
import type { FacetResult } from "@/lib/scoring";

/**
 * Hva den ubetalte visningen IKKE viser (v2.65).
 *
 * HVORFOR DEN NAVNGIR INNHOLDET I STEDET FOR Å SLØRE DET
 * Produkteier foreslo en uskarp forhåndsvisning av den detaljerte rapporten.
 * Loewensteins informasjonsgap-teori taler mot: nysgjerrighet oppstår når man
 * blir klar over et gap i egen kunnskap, og «you can't be curious about
 * something you have absolutely no awareness of». Uleselig tekst gir ingen
 * kunnskap om hva som mangler -- bare en følelse av å bli holdt utenfor. Det
 * er irritasjon, ikke nysgjerrighet.
 *
 * Det som virker, er SPESIFIKK kunnskap om hva man går glipp av. Derfor
 * navngir denne komponenten brukerens faktisk mest utpregede underkategori
 * ved navn, og teller hvor mange som gjenstår. Gapet blir konkret: du vet
 * nøyaktig hva du ikke får vite.
 *
 * TONEN ER VIKTIG. Gratisrapporten skal føles hel, ikke amputert. Teksten
 * sier «dette er begynnelsen», ikke «dette er alt du får uten å betale».
 * Merker folk at noe er holdt tilbake for å presse dem, føler de seg
 * manipulert -- og da mister man både salget og deleviljen.
 *
 * MERK: dette er ikke en betalingsmur. Den finnes ikke ennå -- det er ingen
 * betalingsintegrasjon i kodebasen. Komponenten forteller hva som finnes,
 * uten å love når det kan kjøpes.
 */
export function LockedContentTeaser({
  facets,
  comboCount,
}: {
  facets: FacetResult[];
  comboCount: number;
}) {
  // Den mest utpregede underkategorien -- lengst fra midtpunktet, samme
  // utvelgelse som meme-kortene bruker. Er fasettdata ikke tilgjengelig,
  // faller vi tilbake til en tekst uten navn i stedet for å gjette.
  const mostDistinct = [...facets].sort(
    (a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50)
  )[0];
  const meta = mostDistinct ? FACET_INTERPRETATIONS[mostDistinct.facet] : undefined;
  const facetCount = facets.length;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/40 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
      <h2 className="font-display font-semibold text-indigo dark:text-white">
        Dette er begynnelsen
      </h2>

      {meta && mostDistinct ? (
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Under de fem hovedkategoriene ligger {facetCount} underkategorier. Din tydeligste er{" "}
          <strong className="font-medium text-indigo dark:text-white">{meta.textLabel}</strong> — den
          skiller seg mer ut enn noen av de andre, og forklarer mye av hvorfor{" "}
          {bandFor(mostDistinct.score) === "high" ? "denne siden ved deg" : "dette trekket"} slår ut
          som det gjør.
        </p>
      ) : (
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Under de fem hovedkategoriene ligger {facetCount} underkategorier som viser hva som
          faktisk driver skårene dine.
        </p>
      )}

      {comboCount > 0 && (
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Profilen din har også{" "}
          <strong className="font-medium text-indigo dark:text-white">
            {comboCount} samspill
          </strong>{" "}
          — steder der to trekk trekker i hver sin retning, eller forsterker hverandre. Det er ofte
          der det blir interessant.
        </p>
      )}

      <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
        Du har allerede svart på alt som trengs. Den detaljerte analysen bruker de samme svarene.
      </p>
    </section>
  );
}
