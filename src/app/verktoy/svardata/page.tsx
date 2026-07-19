"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED, FREE_QUESTIONS } from "@/data/questions";
import { loadAnswers } from "@/lib/storage";
import { AnswerSetCsvPanel } from "@/components/AnswerSetCsvPanel";

/**
 * Verktøyside for produkteier (v2.15/v2.16) -- IKKE lenket fra vanlig
 * navigasjon. Lar deg laste ned et helt svarsett (CSV) og laste det inn
 * igjen senere, slik at du kan bygge faste, gjenbrukbare svarsett å teste
 * rapporttekst og Spir-samtale mot mens resten av tjenesten er under
 * utvikling. Selve last ned/last opp-logikken ligger i den delte
 * komponenten AnswerSetCsvPanel (samme komponent som de synlige
 * betatest-knappene på /resultat bruker, se lib/featureFlags.ts).
 *
 * Denne siden er BEVISST holdt utenfor menyen (og utenfor betaflagget) --
 * den forblir tilgjengelig for deg som et permanent utviklerverktøy også
 * etter at betatest-knappene på /resultat fjernes igjen.
 *
 * Ingen egen tilgangskontroll: siden opererer kun på DENNE nettleserens
 * egen lokale lagring, ikke andre brukeres data, så det er ikke noe
 * personvernproblem at URL-en i prinsippet er gjettbar.
 */
export default function SvardataVerktoyPage() {
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);

  // Lastes KUN på klienten (etter hydrering) -- unngår avvik mellom
  // server- og klient-render siden dette leser fra localStorage.
  useEffect(() => {
    const stored = loadAnswers();
    const answeredCount = Object.keys(stored.answers).length;
    const totalByTier =
      stored.tier === "extended"
        ? ALL_QUESTIONS_EXTENDED.length
        : stored.tier === "full"
          ? ALL_QUESTIONS.length
          : FREE_QUESTIONS.length;
    setCurrentSummary(`tier "${stored.tier}", ${answeredCount} av ${totalByTier} hovedspørsmål besvart`);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-indigo dark:text-white">Verktøy: svardata</h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Kun for utvikling -- ikke en del av den vanlige tjenesten. Her kan du laste ned et fast
          svarsett (CSV) og laste det inn igjen senere, slik at du kan teste rapporten og
          Spir-samtalen mot et kjent, uforandret svarsett mens resten av tjenesten fortsatt endrer
          seg. Filen kan også redigeres for hånd i Excel -- endre tallene i "svar"-kolonnen
          (1-5, tomt = ubesvart) for å bygge et helt oppdiktet svarsett fra bunnen av.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-lavender-400 p-5 dark:border-white/20">
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Svar lagret i DENNE nettleseren akkurat nå: {currentSummary ?? "laster …"}.
        </p>
        <AnswerSetCsvPanel afterImport="navigate" />
      </section>

      <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
        Tilbake til forsiden
      </Link>
    </main>
  );
}
