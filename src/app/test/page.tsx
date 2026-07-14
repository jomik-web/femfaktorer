"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_QUESTIONS, FREE_QUESTIONS, FREE_TIER_LENGTH, OPTIONAL_O6_QUESTIONS } from "@/data/questions";
import type { AnswerValue, FactorResult, FacetResult } from "@/lib/scoring";
import { computeTestResult, computeFacetResults, type AnswerMap, type ResultTier } from "@/lib/scoring";
import {
  loadAnswers,
  saveAnswers,
  loadO6,
  saveO6,
  loadAgeConfirmed,
  saveAgeConfirmed,
  type O6ConsentStatus,
} from "@/lib/storage";
import { AnswerScale } from "@/components/AnswerScale";
import { ProgressBar } from "@/components/ProgressBar";

/**
 * To-trinns testflyt (se Grunnlagsdokumentet, beslutning om 120-spørsmål-
 * utvidelse): de første 50 spørsmålene gir et foreløpig resultat for de fem
 * hovedfaktorene. Ved spørsmål 50 stopper vi og spør -- på en smakfull, ikke
 * pushy måte (jf. Dokument 04 KORTRESULTAT-005/008) -- om brukeren vil
 * fortsette til alle 120 for et mer presist resultat og tilgang til Spir.
 *
 * Etter fullført 120-test tilbys en HELT VALGFRI bonusseksjon (O6, se
 * questions.ts) med eget, uttrykkelig samtykke (GDPR art. 9(2)(a)).
 * Produkteier har besluttet (14.07.2026) at funksjonen beholdes permanent.
 */

/**
 * Sender de FERDIG BEREGNEDE skårene (ikke svarene) til det anonyme,
 * aggregerte normtelling-endepunktet -- v2.8, se
 * src/app/api/stats/submit-norm/route.ts og personvernsiden. Kalles KUN når
 * hele 120-testen er fullført. Bevisst "fire-and-forget": venter ikke på
 * svaret, blokkerer aldri navigasjonen, og feiler helt stille -- dette er
 * usynlig infrastruktur, ikke noe brukeren skal merke eller kunne se feile.
 */
