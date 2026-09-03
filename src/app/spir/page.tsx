"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED } from "@/data/questions";
import {
  computeTestResult,
  computeFacetResults,
  DOMAIN_TO_DISPLAY,
  DISPLAY_FACTOR_LABELS_NO,
  type FactorResult,
  type FacetResult,
} from "@/lib/scoring";
import { loadAnswers } from "@/lib/storage";
import { trackEventOncePerSession } from "@/lib/metrics/client";
import { FACET_ORDER_BY_DOMAIN, FACET_INTERPRETATIONS } from "@/data/facetInterpretations";
import { DOMAIN_DISPLAY_ORDER } from "@/data/combinationInsights";
import { SpirHero } from "@/components/SpirHero";
import { SpirMessageText } from "@/components/SpirMessageText";
import { Button, buttonClassNames } from "@/components/ui/Button";

interface ChatMessage {
  role: "user" | "fem";
  text: string;
  /**
   * Sant for systeminitierte utløsermeldinger (åpning av fri samtale, eller
   * start/fremgang i den guidede gjennomgangen) -- filtreres bort fra det
   * som faktisk vises i chatten, men beholdes i historikken som sendes til
   * Anthropic, siden en samtale der må starte med en "user"-rolle.
   */
  hidden?: boolean;
}

type ChatMode = "free" | "guided";

/** Må matche instruksen serveren bruker for intro-meldingen i fri samtale, se api/spir/route.ts. */
const INTRO_TRIGGER_TEXT = "Start samtalen.";
/** v2.19: skjulte utløsertekster for den guidede gjennomgangen -- selve fasettfokuset ligger i systemprompten (se api/spir/route.ts), ikke i denne teksten. */
const GUIDED_START_TRIGGER = "Start den guidede gjennomgangen med den første underkategorien.";
const GUIDED_NEXT_TRIGGER = "Gå videre til neste underkategori.";

/** Rekkefølge alle fasetter tas opp i under en guidet gjennomgang -- domene for domene (samme rekkefølge som i rapporten), IPIP-standardrekkefølge innad i hvert domene. */
const WALKTHROUGH_ORDER: string[] = DOMAIN_DISPLAY_ORDER.flatMap((domain) => FACET_ORDER_BY_DOMAIN[domain]);

interface GuidedPosition {
  facetCode: string;
  facetLabel: string;
  domainLabel: string;
  isLastFacetOverall: boolean;
}

/**
 * Slår opp all kontekst en guidet forespørsel trenger for én posisjon i
 * WALKTHROUGH_ORDER. Returnerer null ved uventet manglende data i stedet for
 * å late som om en gjetning er trygg (samme prinsipp som ellers i produktet).
 */
function resolveGuidedPosition(index: number): GuidedPosition | null {
  const facetCode = WALKTHROUGH_ORDER[index];
  if (!facetCode) return null;
  const meta = FACET_INTERPRETATIONS[facetCode];
  if (!meta) return null;
  return {
    facetCode,
    facetLabel: meta.label,
    domainLabel: DISPLAY_FACTOR_LABELS_NO[DOMAIN_TO_DISPLAY[meta.domain]],
    isLastFacetOverall: index === WALKTHROUGH_ORDER.length - 1,
  };
}

