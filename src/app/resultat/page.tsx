"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, FREE_QUESTIONS, OPTIONAL_O6_QUESTIONS } from "@/data/questions";
import { computeTestResult, computeOptionalO6Score, type FactorResult, type ResultTier } from "@/lib/scoring";
import { loadAnswers, clearAnswers, loadO6, clearO6 } from "@/lib/storage";
import { FactorScale } from "@/components/FactorScale";
import { RoughFactorIndicator } from "@/components/RoughFactorIndicator";
import { INTERPRETATIONS, NON_DIAGNOSTIC_NOTICE, bandFor } from "@/data/interpretations";

export default function ResultatPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [tier, setTier] = useState<ResultTier | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [o6Score, setO6Score] = useState<number | null>(null);

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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
          Din profil
        </h1>
        <p className="text-sm text-ink/70 dark:text-warmgray/70">{NON_DIAGNOSTIC_NOTICE}</p>
        {tier === "free" && (
          <p className="text-sm text-ink/60 dark:text-warmgray/60">
            Dette er et foreløpig resultat, basert på de første 50 av 120 spørsmål.
          </p>
        )}
      </header>

      <section className="flex flex-col gap-6">
        {factors.map((f) =>
          tier === "free" ? (
            <RoughFactorIndicator key={f.factor} factor={f.factor} label={f.label} score={f.score} />
          ) : (
            <FactorScale key={f.factor} factor={f.factor} label={f.label} score={f.score} />
          )
        )}
      </section>

      <section className="flex flex-col gap-8">
        {factors.map((f) => {
          const copy = INTERPRETATIONS[f.factor][bandFor(f.score)];
          return (
            <article key={f.factor} className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
              <h2 className="font-semibold text-ink dark:text-white">{f.label}</h2>
              <p className="text-ink/80 dark:text-warmgray/80">{copy.summary}</p>
              <p className="text-ink/80 dark:text-warmgray/80">{copy.typicalExpressions}</p>
              <p className="text-ink/80 dark:text-warmgray/80">{copy.resources}</p>
              <p className="text-ink/80 dark:text-warmgray/80">{copy.challenges}</p>
              <p className="text-ink/80 dark:text-warmgray/80">{copy.contextNote}</p>
              <p className="mt-2 text-ink/80 dark:text-warmgray/80">{copy.reflection}</p>
            </article>
          );
        })}
      </section>

      {o6Score !== null && (
        <section className="flex flex-col gap-3 rounded-lg border border-coral/40 p-5">
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
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5">
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
        <section className="flex flex-col gap-3 rounded-lg border border-teal/30 p-5">
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

      <footer className="flex flex-col items-start gap-2 border-t border-warmgray pt-6 text-sm dark:border-white/10">
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
