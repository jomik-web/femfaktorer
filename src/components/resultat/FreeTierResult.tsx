import { RoughFactorIndicator } from "@/components/RoughFactorIndicator";
import { FactorHero } from "@/components/FactorHero";
import { FactorIcon } from "@/components/FactorIcon";
import { ShareCard } from "@/components/ShareCard";
import { GrowthSection } from "@/components/resultat/GrowthSection";
import {
  INTERPRETATIONS,
  DOMAIN_DEFINITIONS,
  bandFor,
  splitIntoParagraphs,
  type ClosingSynthesis,
} from "@/data/interpretations";
import type { FactorResult, FacetResult } from "@/lib/scoring";

/**
 * Gratisnivåets resultatvisning (50 spørsmål) -- ren visning, all data
 * (factors/closingFree/facets) er allerede beregnet av forelderen.
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx (som var 989 linjer og voksende) til egen fil, sammen
 * med DetailedResult.tsx/ClosingSummarySection.tsx/GrowthSection.tsx.
 * Bevisst "ingen atferdsendring, kun oppdeling" -- nøyaktig samme JSX som
 * lå i page.tsx sin `tier === "free"`-gren.
 */
export function FreeTierResult({
  factors,
  closingFree,
  facets,
}: {
  factors: FactorResult[];
  closingFree: ClosingSynthesis | null;
  facets: FacetResult[];
}) {
  return (
    <>
      <section className="flex flex-col gap-6">
        {factors.map((f) => (
          <RoughFactorIndicator key={f.factor} factor={f.factor} label={f.label} score={f.score} />
        ))}
      </section>

      <section className="flex flex-col gap-8">
        {factors.map((f) => {
          const copy = INTERPRETATIONS[f.factor][bandFor(f.score)];
          return (
            <article
              key={f.factor}
              className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <FactorHero factor={f.factor} className="-mx-5 -mt-5 w-[calc(100%+2.5rem)] max-w-none" />
              <div className="flex items-center gap-3">
                <FactorIcon factor={f.factor} size={40} />
                <h2 className="font-display font-semibold text-indigo dark:text-white">{f.label}</h2>
              </div>
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">{DOMAIN_DEFINITIONS[f.factor]}</p>
              <p className="text-indigo/80 dark:text-lavender-400/80">{copy.overview}</p>
              <p className="text-indigo/80 dark:text-lavender-400/80">{copy.nuance}</p>
              <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
              <div className="mt-3 flex flex-col gap-3 border-t border-indigo/10 pt-3 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-medium text-indigo dark:text-white">Skole og jobb</h3>
                  <p className="text-indigo/80 dark:text-lavender-400/80">{copy.careerNote}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-indigo dark:text-white">Kjærlighet</h3>
                  <p className="text-indigo/80 dark:text-lavender-400/80">{copy.relationshipNote}</p>
                  <p className="mt-1 text-indigo/80 dark:text-lavender-400/80">{copy.partnerNote}</p>
                </div>
              </div>
              {copy.growth && <GrowthSection growth={copy.growth} />}
              {copy.funFact && (
                <aside
                  className="mt-1 flex items-start gap-3 rounded-xl border border-dashed border-holo-sky/40 bg-white/50 p-3 print:hidden dark:bg-white/5"
                  aria-label="Humoristisk kommentar, ikke en del av selve tolkningen"
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    😄
                  </span>
                  <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
                    <span className="font-medium text-indigo dark:text-white">Kjenner du deg igjen?</span>{" "}
                    {copy.funFact}
                  </p>
                </aside>
              )}
            </article>
          );
        })}
      </section>

      {closingFree && (
        <section className="flex flex-col gap-3 rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display font-semibold text-indigo dark:text-white">Samlet sett</h2>
          {splitIntoParagraphs(closingFree.text).map((p, i) => (
            <p key={i} className="text-indigo/80 dark:text-lavender-400/80">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* v2.37/v2.38: delbart Spir-kort -- til slutt på rapporten, gjelder
          alle tre nivåer (produkteiers eksplisitte ønske 25.07.2026).
          `facets` er alltid tom for "free" her, så ShareCard faller
          automatisk tilbake til domenekortet. */}
      <ShareCard factors={factors} facets={facets} />
    </>
  );
}
