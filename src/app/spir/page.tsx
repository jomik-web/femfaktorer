"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS } from "@/data/questions";
import { computeTestResult, type FactorResult } from "@/lib/scoring";
import { loadAnswers } from "@/lib/storage";

interface ChatMessage {
  role: "user" | "fem";
  text: string;
}

export default function FemPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [consented, setConsented] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const stored = loadAnswers();
    // Spir krever alle 120 spørsmål besvart (Grunnlagsdokumentet, beslutning
    // om 120-utvidelsen) -- et foreløpig 50-resultat er ikke nok.
    if (!stored.continuedToFull) {
      setLocked(true);
      setHydrated(true);
      return;
    }
    const result = computeTestResult(stored.answers, ALL_QUESTIONS, "full");
    if (result.complete && result.factors) setFactors(result.factors);
    else setLocked(true);
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (locked || !factors) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white">Spir er ikke låst opp ennå</h1>
        <p className="text-ink/70 dark:text-warmgray/70">
          Spir er en del av den fulle testen. Fullfør alle 120 spørsmål for å låse opp muligheten
          til å snakke med Spir om resultatet ditt.
        </p>
        <Link href="/test" className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white">
          Gå til testen
        </Link>
      </main>
    );
  }

  // Personvern (Dokument 07 §2, §4.3): resultatet sendes til AI-leverandøren
  // KUN når brukeren aktivt samtykker her -- aldri automatisk.
  if (!consented) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
        <h1 className="text-xl font-semibold text-ink dark:text-white">Før du starter</h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Hvis du starter en samtale med Spir, sendes det beregnede resultatet ditt (de fem
          faktorskårene) og det du selv skriver, til Anthropic -- leverandøren av Spir. Ikke del
          annen personlig informasjon i meldingene dine enn det som trengs for samtalen.
          Testsvarene dine forblir lokalt i nettleseren uansett.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConsented(true)}
            className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white"
          >
            Ja, start samtale med Spir
          </button>
          <Link
            href="/resultat"
            className="rounded-lg px-5 py-2.5 font-medium text-ink/70 dark:text-warmgray/70"
          >
            Nei, gå tilbake
          </Link>
        </div>
      </main>
    );
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/spir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          factors,
          message: trimmed,
          exchangeCount: messages.filter((m) => m.role === "user").length,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      setMessages([...nextMessages, { role: "fem", text: data.reply }]);
    } catch {
      setError("Fikk ikke kontakt med Spir. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-xl font-semibold text-ink dark:text-white">Snakk med Spir</h1>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">
          Spir tolker resultatet ditt -- den kan ikke endre skårene dine.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "self-end rounded-lg bg-mint px-4 py-2 dark:bg-teal/20" : "self-start rounded-lg bg-warmgray px-4 py-2 dark:bg-white/10"}
          >
            {m.text}
          </div>
        ))}
        {loading && <p className="text-sm text-ink/50 dark:text-warmgray/50">Spir skriver …</p>}
        {error && <p className="text-sm text-coral">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="flex gap-3"
      >
        <label htmlFor="fem-input" className="sr-only">
          Skriv en melding til Spir
        </label>
        <input
          id="fem-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Spør Spir om resultatet ditt …"
          className="flex-1 rounded-lg border border-warmgray px-4 py-2 dark:border-white/20 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal px-5 py-2 font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
