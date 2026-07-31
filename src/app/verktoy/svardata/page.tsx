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
 * komponenten AnswerSetCsvPanel.
 *
 * v2.43 (Kvalitetsrevisjon 31.07.2026, kap. 2, middels alvorlighet):
 * resultatsiden hadde tidligere SIN EGEN, synlige CSV-seksjon
 * ("Betatest: ta vare på svarene dine", bak BETA_ANSWER_SET_TOOLS_ENABLED)
 * i tillegg til denne siden -- to steder med identisk funksjonalitet gjorde
 * resultatsiden lengre enn nødvendig. Den synlige seksjonen er fjernet;
 * /resultat lenker nå hit i stedet (se de to stedene som nevner
 * "CSV-verktøyet" i resultat/page.tsx). Denne siden dekker derfor NÅ begge
 * behov: produkteierens faste testsvarsett, OG betatesteres ønske om å ta
 * vare på svarene sine mellom oppdateringer (se avsnittet under).
 *
 * Denne siden er BEVISST holdt utenfor menyen -- den forblir tilgjengelig
 * som et permanent verktøy også etter at betaperioden er over, i motsetning
 * til den fjernede seksjonen på /resultat (som var bak et fjernbart
 * feature-flagg, se lib/featureFlags.ts).
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
          Her kan du laste ned svarene dine som en fil (CSV) og laste dem inn igjen senere -- enten
          fordi du er en betatester som vil ta vare på svarene dine mellom oppdateringer av testen,
          eller fordi du vil teste rapporten og Spir-samtalen mot et kjent, uforandret svarsett.
          Filen kan også redigeres for hånd i Excel -- endre tallene i "svar"-kolonnen (1-5, tomt =
          ubesvart) for å bygge et helt oppdiktet svarsett fra bunnen av.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-lavender-400 p-5 dark:border-white/20">
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Svar lagret i DENNE nettleseren akkurat nå: {currentSummary ?? "laster …"}.
        </p>
        <AnswerSetCsvPanel afterImport="navigate" />
      </section>

      <div className="flex flex-wrap gap-4">
        <Link href="/resultat" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til resultatet
        </Link>
        <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}
