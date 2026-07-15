"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED, FREE_QUESTIONS, OPTIONAL_O6_QUESTIONS } from "@/data/questions";
import { loadAnswers, saveAnswers, loadO6, saveO6 } from "@/lib/storage";
import { buildAnswerSetCsv, parseAnswerSetCsv } from "@/lib/devTools/answerSetCsv";

/**
 * Verktøyside for produkteier (v2.15, 15.07.2026) -- IKKE lenket fra vanlig
 * navigasjon. Lar deg laste ned et helt svarsett (CSV) og laste det inn
 * igjen senere, slik at du kan bygge faste, gjenbrukbare svarsett å teste
 * rapporttekst og Spir-samtale mot mens resten av tjenesten er under
 * utvikling. Selve importen skriver rett til denne nettleserens vanlige
 * svarlagring (samme sted testen selv lagrer underveis) og sender deg
 * videre til /resultat -- som om testen nettopp var fullført.
 *
 * Ingen egen tilgangskontroll: siden opererer kun på DENNE nettleserens
 * egen lokale lagring, ikke andre brukeres data, så det er ikke noe
 * personvernproblem at URL-en i prinsippet er gjettbar -- den er bare
 * bevisst holdt utenfor menyen for å ikke forvirre vanlige brukere.
 */
export default function SvardataVerktoyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedInfo, setImportedInfo] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);

  // Lastes KUN på klienten (etter hydrering) -- unngår avvik mellom
  // server- og klient-render siden dette leser fra localStorage.
  useEffect(() => {
    refreshSummary();
  }, []);

  function refreshSummary() {
    const stored = loadAnswers();
    const storedO6 = loadO6();
    const answeredCount = Object.keys(stored.answers).length;
    const answeredO6 = Object.keys(storedO6.answers).length;
    const totalByTier =
      stored.tier === "extended"
        ? ALL_QUESTIONS_EXTENDED.length
        : stored.tier === "full"
          ? ALL_QUESTIONS.length
          : FREE_QUESTIONS.length;
    setCurrentSummary(
      `tier "${stored.tier}", ${answeredCount} av ${totalByTier} hovedspørsmål besvart, ${answeredO6} av ${OPTIONAL_O6_QUESTIONS.length} O6-tilleggsspørsmål besvart`
    );
  }

  function handleDownload() {
    const stored = loadAnswers();
    const storedO6 = loadO6();
    const csv = buildAnswerSetCsv({
      tier: stored.tier,
      answers: stored.answers,
      o6Status: storedO6.status,
      o6Answers: storedO6.answers,
    });
    // BOM (﻿) foran innholdet -- gjør at norsk-språklig Excel tolker
    // filen som UTF-8 med én gang, slik at æøå vises riktig.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `femfaktorer-svardata-${stored.tier}-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setWarnings([]);
    setImportedInfo(null);
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseAnswerSetCsv(text);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      saveAnswers(parsed.result.answers, parsed.result.tier);
      if (Object.keys(parsed.result.o6Answers).length > 0) {
        saveO6(parsed.result.o6Status, parsed.result.o6Answers);
      }
      refreshSummary();
      setWarnings(parsed.result.warnings);
      setImportedInfo(
        `Lastet inn som "${parsed.result.tier}"-versjonen. Sender deg til resultatsiden …`
      );
      setTimeout(() => router.push("/resultat"), parsed.result.warnings.length > 0 ? 1800 : 400);
    } catch {
      setError("Klarte ikke å lese filen. Er det en CSV-fil lastet ned fra denne siden?");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">Verktøy: svardata</h1>
        <p className="text-sm text-ink/70 dark:text-warmgray/70">
          Kun for utvikling -- ikke en del av den vanlige tjenesten. Her kan du laste ned et fast
          svarsett (CSV) og laste det inn igjen senere, slik at du kan teste rapporten og
          Spir-samtalen mot et kjent, uforandret svarsett mens resten av tjenesten fortsatt endrer
          seg. Filen kan også redigeres for hånd i Excel -- endre tallene i "svar"-kolonnen
          (1-5, tomt = ubesvart) for å bygge et helt oppdiktet svarsett fra bunnen av.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-warmgray p-5 dark:border-white/20">
        <h2 className="font-medium text-ink dark:text-white">Last ned gjeldende svar</h2>
        <p className="text-sm text-ink/70 dark:text-warmgray/70">
          Laster ned svarene som er lagret i DENNE nettleseren akkurat nå:{" "}
          {currentSummary ?? "laster …"}.
        </p>
        <button
          type="button"
          onClick={handleDownload}
          className="w-fit rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
        >
          Last ned som CSV
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-warmgray p-5 dark:border-white/20">
        <h2 className="font-medium text-ink dark:text-white">Last inn et svarsett</h2>
        <p className="text-sm text-ink/70 dark:text-warmgray/70">
          Velg en tidligere nedlastet (eller for hånd redigert) CSV-fil. Svarene skrives inn i
          denne nettleserens lagring -- og overskriver eventuelle svar som ligger der nå -- og du
          sendes rett til resultatsiden.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={importing}
          className="text-sm text-ink/80 dark:text-warmgray/80"
        />
        {importedInfo && <p className="text-sm text-teal">{importedInfo}</p>}
        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm text-ink/70 dark:text-warmgray/70">
            {warnings.map((w, i) => (
              <li key={i}>-- {w}</li>
            ))}
          </ul>
        )}
        {error && <p className="text-sm text-coral">{error}</p>}
      </section>

      <Link href="/" className="text-sm text-ink/60 underline underline-offset-2 dark:text-warmgray/60">
        Tilbake til forsiden
      </Link>
    </main>
  );
}