export default function FemPage() {
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [consented, setConsented] = useState(false);
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [locked, setLocked] = useState(false);
  // Sant så snart Spir har fått i oppdrag å åpne samtalen selv (fri modus)
  // eller hente sin første fasett (guidet modus) -- hindrer at det skjer flere ganger.
  const [introStarted, setIntroStarted] = useState(false);

  // Guidet gjennomgang (v2.19): hvor langt i WALKTHROUGH_ORDER vi har kommet,
  // og hvor mange Spir-svar som er gitt PÅ DENNE fasetten så langt
  // (nullstilles ved hver fremgang). Kun i bruk når mode === "guided".
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [guidedExchangeCountForFacet, setGuidedExchangeCountForFacet] = useState(0);
  // v2.61: hvilke spørsmålsvinkler Spir allerede har brukt på DENNE fasetten
  // -- nullstilles ved hver fremgang, se sendGuidedTrigger. Serveren velger
  // neste ubrukte, se data/questionAngles.ts.
  const [usedAngleIds, setUsedAngleIds] = useState<string[]>([]);
  const [guidedDone, setGuidedDone] = useState(false);

  useEffect(() => {
    // Trakt-telling (v2.46): hvor mange av dem som faktisk har låst opp Spir,
    // som også tar den i bruk. Telles her, ikke ved første melding -- det er
    // forskjell på "åpnet aldri" og "åpnet, men fant ikke ut av det".
    trackEventOncePerSession("spir_opened");
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

  // Fri samtale: lar Spir selv åpne med en refleksjon + spørsmål, i stedet
  // for å vente passivt på at brukeren skal skrive noe først (Anette sin
  // tilbakemelding, se systemPrompt.ts v2.2). Kjøres kun én gang.
  useEffect(() => {
    if (mode !== "free" || !consented || !factors || introStarted) return;
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
  }, [mode, consented, factors, facets, introStarted]);

  // Guidet gjennomgang: henter automatisk den første underkategorien når
  // modusen velges, på samme måte som fri-samtale-effekten over.
  useEffect(() => {
    if (mode !== "guided" || !consented || !factors || introStarted) return;
    setIntroStarted(true);
    void sendGuidedTrigger(0, GUIDED_START_TRIGGER, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, consented, factors, facets, introStarted]);

  async function sendGuidedTrigger(index: number, triggerText: string, historyOverride?: ChatMessage[]) {
    if (!factors) return;
    const position = resolveGuidedPosition(index);
    if (!position) {
      // Skal i praksis ikke skje (index kommer enten fra 0 eller fra
      // advanceGuided sin egen grensesjekk) -- men heller vise sluttskjermen
      // enn å late som om en ugyldig posisjon er en gyldig fasett.
      setGuidedDone(true);
      return;
    }
    const history = historyOverride ?? messages;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/spir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          factors,
          facets,
          message: triggerText,
          intro: true,
          history,
          exchangeCount: history.filter((m) => m.role === "user" && !m.hidden).length,
          guidedFacet: {
            facetCode: position.facetCode,
            exchangeCountForFacet: 0,
            isLastFacetOverall: position.isLastFacetOverall,
            // Ny fasett -- ingen vinkler brukt ennå.
            usedAngleIds: [],
            // v2.63: forskyver startvinkelen, slik at ikke alle fasetter
            // åpner med samme spørsmålstype. Se data/questionAngles.ts.
            facetIndex: index,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      // v2.62 (betatesterfunn): "Når vi trykker gå videre, så får vi en
      // melding at den ikke skjønner og så skjer det ikke noe."
      //
      // Rotårsaken var ikke meldingen, men linjen under den: `setGuidedIndex`
      // kjørte UANSETT, også når svaret var fallback-teksten. Tilstanden gikk
      // altså videre selv om innholdet aldri ble laget -- og trykket brukeren
      // "gå videre" en gang til, hoppet han enda et hakk fram. To
      // underkategorier tapt uten at noe sa fra.
      //
      // Nå står gjennomgangen stille når det ikke kom innhold, slik at et nytt
      // trykk faktisk prøver SAMME fasett på nytt.
      if (data.isFallback) {
        setError(
          "Jeg fikk ikke laget en god innledning til dette temaet akkurat nå. Prøv å trykke én gang til."
        );
        return;
      }
      setMessages([
        ...history,
        { role: "user", text: triggerText, hidden: true },
        { role: "fem", text: data.reply },
      ]);
      setGuidedIndex(index);
      setGuidedExchangeCountForFacet(0);
      setUsedAngleIds(data.usedAngleId ? [data.usedAngleId] : []);
    } catch {
      setError("Fikk ikke kontakt med Spir. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  function advanceGuided() {
    if (loading) return;
    const nextIndex = guidedIndex + 1;
    if (nextIndex >= WALKTHROUGH_ORDER.length) {
      setGuidedDone(true);
      return;
    }
    void sendGuidedTrigger(nextIndex, GUIDED_NEXT_TRIGGER);
  }

  if (!hydrated) return null;

  if (locked || !factors) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <SpirHero className="mb-2" />
        <h1 className="text-xl font-semibold text-indigo dark:text-white">Spir er ikke låst opp ennå</h1>
        <p className="text-indigo/70 dark:text-lavender-400/70">
          Spir er en del av den fulle testen. Fullfør alle 120 spørsmål for å låse opp muligheten
          til å snakke med Spir om resultatet ditt.
        </p>
        <Link href="/test" className={buttonClassNames("primary", "sm")}>
          Gå til testen
        </Link>
      </main>
    );
  }

  // Personvern (Dokument 07 §2, §4.3): resultatet sendes til AI-leverandøren
  // KUN når brukeren aktivt samtykker her -- aldri automatisk. Samtykke og
  // valg av samtaleform (v2.19) skjer på samme skjerm.
  if (!consented || !mode) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12">
        <SpirHero />
        <h1 className="text-xl font-semibold text-indigo dark:text-white">Før du starter</h1>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Starter du en samtale med Spir, sendes resultatet ditt fra hovedfaktorene og
          underfasettene til Anthropic, leverandøren av Spir. Det du selv skriver i chatten,
          sendes også dit. Dette gjør at Spir kan gi mer presise svar, blant annet om karriere,
          relasjoner og sammenhenger mellom flere trekk. Selve testsvarene dine forblir lokalt i
          nettleseren.
        </p>
        <p className="font-semibold text-indigo dark:text-white">
          Ikke del annen personlig informasjon i meldingene dine enn det som trengs for samtalen.
        </p>
        <p className="text-indigo/80 dark:text-lavender-400/80">Du kan velge hvordan samtalen skal foregå:</p>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              setConsented(true);
              setMode("guided");
            }}
            className="text-left"
          >
            Gå gjennom resultatet steg for steg med Spir
            <span className="mt-1 block text-sm font-normal text-indigo/70">
              Spir tar for seg én underkategori om gangen, spør deg om den, og dere går videre
              sammen når du er klar.
            </span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setConsented(true);
              setMode("free");
            }}
            className="rounded-lg border border-holo-skyText px-5 py-3 text-left font-medium text-holo-skyText"
          >
            Snakk fritt med Spir
            <span className="mt-1 block text-sm font-normal text-holo-skyText/80">
              Åpen samtale om hele resultatet, uten en fast rekkefølge.
            </span>
          </button>
          <Link
            href="/resultat"
            className="rounded-lg px-5 py-2.5 text-center font-medium text-indigo/70 dark:text-lavender-400/70"
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

    const guidedPosition = mode === "guided" ? resolveGuidedPosition(guidedIndex) : null;

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
          ...(guidedPosition
            ? {
                guidedFacet: {
                  facetCode: guidedPosition.facetCode,
                  exchangeCountForFacet: guidedExchangeCountForFacet,
                  isLastFacetOverall: guidedPosition.isLastFacetOverall,
                  usedAngleIds,
                  facetIndex: guidedIndex,
                },
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      setMessages([...nextMessages, { role: "fem", text: data.reply }]);
      if (guidedPosition) {
        setGuidedExchangeCountForFacet((n) => n + 1);
        // Serveren melder tilbake hvilken vinkel den valgte, slik at neste
        // spørsmål blir en annen -- se data/questionAngles.ts.
        if (typeof data.usedAngleId === "string") {
          setUsedAngleIds((prev) => (prev.includes(data.usedAngleId) ? prev : [...prev, data.usedAngleId]));
        }
      }
    } catch {
      setError("Fikk ikke kontakt med Spir. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  const guidedPosition = mode === "guided" ? resolveGuidedPosition(guidedIndex) : null;
  const showInput = mode === "free" || (mode === "guided" && !guidedDone);

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col px-6 py-8">
      <header className="pb-6">
        <h1 className="text-xl font-semibold text-indigo dark:text-white">Snakk med Spir</h1>
        <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
          Spir tolker resultatet ditt -- den kan ikke endre skårene dine.
        </p>
        {mode === "guided" && !guidedDone && guidedPosition && (
          <p className="mt-2 text-sm font-medium text-holo-skyText">
            Underkategori {guidedIndex + 1} av {WALKTHROUGH_ORDER.length} -- {guidedPosition.domainLabel}:{" "}
            {guidedPosition.facetLabel}
          </p>
        )}
        {mode === "guided" && guidedDone && (
          <p className="mt-2 text-sm font-medium text-holo-skyText">Gjennomgangen er ferdig.</p>
        )}
      </header>

      {/* aria-live (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 1.2).
          Spirs svar dukker opp i denne listen uten sidelasting. Uten et
          live-område ville en skjermleserbruker sendt et spørsmål og fått
          fullstendig stillhet tilbake, uten noen måte å vite om svaret kom.

          "polite" fordi svaret skal leses når brukeren er klar, ikke avbryte.
          Bevisst UTEN aria-atomic: her skal bare det NYE innlegget leses opp,
          ikke hele samtalen på nytt hver gang -- motsatt av spørsmålsbyttet i
          testen, der hele spørsmålet er én enhet. */}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="flex flex-1 flex-col gap-4 overflow-y-auto"
      >
        {messages
          .filter((m) => !m.hidden)
          .map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "self-end rounded-lg bg-lavender-100 px-4 py-2 dark:bg-holo-sky/20"
                  : "self-start rounded-lg bg-lavender-600 px-4 py-2 dark:bg-white/10"
              }
            >
              <SpirMessageText text={m.text} />
            </div>
          ))}
        {loading && <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Spir skriver …</p>}
        {error && (
          <p role="alert" className="text-sm text-factor-stability">
            {error}
          </p>
        )}
      </div>

      {mode === "guided" && !guidedDone && (
        <div className="flex flex-wrap items-center gap-4 border-t border-lavender-400 pt-4 dark:border-white/10">
          <Button type="button" size="sm" onClick={advanceGuided} disabled={loading}>
            Gå videre til neste underkategori →
          </Button>
          <button
            type="button"
            onClick={() => setGuidedDone(true)}
            disabled={loading}
            className="text-sm font-medium text-indigo/60 underline dark:text-lavender-400/60"
          >
            Avslutt gjennomgangen her
          </button>
        </div>
      )}

      {mode === "guided" && guidedDone && (
        <div className="flex flex-wrap items-center gap-3 border-t border-lavender-400 pt-4 pb-4 dark:border-white/10">
          <Link href="/resultat" className={buttonClassNames("primary", "sm")}>
            Tilbake til resultatet
          </Link>
          <button
            type="button"
            onClick={() => setMode("free")}
            className="rounded-lg border border-holo-skyText px-5 py-2 font-medium text-holo-skyText"
          >
            Fortsett å snakke fritt med Spir
          </button>
        </div>
      )}

      {showInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
          className="flex gap-3 border-t border-lavender-400 pt-4 pb-8 dark:border-white/10"
        >
          <label htmlFor="fem-input" className="sr-only">
            Skriv en melding til Spir
          </label>
          <input
            id="fem-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Spør Spir om resultatet ditt …"
            className="flex-1 rounded-lg border border-lavender-400 px-4 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <Button type="submit" size="sm" disabled={loading}>
            Send
          </Button>
        </form>
      )}
    </main>
  );
}
