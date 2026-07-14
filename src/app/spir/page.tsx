"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED } from "@/data/questions";
import { computeTestResult, computeFacetResults, type FactorResult, type FacetResult } from "@/lib/scoring";
import { loadAnswers } from "@/lib/storage";

interface ChatMessage {
  role: "user" | "fem";
  text: string;
  /**
   * Sant for den systeminitierte "start samtalen"-instruksen som utløser
   * Spirs åpningsreplikk (v2.2) -- filtreres bort fra det som faktisk vises
   * i chatten, men beholdes i historikken som sendes til Anthropic, siden
   * en samtale der må starte med en "user"-rolle.
   */
  hidden?: boolean;
}

/** Må matche instruksen serveren bruker for intro-meldingen, se api/spir/route.ts. */
const INTRO_TRIGGER_TEXT = "Start samtalen.";

export default function FemPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [consented, setConsented] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [locked, setLocked] = useState(false);
  // Sant så snart Spir har fått i oppdrag å åpne samtalen selv -- hindrer at
  // introen sendes flere ganger (v2.2, se systemPrompt.ts og api/spir/route.ts).
  const [introStarted, setIntroStarted] = useState(false);

  useEffect(() => {
    const stored = loadAnswers();
    // Spir krever minst alle 120 spørsmål besvart (Grunnlagsdokumentet,
    // beslutning om 120-utvidelsen) -- et foreløpig 50-resultat er ikke nok.
    // Fra v2.11: bruker det spørsmålssettet og den skåringen som faktisk
    // matcher brukerens nivå -- "extended" (290) gir Spir mer presise
    // fasettskårer enn "full" (120), men begge låser opp samtalen likt.
    if (stored.tier === "free") {
      setLocked(true);
      setHydrated(true);
      return;
    }
    const questionSet = stored.tier === "extended" ? ALL_QUESTIONS_EXTENDED : ALL_QUESTIONS;
    const result = computeTestResult(stored.answers, questionSet, stored.tier);
    if (result.complete && result.factors) {
      setFactors(result.factors);
      setFacets(computeFacetResults(stored.answers, questionSet));
    } else {
      setLocked(true);
    }
    setHydrated(true);
  }, []);

  // Lar Spir selv åpne samtalen med en refleksjon + spørsmål, i stedet for å
  // vente passivt på at brukeren skal skrive noe først (Anette sin
  // tilbakemelding, se systemPrompt.ts v2.2). Kjøres kun én gang, når
  // samtykke er gitt og resultatet er klart.
  useEffect(() => {
    if (!consented || !factors || introStarted) return;
    setIntroStarted(true);
    setLoading(true);
    setError(null);
    fetch("/api/spir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        factors,
        facets,
        message: INTRO_TRIGGER_TEXT,
        intro: true,
        history: [],
        exchangeCount: 0,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Noe gikk galt. Prøv igjen.");
          return;
        }
        // Den skjulte "user"-turen beholdes i historikken (Anthropics API
        // krever at en samtale starter med rollen "user"), men filtreres
        // bort fra det som faktisk vises -- se `hidden` på ChatMessage.
        setMessages([
          { role: "user", text: INTRO_TRIGGER_TEXT, hidden: true },
          { role: "fem", text: data.reply },
        ]);
      })
      .catch(() => {
        setError("Fikk ikke kontakt med Spir. Sjekk nettforbindelsen og prøv igjen.");
      })
      .finally(() => setLoading(false));
  }, [consented, factors, facets, introStarted]);

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
          Hvis du starter en samtale med Spir, sendes det beregnede resultatet ditt -- både de fem
          hovedfaktorene og de om lag 29 underfasettene -- og det du selv skriver, til Anthropic --
          leverandøren av Spir. Dette gjør at Spir kan gi mer presise svar, blant annet om karriere,
          relasjoner og sammenhenger mellom flere trekk. Ikke del annen personlig informasjon i
          meldingene dine enn det som trengs for samtalen. Testsvarene dine forblir lokalt i
          nettleseren uansett.
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
    // Historikken sendes med slik at Spir faktisk husker samtalen og kan
    // følge opp egne spørsmål (v2.2, se api/spir/route.ts).
    const history = messages;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/spir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          factors,
          facets,
          message: trimmed,
          history,
          exchangeCount: messages.filter((m) => m.role === "user" && !m.hidden).length,
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
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-6 py-8">
      <header className="pb-6">
        <h1 className="text-xl font-semibold text-ink dark:text-white">Snakk med Spir</h1>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">
          Spir tolker resultatet ditt -- den kan ikke endre skårene dine.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {messages
          .filter((m) => !m.hidden)
          .map((m, i) => (
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
        className="flex gap-3 border-t border-warmgray pt-4 pb-8 dark:border-white/10"
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
