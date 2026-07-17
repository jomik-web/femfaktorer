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
import { computeAccountResultExpiry } from "@/lib/account/types";
import { buildFacetDrivenOverview, buildFacetAwareNote } from "@/data/domainComposition";
import { ACCOUNT_SAVE_ENABLED, BETA_ANSWER_SET_TOOLS_ENABLED } from "@/lib/featureFlags";
import { AnswerSetCsvPanel } from "@/components/AnswerSetCsvPanel";

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
        {BETA_ANSWER_SET_TOOLS_ENABLED && (
          <div className="mt-4 flex w-full flex-col items-center gap-3 border-t border-warmgray pt-6 dark:border-white/10">
            <p className="text-sm text-ink/60 dark:text-warmgray/60">
              Har du tatt testen før og lastet ned svarene dine? Last dem opp for å se resultatet
              med én gang, uten å svare på nytt.
            </p>
            <AnswerSetCsvPanel afterImport="reload" hideDownload />
          </div>
        )}
      </main>
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-12 print:max-w-none">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
            Din profil
          </h1>
          {isDetailed && (
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
        {tier === "full" && (
          <p className="text-sm text-ink/60 dark:text-warmgray/60">
            Basert på fullversjonen (alle 120 spørsmål).
          </p>
        )}
        {tier === "extended" && (
          <p className="text-sm text-ink/60 dark:text-warmgray/60">
            Basert på Utvidet versjon (alle 290 spørsmål) -- det mest presise resultatet FemFaktorer
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
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFactor === f.factor
                    ? "bg-teal text-white"
                    : "bg-warmgray text-ink hover:bg-warmgray/70 dark:bg-white/10 dark:text-warmgray dark:hover:bg-white/20"
                }`}
              >
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
                    ? "bg-teal text-white"
                    : "bg-warmgray text-ink hover:bg-warmgray/70 dark:bg-white/10 dark:text-warmgray dark:hover:bg-white/20"
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
                    <h2 className="text-3xl font-bold text-ink dark:text-white sm:text-4xl">{f.label}</h2>
                    <RoughFactorIndicator factor={f.factor} label={f.label} score={f.score} />
                    <p className="text-sm text-ink/60 dark:text-warmgray/60">{DOMAIN_DEFINITIONS[f.factor]}</p>
                  </div>

                  {facetsForDomain.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="font-semibold text-ink dark:text-white">Underkategorier</h3>
                      <div className="flex flex-col gap-5">
                        {facetsForDomain.map((fa) => {
                          const meta = FACET_INTERPRETATIONS[fa.facet];
                          const facetBand = bandFor(fa.score);
                          return (
                            <div key={fa.facet} className="flex flex-col gap-1.5">
                              <RoughFactorIndicator factor={f.factor} label={meta?.label ?? fa.facet} score={fa.score} />
                              {meta?.description && (
                                <p className="text-xs italic text-ink/50 dark:text-warmgray/50">
                                  {meta.description}
                                </p>
                              )}
                              <p className="text-sm text-ink/70 dark:text-warmgray/70">
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
                              className="flex flex-col gap-1.5 rounded-lg bg-mint/50 p-4 dark:bg-white/5"
                            >
                              <h4 className="text-sm font-semibold text-ink dark:text-white">{c.title}</h4>
                              <p className="text-sm text-ink/80 dark:text-warmgray/80">{c.text}</p>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {useNewLayout ? (
                    <article className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
                      <p className="text-ink/80 dark:text-warmgray/80">{copy.synthesis}</p>
                      {facetAwareNote && (
                        <p className="text-ink/80 dark:text-warmgray/80">{facetAwareNote}</p>
                      )}
                      <p className="mt-2 text-ink/80 dark:text-warmgray/80">{copy.reflection}</p>
                    </article>
                  ) : (
                    <article className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
                      <p className="text-ink/80 dark:text-warmgray/80">{facetDrivenOverview}</p>
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
                  )}

                  {domainCombos.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-semibold text-ink dark:text-white">Spennende samspill</h3>
                        <p className="text-sm text-ink/60 dark:text-warmgray/60">
                          Noen kombinasjoner av hovedfaktorer gir kjente, godt dokumenterte mønstre. Her er
                          de som passer med resultatet ditt.
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
                    </div>
                  )}
                </section>
              );
            })}

          {closing && (
            <section
              className={`flex flex-col gap-4 border-t border-warmgray pt-8 dark:border-white/10 ${
                activeFactor === "summary" ? "" : "hidden print:flex"
              }`}
              aria-hidden={activeFactor !== "summary"}
            >
              <h2 className="text-xl font-semibold text-ink dark:text-white">Hva betyr dette for deg?</h2>
              <p className="text-ink/80 dark:text-warmgray/80">{closing.text}</p>
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

      {BETA_ANSWER_SET_TOOLS_ENABLED && (
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">Betatest: ta vare på svarene dine</h2>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Testen kan bli oppdatert innimellom mens vi jobber videre med FemFaktorer. Last ned
            svarene dine som en fil nå, så slipper du å svare på alt på nytt etter en oppdatering
            -- last filen opp igjen her for å se resultatet med én gang. Denne muligheten fjernes
            igjen når betatestingen er ferdig.
          </p>
          <AnswerSetCsvPanel afterImport="reload" />
        </section>
      )}

      {ACCOUNT_SAVE_ENABLED && isDetailed && accountChecked && (
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">Lagre resultatet ditt</h2>
          {isRestored && (
            <p className="text-sm text-ink/60 dark:text-warmgray/60">
              Dette resultatet er hentet fra kontoen din.
            </p>
          )}
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Vil du slippe å ta testen på nytt for å se resultatet igjen -- på denne eller en annen
            enhet -- kan du lagre det knyttet til e-postadressen din. Vi lagrer da bare de ferdig
            beregnede skårene dine (fem hovedfaktorer og fasetter, og skåren fra den valgfrie
            tilleggsseksjonen om du har svart på den), ALDRI de 120 svarene du ga. Innlogging skjer
            med en engangskode sendt på e-post, ikke passord, og du kan slette det lagrede
            resultatet når som helst -- her, eller ved å logge inn på nytt.
          </p>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Resultatet lagres i 12 måneder fra siste lagring. I løpet av den perioden kan du logge
            inn så mange ganger du vil, se resultatet, ta testen på nytt for å oppdatere det, og
            snakke med Spir. Vi sender deg en e-postpåminnelse cirka en måned før 12-månedersfristen.
            Vil du bevare resultatet lenger enn det, må du enten laste det ned som PDF før fristen,
            eller lagre på nytt for å starte en ny 12-månedersperiode.
          </p>

          {loggedInEmail ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink/70 dark:text-warmgray/70">
                Innlogget som {loggedInEmail}
                {savedAt ? ` -- sist lagret ${new Date(savedAt).toLocaleDateString("no-NO")}.` : "."}
              </p>
              {savedAt && (
                <p className="text-sm text-ink/60 dark:text-warmgray/60">
                  Slettes automatisk {computeAccountResultExpiry(savedAt).toLocaleDateString("no-NO")}{" "}
                  med mindre du lagrer på nytt før den datoen. Vi sender deg en påminnelse på e-post
                  omtrent en måned før.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void persistCurrentResult()}
                  disabled={saveLoading}
                  className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-50"
                >
                  {saveLoading ? "Lagrer …" : "Lagre / oppdater resultatet"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="self-start text-sm text-ink/60 underline underline-offset-2 dark:text-warmgray/60"
                >
                  Logg ut
                </button>
              </div>
            </div>
          ) : saveStep === "closed" ? (
            <button
              type="button"
              onClick={() => setSaveStep("email")}
              className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
            >
              Lagre resultatet mitt
            </button>
          ) : saveStep === "email" ? (
            <form onSubmit={requestSaveCode} className="flex flex-col gap-2">
              <label htmlFor="save-email" className="text-sm font-medium text-ink dark:text-white">
                E-postadresse
              </label>
              <input
                id="save-email"
                type="email"
                required
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
                placeholder="navn@eksempel.no"
                className="rounded-lg border border-warmgray px-4 py-2 dark:border-white/20 dark:bg-transparent"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-50"
                >
                  {saveLoading ? "Sender kode …" : "Send meg en kode"}
                </button>
                <button
                  type="button"
                  onClick={() => setSaveStep("closed")}
                  className="text-sm text-ink/60 underline underline-offset-2 dark:text-warmgray/60"
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyAndSave} className="flex flex-col gap-2">
              {saveInfo && <p className="text-sm text-ink/70 dark:text-warmgray/70">{saveInfo}</p>}
              <label htmlFor="save-code" className="text-sm font-medium text-ink dark:text-white">
                6-sifret kode
              </label>
              <input
                id="save-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={saveCode}
                onChange={(e) => setSaveCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="rounded-lg border border-warmgray px-4 py-2 tracking-[0.3em] dark:border-white/20 dark:bg-transparent"
              />
              <button
                type="submit"
                disabled={saveLoading}
                className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-50"
              >
                {saveLoading ? "Bekrefter …" : "Bekreft og lagre"}
              </button>
            </form>
          )}

          {saveError && <p className="text-sm text-coral">{saveError}</p>}
        </section>
      )}

      {tier === "free" && (
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
      )}

      {tier === "full" && (
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5 print:hidden">
          <h2 className="font-semibold text-ink dark:text-white">Vil du gå enda dypere?</h2>
          <p className="text-sm text-ink/70 dark:text-warmgray/70">
            Utvidet versjon stiller 10 spørsmål per underkategori i stedet for 4-5 (290 spørsmål
            totalt), og gir det mest presise resultatet FemFaktorer kan tilby. Resultatet ditt over
            er ikke ufullstendig fordi du velger å stoppe her -- de resterende spørsmålene gir bare
            en enda sikrere måling.
          </p>
          <Link
            href="/test"
            className="self-start rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
          >
            Fortsett til Utvidet versjon
          </Link>
        </section>
      )}

      {isDetailed && (
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
          {loggedInEmail
            ? "Svarene dine ligger i denne nettleseren, og et beregnet resultat er lagret på kontoen din."
            : "Svarene dine er lagret bare i denne nettleseren, ikke hos FemFaktorer."}
        </p>
        <button type="button" onClick={() => void handleDelete()} className="text-coral underline underline-offset-2">
          Slett mine data
        </button>
      </footer>
    </main>
  );
}