function submitAnonymousNormStats(factors: FactorResult[], facets: FacetResult[]): void {
  void fetch("/api/stats/submit-norm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ factors, facets }),
  }).catch(() => {
    // Stille -- se doc-kommentar over.
  });
}

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [continuedToFull, setContinuedToFull] = useState(false);
  const [index, setIndex] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [o6Status, setO6Status] = useState<O6ConsentStatus>("not_asked");
  const [o6Answers, setO6Answers] = useState<AnswerMap>({});
  const [o6Phase, setO6Phase] = useState<"none" | "offer" | "questions">("none");
  const [o6Index, setO6Index] = useState(0);

  // Aldersbekreftelse (v2.6, Dokument 07 §8) -- vises før noe annet dersom
  // ikke tidligere bekreftet på denne enheten. "declined" viser en enkel
  // avvisningsskjerm i stedet for å sende brukeren videre inn i testen.
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageDeclined, setAgeDeclined] = useState(false);

  const activeQuestions = continuedToFull ? ALL_QUESTIONS : FREE_QUESTIONS;

  // Last lagrede svar ved oppstart (autolagring, Dokument 09 §10.3).
  useEffect(() => {
    setAgeConfirmed(loadAgeConfirmed());
    const stored = loadAnswers();
    setAnswers(stored.answers);
    setContinuedToFull(stored.continuedToFull);
    const storedO6 = loadO6();
    setO6Status(storedO6.status);
    setO6Answers(storedO6.answers);

    const list = stored.continuedToFull ? ALL_QUESTIONS : FREE_QUESTIONS;
    const firstUnanswered = list.findIndex((q) => stored.answers[q.id] === undefined);
    if (firstUnanswered === -1) {
      if (!stored.continuedToFull) {
        setShowCheckpoint(true);
      } else {
        goToO6OrResult(storedO6.status, storedO6.answers);
      }
    } else {
      setIndex(firstUnanswered);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = activeQuestions[index];
  const total = activeQuestions.length;

  const firstUnansweredIndex = useMemo(
    () => activeQuestions.findIndex((q) => answers[q.id] === undefined),
    [answers, activeQuestions]
  );

  /** Etter fullført 120-test: avgjør om O6-tilbudet skal vises, fortsettes, eller hoppes over. */
  function goToO6OrResult(status: O6ConsentStatus, o6answers: AnswerMap) {
    if (status === "not_asked") {
      setO6Phase("offer");
      return;
    }
    if (status === "consented") {
      const unanswered = OPTIONAL_O6_QUESTIONS.some((q) => o6answers[q.id] === undefined);
      if (unanswered) {
        setO6Index(OPTIONAL_O6_QUESTIONS.findIndex((q) => o6answers[q.id] === undefined));
        setO6Phase("questions");
        return;
      }
    }
    router.push("/resultat");
  }

  if (!hydrated) return null;

  if (ageDeclined) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
          FemFaktorer er foreløpig for voksne
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Denne versjonen av testen er laget for personer over 18 år. Ingenting er lagret eller
          sendt noe sted.
        </p>
        <Link href="/" className="self-center text-sm text-teal underline underline-offset-2">
          Tilbake til forsiden
        </Link>
      </main>
    );
  }

  if (!ageConfirmed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
          Før du starter
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer er i denne versjonen laget for personer over 18 år.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              saveAgeConfirmed();
              setAgeConfirmed(true);
            }}
            className="rounded-lg bg-teal px-6 py-3 font-medium text-white"
          >
            Ja, jeg er 18 år eller eldre
          </button>
          <button
            type="button"
            onClick={() => setAgeDeclined(true)}
            className="rounded-lg px-6 py-3 font-medium text-ink/70 dark:text-warmgray/70"
          >
            Nei, jeg er under 18
          </button>
        </div>
      </main>
    );
  }

  if (o6Phase === "offer") {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
          En helt valgfri tilleggsseksjon
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Vi tilbyr fire ekstra spørsmål om en sjette side ved åpenhet for erfaring, som handler om
          politiske og verdimessige holdninger. Disse påvirker IKKE hovedresultatet ditt over -- de
          vises eventuelt som et helt eget, atskilt tillegg.
        </p>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">
          Dette er informasjon om politisk oppfatning, en særlig kategori persondata. Du kan når som
          helst slette akkurat denne dataen uavhengig av resten av testresultatet ditt.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              setO6Status("consented");
              saveO6("consented", o6Answers);
              setO6Index(0);
              setO6Phase("questions");
            }}
            className="rounded-lg bg-teal px-6 py-3 font-medium text-white"
          >
            Ja, jeg vil svare
          </button>
          <button
            type="button"
            onClick={() => {
              setO6Status("declined");
              saveO6("declined", {});
              setO6Phase("none");
              router.push("/resultat");
            }}
            className="rounded-lg px-6 py-3 font-medium text-ink/70 dark:text-warmgray/70"
          >
            Nei takk
          </button>
        </div>
      </main>
    );
  }

  if (o6Phase === "questions") {
    const o6Question = OPTIONAL_O6_QUESTIONS[o6Index];
    if (!o6Question) {
      router.push("/resultat");
      return null;
    }
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-12">
        <ProgressBar current={o6Index + 1} total={OPTIONAL_O6_QUESTIONS.length} />
        <div key={o6Question.id} className="flex flex-col gap-6">
          <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
            {o6Question.textNo}
          </h1>
          <AnswerScale
            questionId={o6Question.id}
            value={o6Answers[o6Question.id]}
            onAnswer={(value) => {
              const next = { ...o6Answers, [o6Question.id]: value };
              setO6Answers(next);
              saveO6("consented", next);
              if (o6Index < OPTIONAL_O6_QUESTIONS.length - 1) {
                setO6Index(o6Index + 1);
              } else {
                router.push("/resultat");
              }
            }}
          />
        </div>
      </main>
    );
  }

  if (showCheckpoint) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
          Du har svart på de første {FREE_TIER_LENGTH} spørsmålene
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Vil du se hva som ligger bak hovedtrekkene? Ved å fortsette til alle 120 spørsmål får du
          et mer presist resultat, og du låser opp muligheten til å snakke videre med Spir om det.
        </p>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">
          Resultatet ditt er ikke ufullstendig som beskrivelse av deg fordi du velger å stoppe her
          -- de resterende spørsmålene gir bare en mer detaljert måling.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              setContinuedToFull(true);
              saveAnswers(answers, true);
              setShowCheckpoint(false);
              const nextIndex = ALL_QUESTIONS.findIndex((q) => answers[q.id] === undefined);
              setIndex(nextIndex === -1 ? 0 : nextIndex);
            }}
            className="rounded-lg bg-teal px-6 py-3 font-medium text-white"
          >
            Fortsett til alle 120
          </button>
          <button
            type="button"
            onClick={() => router.push("/resultat")}
            className="rounded-lg px-6 py-3 font-medium text-ink/70 dark:text-warmgray/70"
          >
            Behold det foreløpige resultatet
          </button>
        </div>
      </main>
    );
  }

  if (!question) return null;

  function handleAnswer(value: AnswerValue) {
    const next: AnswerMap = { ...answers, [question!.id]: value };
    setAnswers(next);
    saveAnswers(next, continuedToFull);

    const tier: ResultTier = continuedToFull ? "full" : "free";
    const result = computeTestResult(next, activeQuestions, tier);
    if (result.complete) {
      if (tier === "free") {
        setShowCheckpoint(true);
      } else {
        submitAnonymousNormStats(result.factors ?? [], computeFacetResults(next, ALL_QUESTIONS));
        goToO6OrResult(o6Status, o6Answers);
      }
      return;
    }

    // Automatisk fremdrift (besluttet v1.5): gå til neste, eller til første
    // ubesvarte dersom vi allerede er ved slutten av listen.
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const firstGap = activeQuestions.findIndex((q) => next[q.id] === undefined);
      if (firstGap !== -1) setIndex(firstGap);
    }
  }

  function goBack() {
    if (index > 0) setIndex(index - 1);
  }

  function jumpToFirstUnanswered() {
    if (firstUnansweredIndex !== -1) setIndex(firstUnansweredIndex);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-12">
      <ProgressBar current={index + 1} total={total} />

      {firstUnansweredIndex !== -1 && firstUnansweredIndex !== index && (
        <button
          type="button"
          onClick={jumpToFirstUnanswered}
          className="self-start text-sm text-teal underline underline-offset-2"
        >
          Hopp til første ubesvarte spørsmål
        </button>
      )}

      <div key={question.id} className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
          {question.textNo}
        </h1>
        <AnswerScale
          questionId={question.id}
          value={answers[question.id]}
          onAnswer={handleAnswer}
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          className="rounded px-4 py-2 text-sm font-medium text-ink/70 disabled:opacity-30 dark:text-warmgray/70"
        >
          &larr; Tilbake
        </button>
      </div>
    </main>
  );
}
