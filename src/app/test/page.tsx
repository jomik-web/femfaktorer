"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_QUESTIONS, FREE_QUESTIONS, FREE_TIER_LENGTH } from "@/data/questions";
import type { AnswerValue } from "@/lib/scoring";
import { computeTestResult, type AnswerMap, type ResultTier } from "@/lib/scoring";
import { loadAnswers, saveAnswers } from "@/lib/storage";
import { AnswerScale } from "@/components/AnswerScale";
import { ProgressBar } from "@/components/ProgressBar";

/**
 * To-trinns testflyt (se Grunnlagsdokumentet, beslutning om 120-spørsmål-
 * utvidelse): de første 50 spørsmålene gir et foreløpig resultat for de fem
 * hovedfaktorene. Ved spørsmål 50 stopper vi og spør -- på en smakfull, ikke
 * pushy måte (jf. Dokument 04 KORTRESULTAT-005/008) -- om brukeren vil
 * fortsette til alle 120 for et mer presist resultat og tilgang til Spir.
 */
export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [continuedToFull, setContinuedToFull] = useState(false);
  const [index, setIndex] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const activeQuestions = continuedToFull ? ALL_QUESTIONS : FREE_QUESTIONS;

  // Last lagrede svar ved oppstart (autolagring, Dokument 09 §10.3).
  useEffect(() => {
    const stored = loadAnswers();
    setAnswers(stored.answers);
    setContinuedToFull(stored.continuedToFull);
    const list = stored.continuedToFull ? ALL_QUESTIONS : FREE_QUESTIONS;
    const firstUnanswered = list.findIndex((q) => stored.answers[q.id] === undefined);
    if (firstUnanswered === -1) {
      setShowCheckpoint(!stored.continuedToFull);
    } else {
      setIndex(firstUnanswered);
    }
    setHydrated(true);
  }, []);

  const question = activeQuestions[index];
  const total = activeQuestions.length;

  const firstUnansweredIndex = useMemo(
    () => activeQuestions.findIndex((q) => answers[q.id] === undefined),
    [answers, activeQuestions]
  );

  if (!hydrated) return null;

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
        router.push("/resultat");
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
