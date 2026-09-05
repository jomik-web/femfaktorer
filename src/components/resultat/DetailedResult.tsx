import { RoughFactorIndicator } from "@/components/RoughFactorIndicator";
import { FactorHero } from "@/components/FactorHero";
import { FactorIcon } from "@/components/FactorIcon";
import { GrowthSection } from "@/components/resultat/GrowthSection";
import { ClosingSummarySection } from "@/components/resultat/ClosingSummarySection";
import type { Domain } from "@/data/questions";
import {
  INTERPRETATIONS,
  DOMAIN_DEFINITIONS,
  bandFor,
  splitIntoParagraphs,
  type ClosingSynthesis,
} from "@/data/interpretations";
import { FACET_INTERPRETATIONS, FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";
import { buildFacetDrivenOverview, buildFacetAwareNote, buildTopFacetsMention } from "@/data/domainComposition";
import type { CombinationInsight, FacetCombinationInsight } from "@/data/combinationInsights";
import { DOMAIN_TO_DISPLAY, type DisplayFactor, type FacetResult, type FactorResult, type ResultTier } from "@/lib/scoring";

const DISPLAY_TO_DOMAIN: Record<DisplayFactor, Domain> = Object.fromEntries(
  (Object.entries(DOMAIN_TO_DISPLAY) as [Domain, DisplayFactor][]).map(([domain, display]) => [display, domain])
) as Record<DisplayFactor, Domain>;

// Aktiv fane-pille (alternativ C, godkjent): fylt i faktorens EGEN farge i
// stedet for den generiske holo-gradienten -- statiske klassenavn kreves for
// at Tailwinds JIT-skanner skal finne dem (samme mønster som FactorIcon.tsx).
const FACTOR_BG: Record<DisplayFactor, string> = {
  openness: "bg-factor-openness",
  conscientiousness: "bg-factor-conscientiousness",
  extraversion: "bg-factor-extraversion",
  agreeableness: "bg-factor-agreeableness",
  stability: "bg-factor-stability",
};

/**
 * Den detaljerte resultatvisningen -- delt av "full" (120 spm) og "extended"
 * (290 spm), som deler nesten hele visningen (fasetter, samspill,
 * fane-navigasjon per hovedkategori). Kun noen få steder skiller genuint
 * mellom de to nivåene (se `tier ===`-sjekkene inni).
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx (som var 989 linjer og voksende, kategori 5-funn i
 * kvalitetsrevisjonen: "Trekk ut FreeTierResult, DetailedResult,
 * ClosingSection m.fl. som egne komponentfiler -- ingen atferdsendring, kun
 * oppdeling"). All state (activeFactor) og forhåndsberegnet data
 * (domainCombosByDomain/facetCombosByDomain/closing) kommer inn som props
 * fra ResultatContent, som fortsatt eier selve state-et og datauthentingen.
 */
export function DetailedResult({
  factors,
  facets,
  tier,
  activeFactor,
  setActiveFactor,
  closing,
  domainCombosByDomain,
  facetCombosByDomain,
}: {
  factors: FactorResult[];
  facets: FacetResult[];
  tier: ResultTier | null;
  activeFactor: DisplayFactor | "summary" | null;
  setActiveFactor: (factor: DisplayFactor | "summary") => void;
  closing: ClosingSynthesis | null;
  domainCombosByDomain: Map<Domain, CombinationInsight[]>;
  facetCombosByDomain: Map<Domain, FacetCombinationInsight[]>;
}) {
  return (
    <>
      {/* v2.36 (produkteiers ønske 24.07.2026): samme samlede oversikt
          over alle fem hovedfaktorene som gratis-tieren viser øverst --
          ga tidligere bare ÉN faktor om gangen inni fane-visningen under,
          uten et helhetsbilde før man begynner å bla i fanene. */}
      <section className="flex flex-col gap-6">
        {factors.map((f) => (
          <RoughFactorIndicator key={f.factor} factor={f.factor} label={f.label} score={f.score} />
        ))}
      </section>

      <nav className="flex flex-wrap gap-2 print:hidden" aria-label="Velg hvilken hovedkategori som vises">
        {factors.map((f) => (
          <button
            key={f.factor}
            type="button"
            onClick={() => setActiveFactor(f.factor)}
            aria-current={activeFactor === f.factor ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFactor === f.factor
                ? `${FACTOR_BG[f.factor]} text-white shadow-sm`
                : "bg-lavender-100 text-indigo hover:bg-lavender-400/40 dark:bg-white/10 dark:text-lavender-400 dark:hover:bg-white/20"
            }`}
          >
            <FactorIcon factor={f.factor} size={18} />
            {f.label}
          </button>
        ))}
        {closing && (
          <button
            type="button"
            onClick={() => setActiveFactor("summary")}
            aria-current={activeFactor === "summary" ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFactor === "summary"
                ? "bg-indigo text-white shadow-sm dark:bg-white dark:text-indigo"
                : "bg-lavender-100 text-indigo hover:bg-lavender-400/40 dark:bg-white/10 dark:text-lavender-400 dark:hover:bg-white/20"
            }`}
          >
            Oppsummering
          </button>
        )}
      </nav>

      {factors.map((f) => {
        const isActive = f.factor === activeFactor;
        const domain = DISPLAY_TO_DOMAIN[f.factor];
        const band = bandFor(f.score);
        const copy = INTERPRETATIONS[f.factor][band];
        const order = FACET_ORDER_BY_DOMAIN[domain];
        const facetsForDomain = order
          .map((code) => facets.find((fa) => fa.facet === code))
          .filter((fa): fa is FacetResult => fa !== undefined);
        // Fallback for hovedkategorier som ennå ikke har fått ny
        // `synthesis`-tekst (v2.17-utrulling, se interpretations.ts).
        const facetDrivenOverview = buildFacetDrivenOverview(f.factor, domain, f.score, facetsForDomain);
        // v2.18: gjenreist fasettbevissthet -- nevner hvilke(n)
        // underkategori(er) som driver hovedkategoriskåren, som en
        // egen linje i tillegg til (ikke i stedet for) synthesis-teksten.
        // v2.36: Standard (120) får en enklere, tre-fasetters variant
        // uten "premium"-signatureksemplene -- se domainComposition.ts.
        const facetAwareNote =
          tier === "extended"
            ? buildFacetAwareNote(f.factor, f.score, facetsForDomain)
            : tier === "full"
              ? buildTopFacetsMention(facetsForDomain)
              : "";
        const domainCombos: CombinationInsight[] = domainCombosByDomain.get(domain) ?? [];
        const facetCombos: FacetCombinationInsight[] = facetCombosByDomain.get(domain) ?? [];
        // Ny struktur (domenedefinisjon -> fasetter -> én sammenhengende
        // analyse) vises KUN når hovedkategorien har fått sin nye
        // `synthesis`-tekst -- inntil da vises den gamle strukturen
        // uendret, slik at ingen kategori ser ufullstendig ut midt i
        // utrullingen. Se interpretations.ts filhode.
        const useNewLayout = Boolean(copy.synthesis);

        return (
          <section
            key={f.factor}
            className={`flex flex-col gap-8 ${isActive ? "" : "hidden print:flex"}`}
            aria-hidden={!isActive}
          >
            <div className="flex flex-col gap-3">
              <FactorHero factor={f.factor} className="w-full rounded-2xl" />
              <div className="flex items-center gap-3">
                <FactorIcon factor={f.factor} size={56} />
                <h2 className="font-display text-3xl font-bold text-indigo dark:text-white sm:text-4xl">
                  {f.label}
                </h2>
              </div>
              <RoughFactorIndicator factor={f.factor} label={f.label} score={f.score} />
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">{DOMAIN_DEFINITIONS[f.factor]}</p>
            </div>

            {/* v2.36: selve fasettlisten/-grafene er en Premium/Utvidet-
                eksklusiv (se /priser) -- Standard (120) beregner nå
                facetsForDomain internt (se ResultatContent), men skal
                ikke vise denne seksjonen, kun den kortere
                facetAwareNote-setningen lenger ned. */}
            {tier === "extended" && facetsForDomain.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-semibold text-indigo dark:text-white">Underkategorier</h3>
                <div className="flex flex-col gap-5">
                  {facetsForDomain.map((fa) => {
                    const meta = FACET_INTERPRETATIONS[fa.facet];
                    const facetBand = bandFor(fa.score);
                    return (
                      <div key={fa.facet} className="flex flex-col gap-1.5">
                        <RoughFactorIndicator factor={f.factor} label={meta?.label ?? fa.facet} score={fa.score} />
                        {meta?.description && (
                          <p className="text-xs italic text-indigo/50 dark:text-lavender-400/50">
                            {meta.description}
                          </p>
                        )}
                        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
                          {facetInterpretationFor(fa.facet, facetBand)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {facetCombos.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {facetCombos.map((c) => (
                      <article
                        key={c.id}
                        className="flex flex-col gap-1.5 rounded-xl border border-lavender-400/20 bg-lavender-100/50 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                      >
                        <h4 className="text-sm font-semibold text-indigo dark:text-white">{c.title}</h4>
                        <p className="text-sm text-indigo/80 dark:text-lavender-400/80">{c.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {useNewLayout ? (
              <article className="flex flex-col gap-3 rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                {splitIntoParagraphs(copy.synthesis!).map((p, i) => (
                  <p key={i} className="text-indigo/80 dark:text-lavender-400/80">
                    {p}
                  </p>
                ))}
                {facetAwareNote && <p className="text-indigo/80 dark:text-lavender-400/80">{facetAwareNote}</p>}
                <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
                {/* v2.33: Standard-nivået (120) har ingen underkategorier å
                    vise til, så jobb/kjærlighet-notatene (som gratis-tieren
                    allerede har) tas med her også -- det er nettopp "de
                    flere momentene" som skiller Standard fra gratisnivået. */}
                {tier === "full" && (
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
                )}
                {copy.growth && <GrowthSection growth={copy.growth} />}
              </article>
            ) : (
              <article className="flex flex-col gap-3 rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-indigo/80 dark:text-lavender-400/80">{facetDrivenOverview}</p>
                <p className="text-indigo/80 dark:text-lavender-400/80">{copy.nuance}</p>
                <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
                <div className="mt-3 flex flex-col gap-3 border-t border-indigo/10 pt-3 dark:border-white/10">
                  <div>
                    <h3 className="text-sm font-medium text-indigo dark:text-white">I skole og jobb</h3>
                    <p className="text-indigo/80 dark:text-lavender-400/80">{copy.careerNote}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo dark:text-white">I relasjoner</h3>
                    <p className="text-indigo/80 dark:text-lavender-400/80">{copy.relationshipNote}</p>
                  </div>
                </div>
                {copy.growth && <GrowthSection growth={copy.growth} />}
              </article>
            )}

            {copy.funFact && (
              <aside
                className="flex items-start gap-3 rounded-2xl border border-dashed border-holo-sky/40 bg-white/50 p-4 print:hidden dark:bg-white/5"
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

            {domainCombos.length > 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-display font-semibold text-indigo dark:text-white">Spennende samspill</h3>
                  <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                    Noen kombinasjoner av hovedfaktorer gir kjente, godt dokumenterte mønstre. Her er
                    de som passer med resultatet ditt.
                  </p>
                </div>
                {domainCombos.map((c) => (
                  <article
                    key={c.id}
                    className="flex flex-col gap-2 rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <h4 className="font-display font-semibold text-indigo dark:text-white">{c.title}</h4>
                    <p className="text-indigo/80 dark:text-lavender-400/80">{c.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <ClosingSummarySection closing={closing} activeFactor={activeFactor} tier={tier} />

    </>
  );
}
