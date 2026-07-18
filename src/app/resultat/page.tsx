"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED, FREE_QUESTIONS, OPTIONAL_O6_QUESTIONS, type Domain } from "@/data/questions";
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
import {
  loadAnswers,
  clearAnswers,
  loadO6,
  clearO6,
  loadRestoredAccountResult,
  clearRestoredAccountResult,
} from "@/lib/storage";
import { RoughFactorIndicator } from "@/components/RoughFactorIndicator";
import {
  INTERPRETATIONS,
  DOMAIN_DEFINITIONS,
  NON_DIAGNOSTIC_NOTICE,
  CRISIS_NOTICE,
  bandFor,
  buildClosingSynthesis,
} from "@/data/interpretations";
import { FACET_INTERPRETATIONS, FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";
import {
  matchCombinationInsightsByDomain,
  matchFacetCombinationInsights,
  type CombinationInsight,
  type FacetCombinationInsight,
} from "@/data/combinationInsights";
import { computeAccountResultExpiry, type StoredAccountResult } from "@/lib/account/types";
import { buildFacetDrivenOverview, buildFacetAwareNote } from "@/data/domainComposition";
import { ACCOUNT_SAVE_ENABLED, BETA_ANSWER_SET_TOOLS_ENABLED } from "@/lib/featureFlags";
import { AnswerSetCsvPanel } from "@/components/AnswerSetCsvPanel";
import { FactorIcon } from "@/components/FactorIcon";
import { FactorHero } from "@/components/FactorHero";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageBackground } from "@/components/ui/PageBackground";

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

// Klasser hentet 1:1 fra Button (variant="primary" size="md") -- Link kan
// ikke bruke <Button> direkte (den er en <button>), men skal se identisk ut.
const PRIMARY_MD_LINK_CLASSES =
  "font-display font-semibold transition-all duration-150 inline-block " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo-sky focus-visible:ring-offset-2 " +
  "bg-holo-gradient text-white shadow-sm hover:opacity-90 hover:shadow-md active:opacity-100 active:scale-[0.98] " +
  "px-6 py-3 text-base rounded-xl";

