"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, FREE_QUESTIONS, OPTIONAL_O6_QUESTIONS, type Domain } from "@/data/questions";
import {
  computeTestResult,
  computeOptionalO6Score,
  computeFacetResults,
  DOMAIN_TO_DISPLAY,
  type FactorResult,
  type FacetResult,
  type ResultTier,
  type DisplayFactor,
} from "@/lib/scoring";
import { loadAnswers, clearAnswers, loadO6, clearO6 } from "@/lib/storage";
import { FactorScale } from "@/components/FactorScale";
import { RoughFactorIndicator } from "@/components/RoughFactorIndicator";
import { INTERPRETATIONS, NON_DIAGNOSTIC_NOTICE, bandFor, buildClosingSynthesis } from "@/data/interpretations";
import { FACET_INTERPRETATIONS, FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";
import {
  matchCombinationInsightsByDomain,
  matchFacetCombinationInsights,
  type CombinationInsight,
  type FacetCombinationInsight,
} from "@/data/combinationInsights";

const DISPLAY_TO_DOMAIN: Record<DisplayFactor, Domain> = Object.fromEntries(
  (Object.entries(DOMAIN_TO_DISPLAY) as [Domain, DisplayFactor][]).map(([domain, display]) => [display, domain])
) as Record<DisplayFactor, Domain>;

export default function ResultatPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [tier, setTier] = useState<ResultTier | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [o6Score, setO6Score] = useState<number | null>(null);
  // Hvilken hovedkategori-"side" som vises for den fulle testen (v2.3,
  // produkteiers ønske om å dele opp rapporten i én side per hovedkategori
  // i stedet for alt på én lang side).
  const [activeFactor, setActiveFactor] = useState<DisplayFactor | null>(null);

  useEffect(() => {
    const stored = loadAnswers();
    // Prøv det spørsmålssettet brukeren faktisk er inne i (jf. testflyten):
    // har de valgt å fortsette forbi 50, sjekk mot alle 120 -- ellers mot de
    // første 50 (det foreløpige, gratis resultatet).
    const questionSet = stored.continuedToFull ? ALL_QUESTIONS : FREE_QUESTIONS;
    const resultTier: ResultTier = stored.continuedToFull ? "full" : "free";
    const result = computeTestResult(stored.answers, questionSet, resultTier);
    if (result.complete && result.factors) {
      setFactors(result.factors);
      setTier(result.tier ?? resultTier);
      // Fasettskår (underkategorier) er kun meningsfulle -- og kun vist -- for
      // den fulle testen (v2.1, se scoring.ts computeFacetResults).
      if (resultTier === "full") {
        setFacets(computeFacetResults(stored.answers, questionSet));
      }
    } else {
      setIncomplete(true);
    }

    // O6-tilleggsseksjonen (helt valgfri, se questions.ts) -- vises KUN
    // dersom brukeren aktivt har samtykket og fullført den, og ALDRI blandet
    // inn i de fem hovedfaktorene over.
    const storedO6 = loadO6();
    setO6Score(computeOptionalO6Score(storedO6.answers, OPTIONAL_O6_QUESTIONS));

    setHydrated(true);
  }, []);

  // Sett første fane som aktiv så snart resultatet er klart.
  useEffect(() => {
    if (factors && !activeFactor) setActiveFactor(factors[0]?.factor ?? null);
  }, [factors, activeFactor]);

  if (!hydrated) return null;

  if (incomplete || !factors) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white">
          Vi fant ikke et fullført resultat
        </h1>
        <p className="text-ink/70 dark:text-warmgray/70">
          Det kan hende testen ikke er fullført ennå, eller at lagrede svar er slettet.
        </p>
        <Link href="/test" className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white">
          Gå til testen
        </Link>
      </main>
    );
  }

  function handleDelete() {
    clearAnswers();
    clearO6();
    window.location.href = "/";
  }

  function handleDeleteO6() {
    clearO6();
    setO6Score(null);
  }

  // Kombinasjonsfunn (både hovedfaktor- og fasettnivå) gruppert etter hvilket
  // hoveddomene de skal vises under -- se plasseringsregelen i
  // data/combinationInsights.ts (samme domene -> der; ulike domener -> under
  // det som kommer sist i visningsrekkefølgen).
  const domainCombosByDomain: Map<Domain, CombinationInsight[]> =
    tier === "full"
      ? matchCombinationInsightsByDomain(factors, bandFor, DISPLAY_TO_DOMAIN)
      : new Map<Domain, CombinationInsight[]>();
  const facetCombosByDomain: Map<Domain, FacetCombinationInsight[]> =
    tier === "full" ? matchFacetCombinationInsights(facets, bandFor) : new Map<Domain, FacetCombinationInsight[]>();
  const closing = tier === "full" ? buildClosingSynthesis(factors) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-12 print:max-w-none">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
            Din profil
          </h1>
          {tier === "full" && (
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-teal px-4 py-2 text-sm font-medium text-teal print:hidden"
            >
              Last ned som PDF
            </button>
          )}
        </div>
        <p className="text-sm text-ink/70 dark:text-warmgray/70">{NON_DIAGNOSTIC_NOTICE}</p>
        {tier === "free" && (
          <p className="text-sm text-ink/60 dark:text-warmgray/60">
            Dette er et foreløpig resultat, basert på de første 50 av 120 spørsmål.
          </p>
        )}
      </header>

      {tier === "free" && (
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
                <article key={f.factor} className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
                  <h2 className="font-semibold text-ink dark:text-white">{f.label}</h2>
                  <p className="text-ink/80 dark:text-warmgray/80">{copy.overview}</p>
                  <p className="text-ink/80 dark:text-warmgray/80">{copy.nuance}</p>
                  <p className="mt-2 text-ink/80 dark:text-warmgray/80">{copy.reflection}</p>
                </article>
              );
            })}
          </section>
        </>
      )}

      {tier === "full" && (
        <>
          <nav
            className="flex flex-wrap gap-2 print:hidden"
            aria-label="Velg hvilken hovedkategori som vises"
          >
            {factors.map((f) => (
              <button
                key={f.factor}
                type="button"
                onClick={() => setActiveFactor(f.factor)}
                aria-current={activeFactor === f.factor ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFactor === f.factor
                    ? "bg-teal text-white"
                    : "bg-warmgray text-ink hover:bg-warmgray/70 dark:bg-white/10 dark:text-warmgray dark:hover:bg-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </nav>

          {factors.map((f) => {
              const isActive = f.factor === activeFactor;
              const domain = DISPLAY_TO_DOMAIN[f.factor];
              const copy = INTERPRETATIONS[f.factor][bandFor(f.score)];
              const order = FACET_ORDER_BY_DOMAIN[domain];
              const facetsForDomain = order
                .map((code) => facets.find((fa) => fa.facet === code))
                .filter((fa): fa is FacetResult => fa !== undefined);
              const domainCombos: CombinationInsight[] = domainCombosByDomain.get(domain) ?? [];
              const facetCombos: FacetCombinationInsight[] = facetCombosByDomain.get(domain) ?? [];
              const hasCombos = domainCombos.length > 0 || facetCombos.length > 0;

              return (
                <section
                  key={f.factor}
                  className={`flex flex-col gap-8 ${isActive ? "" : "hidden print:flex"}`}
                  aria-hidden={!isActive}
                >
                  <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-bold text-ink dark:text-white sm:text-4xl">{f.label}</h2>
                    <FactorScale factor={f.factor} label={f.label} score={f.score} />
                  </div>

                  <article className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
                    <p className="text-ink/80 dark:text-warmgray/80">{copy.overview}</p>
                    <p className="text-ink/80 dark:text-warmgray/80">{copy.nuance}</p>
                    <p className="mt-2 text-ink/80 dark:text-warmgray/80">{copy.reflection}</p>
                    <div className="mt-3 flex flex-col gap-3 border-t border-ink/10 pt-3 dark:border-white/10">
                      <div>
                        <h3 className="text-sm font-medium text-ink dark:text-white">I jobbsammenheng</h3>
                        <p className="text-ink/80 dark:text-warmgray/80">{copy.careerNote}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ink dark:text-white">I relasjoner</h3>
                        <p className="text-ink/80 dark:text-warmgray/80">{copy.relationshipNote}</p>
                      </div>
                    </div>
                  </article>

                  {facetsForDomain.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="font-semibold text-ink dark:text-white">Underkategorier</h3>
                      <div className="flex flex-col gap-5">
                        {facetsForDomain.map((fa) => {
                          const meta = FACET_INTERPRETATIONS[fa.facet];
                          const band = bandFor(fa.score);
                          return (
                            <div key={fa.facet} className="flex flex-col gap-1.5">
                              <FactorScale factor={f.factor} label={meta?.label ?? fa.facet} score={fa.score} />
                              <p className="text-sm text-ink/70 dark:text-warmgray/70">
                                {facetInterpretationFor(fa.facet, band)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {hasCombos && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-semibold text-ink dark:text-white">Spennende samspill</h3>
                        <p className="text-sm text-ink/60 dark:text-warmgray/60">
                          Noen kombinasjoner av faktorer og underkategorier gir kjente, godt dokumenterte
                          mønstre. Her er de som passer med resultatet ditt.
                        </p>
                      </div>
                      {domainCombos.map((c) => (
                        <article
                          key={c.id}
                          className="flex flex-col gap-2 rounded-lg bg-mint/50 p-5 dark:bg-white/5"
                        >
                          <h4 className="font-semibold text-ink dark:text-white">{c.title}</h4>
                          <p className="text-ink/80 dark:text-warmgray/80">{c.text}</p>
                        </article>
                      ))}
                      {facetCombos.map((c) => (
                        <article
                          key={c.id}
                          className="flex flex-col gap-2 rounded-lg bg-mint/50 p-5 dark:bg-white/5"
                        >
                          <h4 className="font-semibold text-ink dark:text-white">{c.title}</h4>
                          <p className="text-ink/80 dark:text-warmgray/80">{c.text}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

          {closing && (
            <section className="flex flex-col gap-4 border-t border-warmgray pt-8 dark:border-white/10">
              <h2 className="text-xl font-semibold text-ink dark:text-white">
                Hva kan dette bety videre?
              </h2>
              <div>
                <h3 className="text-sm font-medium text-ink dark:text-white">Jobb</h3>
                <p className="text-ink/80 dark:text-warmgray/80">{closing.career}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ink dark:text-white">Relasjoner</h3>
                <p className="text-ink/80 dark:text-warmgray/80">{closing.relationships}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ink dark:text-white">Personlig utvikling</h3>
                <p className="text-ink/80 dark:text-warmgray/80">{closing.personalDevelopment}</p>
              </div>
            </section>
          )}
        </>
      )}

      {o6Score !== null && (
        <section className="flex flex-col gap-3 rounded-lg border border-coral/40 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">
            Tilleggsseksjon: politiske og verdimessige holdninger
          </h2>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Dette er et helt eget, valgfritt tillegg du samtykket til separat -- det er IKKE en del
            av de fem hovedfaktorene over, og teller ikke med i noen av dem. Skåren din her er{" "}
            {o6Score} av 100.
          </p>
          <button
            type="button"
            onClick={handleDeleteO6}
            className="self-start text-sm text-coral underline underline-offset-2"
          >
            Slett bare denne dataen
          </button>
        </section>
      )}

      {tier === "free" ? (
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">
            Vil du se et mer presist resultat?
          </h2>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Ved å fortsette til alle 120 spørsmål får du en mer presis beregning, og du låser opp
            muligheten til å snakke videre med Spir om resultatet ditt. Resultatet ditt over er
            ikke ufullstendig som beskrivelse av deg fordi du velger å stoppe her -- de resterende
            spørsmålene gir bare en mer detaljert måling.
          </p>
          <Link
            href="/test"
            className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
          >
            Fortsett til alle 120
          </Link>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">Vil du utforske resultatet videre?</h2>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Spir kan hjelpe deg å reflektere videre rundt resultatet ditt. Resultatet ditt sendes da
            til Anthropic (leverandøren av Spir) -- kun når du aktivt starter samtalen.
          </p>
          <Link
            href="/spir"
            className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
          >
            Snakk med Spir
          </Link>
        </section>
      )}

      <footer className="flex flex-col items-start gap-2 border-t border-warmgray pt-6 text-sm dark:border-white/10 print:hidden">
        <p className="text-ink/60 dark:text-warmgray/60">
          Svarene dine er lagret bare i denne nettleseren, ikke hos FemFaktorer.
        </p>
        <button type="button" onClick={handleDelete} className="text-coral underline underline-offset-2">
          Slett mine data
        </button>
      </footer>
    </main>
  );
}