export default function ResultatPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [tier, setTier] = useState<ResultTier | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [o6Score, setO6Score] = useState<number | null>(null);
  // Hvilken hovedkategori-"side" som vises for den fulle testen (v2.3,
  // produkteiers ønske om å dele opp rapporten i én side per hovedkategori
  // i stedet for alt på én lang side). v2.22: kan også være "summary" -- den
  // avsluttende profiloppsummeringen ("Hva betyr dette for deg") fikk sin
  // egen fane i stedet for å vises under HVER hovedkategori-fane (den forrige
  // plasseringen, utenfor factors.map() men fortsatt inni samme synlige
  // område, gjorde at den i praksis dukket opp uansett hvilken hovedkategori
  // som var valgt -- rapportert som "kommer etter hvert hovedkategori").
  const [activeFactor, setActiveFactor] = useState<DisplayFactor | "summary" | null>(null);
  // Sant når resultatet vises fra kontoen (etter innlogging på en enhet uten
  // lokale svar) i stedet for fra denne enhetens egne lagrede testsvar --
  // v2.4, se lib/storage.ts og /logg-inn.
  const [isRestored, setIsRestored] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveStep, setSaveStep] = useState<"closed" | "email" | "code">("closed");
  const [saveEmail, setSaveEmail] = useState("");
  const [saveCode, setSaveCode] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);
  // "Utvikling over tid" (v2.27) -- kun relevant for "extended" (Premium-
  // nivå, 290 spm), se lib/account/types.ts sin doc-kommentar for hvorfor
  // "full" (Standard) aldri bygger opp en flerpunkts-historikk.
  const [history, setHistory] = useState<StoredAccountResult[]>([]);

  useEffect(() => {
    const stored = loadAnswers();
    // Prøv det spørsmålssettet brukeren faktisk er inne i (jf. testflyten):
    // "extended" -> alle 290, "full" -> alle 120, ellers de første 50 (det
    // foreløpige, gratis resultatet).
    const questionSet =
      stored.tier === "extended" ? ALL_QUESTIONS_EXTENDED : stored.tier === "full" ? ALL_QUESTIONS : FREE_QUESTIONS;
    const resultTier: ResultTier = stored.tier;
    const result = computeTestResult(stored.answers, questionSet, resultTier);

    if (result.complete && result.factors) {
      setFactors(result.factors);
      setTier(result.tier ?? resultTier);
      // Fasettskår (underkategorier) er kun meningsfulle -- og kun vist -- for
      // full/extended-testen (v2.1/v2.11, se scoring.ts computeFacetResults).
      if (resultTier === "full" || resultTier === "extended") {
        setFacets(computeFacetResults(stored.answers, questionSet));
      }

      // O6-tilleggsseksjonen (helt valgfri, se questions.ts) -- vises KUN
      // dersom brukeren aktivt har samtykket og fullført den, og ALDRI
      // blandet inn i de fem hovedfaktorene over.
      const storedO6 = loadO6();
      setO6Score(computeOptionalO6Score(storedO6.answers, OPTIONAL_O6_QUESTIONS));
      setHydrated(true);
      return;
    }

    // Ingen fullført test lokalt -- prøv et resultat hentet fra kontoen
    // (v2.4). Lokale svar går ALLTID foran et hentet resultat dersom begge
    // finnes, slik at en fersk test aldri overskygges av gammel kontodata.
    const restored = loadRestoredAccountResult();
    if (restored) {
      setFactors(restored.factors);
      setFacets(restored.facets);
      setTier(restored.tier);
      setO6Score(restored.o6Score);
      setIsRestored(true);
      setHydrated(true);
      return;
    }

    setIncomplete(true);
    setHydrated(true);
  }, []);

  // Sett første fane som aktiv så snart resultatet er klart.
  useEffect(() => {
    if (factors && !activeFactor) setActiveFactor(factors[0]?.factor ?? null);
  }, [factors, activeFactor]);

  // Sjekk innloggingsstatus -- kun relevant (og kun spurt om) for full/extended-
  // testen, se produkteiers krav om at korttesten ikke skal tilby lagring.
  useEffect(() => {
    if (!ACCOUNT_SAVE_ENABLED || tier === "free" || tier === null) return;
    let cancelled = false;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setLoggedInEmail(data.loggedIn ? (data.email ?? null) : null);
        setAccountChecked(true);
      })
      .catch(() => {
        if (!cancelled) setAccountChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  // Hent lagret historikk for "Utvikling over tid" -- kun meningsfullt for
  // extended-tier (Premium), og kun når vi vet brukeren faktisk er logget inn.
  useEffect(() => {
    if (!ACCOUNT_SAVE_ENABLED || tier !== "extended" || !loggedInEmail) return;
    let cancelled = false;
    fetch("/api/account/result")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setHistory(Array.isArray(data.history) ? data.history : []);
      })
      .catch(() => {
        // Ikke kritisk -- seksjonen vises da bare ikke ennå.
      });
    return () => {
      cancelled = true;
    };
  }, [tier, loggedInEmail]);

  if (!hydrated) return null;

  if (incomplete || !factors) {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white">
            Vi fant ikke et fullført resultat
          </h1>
          <p className="text-indigo/70 dark:text-lavender-400/70">
            Det kan hende testen ikke er fullført ennå, eller at lagrede svar er slettet.
          </p>
          <Link href="/test" className={PRIMARY_MD_LINK_CLASSES}>
            Gå til testen
          </Link>
          {BETA_ANSWER_SET_TOOLS_ENABLED && (
            <div className="mt-4 flex w-full flex-col items-center gap-3 border-t border-lavender-400 pt-6 dark:border-white/10">
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                Har du tatt testen før og lastet ned svarene dine? Last dem opp for å se resultatet
                med én gang, uten å svare på nytt.
              </p>
              <AnswerSetCsvPanel afterImport="reload" hideDownload />
            </div>
          )}
        </main>
      </PageBackground>
    );
  }

  async function handleDelete() {
    // Er man innlogget, slett den lagrede kontodataen også -- "slett mine
    // data" skal bety alt, ikke bare det som ligger lokalt (v2.4).
    if (loggedInEmail) {
      try {
        await fetch("/api/account/delete", { method: "POST" });
        await fetch("/api/account/logout", { method: "POST" });
      } catch {
        // Fortsetter uansett med lokal sletting under.
      }
    }
    clearAnswers();
    clearO6();
    clearRestoredAccountResult();
    window.location.href = "/";
  }

  function handleDeleteO6() {
    clearO6();
    setO6Score(null);
  }

  // "full" og "extended" deler nesten hele den detaljerte visningen --
  // fasetter, samspill, kontolagring, PDF-nedlasting osv. Kun noen få steder
  // (spørsmålssett-valg ved beregning, og selve oppfordringsteksten nederst)
  // skiller genuint mellom de to nivåene, se resten av filen.
  const isDetailed = tier === "full" || tier === "extended";

  async function requestSaveCode(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveInfo(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/account/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: saveEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      setSaveInfo(`Vi har sendt en kode til ${saveEmail}.`);
      setSaveStep("code");
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function persistCurrentResult() {
    setSaveLoading(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/account/save-result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ factors, facets, o6Score, tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Klarte ikke å lagre resultatet.");
        return;
      }
      setSavedAt(data.savedAt);
      setSaveInfo("Resultatet ditt er lagret.");
      // v2.27: oppdater "Utvikling over tid"-seksjonen med den ferske
      // historikken med én gang, i stedet for at brukeren må laste siden på
      // nytt for å se det nettopp lagrede resultatet i oversikten.
      if (tier === "extended") {
        try {
          const historyRes = await fetch("/api/account/result");
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setHistory(Array.isArray(historyData.history) ? historyData.history : []);
          }
        } catch {
          // Ikke kritisk -- selve lagringen lyktes uansett.
        }
      }
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function verifyAndSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/account/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: saveEmail, code: saveCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Feil kode. Prøv igjen.");
        return;
      }
      setLoggedInEmail(data.email ?? saveEmail);
      setSaveStep("closed");
      await persistCurrentResult();
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } catch {
      // se over -- fjerner den lokale innloggingsvisningen uansett
    }
    setLoggedInEmail(null);
    setSaveInfo(null);
  }

  // Kombinasjonsfunn (både hovedfaktor- og fasettnivå) gruppert etter hvilket
  // hoveddomene de skal vises under -- se plasseringsregelen i
  // data/combinationInsights.ts (samme domene -> der; ulike domener -> under
  // det som kommer sist i visningsrekkefølgen).
  const domainCombosByDomain: Map<Domain, CombinationInsight[]> = isDetailed
    ? matchCombinationInsightsByDomain(factors, bandFor, DISPLAY_TO_DOMAIN)
    : new Map<Domain, CombinationInsight[]>();
  const facetCombosByDomain: Map<Domain, FacetCombinationInsight[]> = isDetailed
    ? matchFacetCombinationInsights(facets, bandFor)
    : new Map<Domain, FacetCombinationInsight[]>();
  const closing = isDetailed ? buildClosingSynthesis(factors, facets) : null;

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-12 print:max-w-none">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-indigo dark:text-white sm:text-3xl">
            Din profil
          </h1>
          {isDetailed && (
            <Button type="button" variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
              Last ned som PDF
            </Button>
          )}
        </div>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{NON_DIAGNOSTIC_NOTICE}</p>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{CRISIS_NOTICE}</p>
        {tier === "free" && (
          <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
            Dette er et foreløpig resultat, basert på de første 50 av 120 spørsmål.
          </p>
        )}
        {tier === "full" && (
          <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
            Basert på fullversjonen (alle 120 spørsmål).
          </p>
        )}
        {tier === "extended" && (
          <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
            Basert på Utvidet versjon (alle 290 spørsmål) -- det mest presise resultatet Dine Fasetter
            kan gi, med 10 spørsmål per underkategori i stedet for 4-5.
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
                <article
                  key={f.factor}
                  className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                >
                  <FactorHero factor={f.factor} className="-mx-5 -mt-5 w-[calc(100%+2.5rem)] max-w-none" />
                  <div className="flex items-center gap-3">
                    <FactorIcon factor={f.factor} size={40} />
                    <h2 className="font-display font-semibold text-indigo dark:text-white">{f.label}</h2>
                  </div>
                  <p className="text-indigo/80 dark:text-lavender-400/80">{copy.overview}</p>
                  <p className="text-indigo/80 dark:text-lavender-400/80">{copy.nuance}</p>
                  <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
                  <div className="mt-3 flex flex-col gap-3 border-t border-indigo/10 pt-3 dark:border-white/10">
                    <div>
                      <h3 className="text-sm font-medium text-indigo dark:text-white">Jobb</h3>
                      <p className="text-indigo/80 dark:text-lavender-400/80">{copy.careerNote}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-indigo dark:text-white">Kjærlighet</h3>
                      <p className="text-indigo/80 dark:text-lavender-400/80">{copy.relationshipNote}</p>
                      <p className="mt-1 text-indigo/80 dark:text-lavender-400/80">{copy.partnerNote}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      {isDetailed && (
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
                    ? "bg-holo-gradient text-white shadow-sm"
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
              const facetAwareNote = buildFacetAwareNote(f.factor, f.score, facetsForDomain);
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
                    <FactorHero factor={f.factor} className="rounded-2xl" />
                    <div className="flex items-center gap-3">
                      <FactorIcon factor={f.factor} size={56} />
                      <h2 className="font-display text-3xl font-bold text-indigo dark:text-white sm:text-4xl">
                        {f.label}
                      </h2>
                    </div>
                    <RoughFactorIndicator factor={f.factor} label={f.label} score={f.score} />
                    <p className="text-sm text-indigo/60 dark:text-lavender-400/60">{DOMAIN_DEFINITIONS[f.factor]}</p>
                  </div>

                  {facetsForDomain.length > 0 && (
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
                      <p className="text-indigo/80 dark:text-lavender-400/80">{copy.synthesis}</p>
                      {facetAwareNote && (
                        <p className="text-indigo/80 dark:text-lavender-400/80">{facetAwareNote}</p>
                      )}
                      <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
                    </article>
                  ) : (
                    <article className="flex flex-col gap-3 rounded-2xl border border-lavender-400/20 bg-lavender-100/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-indigo/80 dark:text-lavender-400/80">{facetDrivenOverview}</p>
                      <p className="text-indigo/80 dark:text-lavender-400/80">{copy.nuance}</p>
                      <p className="mt-2 text-indigo/80 dark:text-lavender-400/80">{copy.reflection}</p>
                      <div className="mt-3 flex flex-col gap-3 border-t border-indigo/10 pt-3 dark:border-white/10">
                        <div>
                          <h3 className="text-sm font-medium text-indigo dark:text-white">I jobbsammenheng</h3>
                          <p className="text-indigo/80 dark:text-lavender-400/80">{copy.careerNote}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-indigo dark:text-white">I relasjoner</h3>
                          <p className="text-indigo/80 dark:text-lavender-400/80">{copy.relationshipNote}</p>
                        </div>
                      </div>
                    </article>
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

          {closing && (
            <section
              className={`flex flex-col gap-4 border-t border-lavender-400 pt-8 dark:border-white/10 ${
                activeFactor === "summary" ? "" : "hidden print:flex"
              }`}
              aria-hidden={activeFactor !== "summary"}
            >
              <FactorHero factor="summary" className="rounded-2xl" />
              <h2 className="font-display text-xl font-semibold text-indigo dark:text-white">Hva betyr dette for deg?</h2>
              <p className="text-indigo/80 dark:text-lavender-400/80">{closing.text}</p>
            </section>
          )}
        </>
      )}

      {o6Score !== null && (
        <section className="flex flex-col gap-3 rounded-2xl border border-factor-stability/40 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">
            Tilleggsseksjon: politiske og verdimessige holdninger
          </h2>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Dette er et helt eget, valgfritt tillegg du samtykket til separat -- det er IKKE en del
            av de fem hovedfaktorene over, og teller ikke med i noen av dem. Skåren din her er{" "}
            {o6Score} av 100.
          </p>
          <button
            type="button"
            onClick={handleDeleteO6}
            className="self-start text-sm text-factor-stability underline underline-offset-2"
          >
            Slett bare denne dataen
          </button>
        </section>
      )}

      {BETA_ANSWER_SET_TOOLS_ENABLED && (
        <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">Betatest: ta vare på svarene dine</h2>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Testen kan bli oppdatert innimellom mens vi jobber videre med Dine Fasetter. Last ned
            svarene dine som en fil nå, så slipper du å svare på alt på nytt etter en oppdatering
            -- last filen opp igjen her for å se resultatet med én gang. Denne muligheten fjernes
            igjen når betatestingen er ferdig.
          </p>
          <AnswerSetCsvPanel afterImport="reload" />
        </section>
      )}

      {ACCOUNT_SAVE_ENABLED && isDetailed && accountChecked && (
        <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">Lagre resultatet ditt</h2>
          {isRestored && (
            <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
              Dette resultatet er hentet fra kontoen din.
            </p>
          )}
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Vil du slippe å ta testen på nytt for å se resultatet igjen -- på denne eller en annen
            enhet -- kan du lagre det knyttet til e-postadressen din. Vi lagrer da bare de ferdig
            beregnede skårene dine (fem hovedfaktorer og fasetter, og skåren fra den valgfrie
            tilleggsseksjonen om du har svart på den), ALDRI de 120 svarene du ga. Innlogging skjer
            med en engangskode sendt på e-post, ikke passord, og du kan slette det lagrede
            resultatet når som helst -- her, eller ved å logge inn på nytt.
          </p>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Resultatet lagres i 12 måneder fra siste lagring. I løpet av den perioden kan du logge
            inn så mange ganger du vil, se resultatet, ta testen på nytt for å oppdatere det, og
            snakke med Spir. Vi sender deg en e-postpåminnelse cirka en måned før 12-månedersfristen.
            Vil du bevare resultatet lenger enn det, må du enten laste det ned som PDF før fristen,
            eller lagre på nytt for å starte en ny 12-månedersperiode.
          </p>

          {loggedInEmail ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
                Innlogget som {loggedInEmail}
                {savedAt ? ` -- sist lagret ${new Date(savedAt).toLocaleDateString("no-NO")}.` : "."}
              </p>
              {savedAt && (
                <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                  Slettes automatisk {computeAccountResultExpiry(savedAt).toLocaleDateString("no-NO")}{" "}
                  med mindre du lagrer på nytt før den datoen. Vi sender deg en påminnelse på e-post
                  omtrent en måned før.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" onClick={() => void persistCurrentResult()} disabled={saveLoading}>
                  {saveLoading ? "Lagrer …" : "Lagre / oppdater resultatet"}
                </Button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="self-start text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
                >
                  Logg ut
                </button>
              </div>
            </div>
          ) : saveStep === "closed" ? (
            <Button type="button" size="sm" onClick={() => setSaveStep("email")} className="self-start">
              Lagre resultatet mitt
            </Button>
          ) : saveStep === "email" ? (
            <form onSubmit={requestSaveCode} className="flex flex-col gap-2">
              <label htmlFor="save-email" className="text-sm font-medium text-indigo dark:text-white">
                E-postadresse
              </label>
              <Input
                id="save-email"
                type="email"
                required
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
                placeholder="navn@eksempel.no"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={saveLoading}>
                  {saveLoading ? "Sender kode …" : "Send meg en kode"}
                </Button>
                <button
                  type="button"
                  onClick={() => setSaveStep("closed")}
                  className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyAndSave} className="flex flex-col gap-2">
              {saveInfo && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{saveInfo}</p>}
              <label htmlFor="save-code" className="text-sm font-medium text-indigo dark:text-white">
                6-sifret kode
              </label>
              <Input
                id="save-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={saveCode}
                onChange={(e) => setSaveCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="tracking-[0.3em]"
              />
              <Button type="submit" size="sm" disabled={saveLoading} className="self-start">
                {saveLoading ? "Bekrefter …" : "Bekreft og lagre"}
              </Button>
            </form>
          )}

          {saveError && <p className="text-sm text-factor-stability">{saveError}</p>}
        </section>
      )}

      {ACCOUNT_SAVE_ENABLED && tier === "extended" && loggedInEmail && history.length > 1 && (() => {
        // Regn ut endring fra forrige lagring for hver hovedfaktor (nøytralt
        // -- ALDRI farget eller omtalt som "bedre"/"verre", se den avgjorte
        // holdningen til utviklingsråd, v2.23/17.07.2026: dette er et bilde
        // av variasjon over tid, ikke en vurdering).
        const withDeltas = history.map((entry, i) => {
          const prev = i > 0 ? history[i - 1] : null;
          const deltas = prev
            ? entry.factors.map((f) => {
                const prevScore = prev.factors.find((pf) => pf.factor === f.factor)?.score;
                return prevScore === undefined ? null : Math.round(f.score) - Math.round(prevScore);
              })
            : null;
          return { entry, deltas };
        });
        const columns = history[history.length - 1]?.factors ?? [];

        return (
          <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
            <h2 className="font-display font-semibold text-indigo dark:text-white">Utvikling over tid</h2>
            <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
              Du har lagret {history.length} resultater av Utvidet versjon knyttet til denne
              kontoen. Her ser du hvordan de fem hovedfaktorene har målt seg fra gang til gang --
              ikke som en vurdering av om noe er "bedre" eller "verre", bare som et bilde av
              hvordan svarene dine har variert over tid. Endringstall (i parentes) viser
              differansen fra forrige lagrede resultat.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-indigo/10 dark:border-white/10">
                    <th className="py-2 pr-4 font-medium text-indigo dark:text-white">Dato</th>
                    {columns.map((f) => (
                      <th key={f.factor} className="py-2 pr-4 font-medium text-indigo dark:text-white">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...withDeltas].reverse().map(({ entry, deltas }) => (
                    <tr key={entry.savedAt} className="border-b border-indigo/5 dark:border-white/5">
                      <td className="py-2 pr-4 text-indigo/70 dark:text-lavender-400/70">
                        {new Date(entry.savedAt).toLocaleDateString("no-NO")}
                      </td>
                      {entry.factors.map((f, i) => {
                        const delta = deltas?.[i] ?? null;
                        return (
                          <td key={f.factor} className="py-2 pr-4 text-indigo/80 dark:text-lavender-400/80">
                            {Math.round(f.score)}
                            {delta !== null && (
                              <span className="text-indigo/50 dark:text-lavender-400/50">
                                {" "}
                                ({delta > 0 ? `+${delta}` : delta === 0 ? "±0" : `−${Math.abs(delta)}`})
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })()}

      {tier === "free" && (
        <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">
            Vil du se et mer presist resultat?
          </h2>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Ved å fortsette til alle 120 spørsmål får du en mer presis beregning, og du låser opp
            muligheten til å snakke videre med Spir om resultatet ditt. Resultatet ditt over er
            ikke ufullstendig som beskrivelse av deg fordi du velger å stoppe her -- de resterende
            spørsmålene gir bare en mer detaljert måling.
          </p>
          <Link href="/test" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
            Fortsett til alle 120
          </Link>
        </section>
      )}

      {tier === "full" && (
        <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">Vil du gå enda dypere?</h2>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Utvidet versjon stiller 10 spørsmål per underkategori i stedet for 4-5 (290 spørsmål
            totalt), og gir det mest presise resultatet Dine Fasetter kan tilby. Resultatet ditt over
            er ikke ufullstendig fordi du velger å stoppe her -- de resterende spørsmålene gir bare
            en enda sikrere måling.
          </p>
          <Link href="/test" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
            Fortsett til Utvidet versjon
          </Link>
        </section>
      )}

      {isDetailed && (
        <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">Vil du utforske resultatet videre?</h2>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Spir kan hjelpe deg å reflektere videre rundt resultatet ditt. Resultatet ditt sendes da
            til Anthropic (leverandøren av Spir) -- kun når du aktivt starter samtalen.
          </p>
          <Link href="/spir" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
            Snakk med Spir
          </Link>
        </section>
      )}

      <footer className="flex flex-col items-start gap-2 border-t border-lavender-400 pt-6 text-sm dark:border-white/10 print:hidden">
        <p className="text-indigo/60 dark:text-lavender-400/60">
          {loggedInEmail
            ? "Svarene dine ligger i denne nettleseren, og et beregnet resultat er lagret på kontoen din."
            : "Svarene dine er lagret bare i denne nettleseren, ikke hos Dine Fasetter."}
        </p>
        <button type="button" onClick={() => void handleDelete()} className="text-factor-stability underline underline-offset-2">
          Slett mine data
        </button>
      </footer>
      </main>
    </PageBackground>
  );
}
