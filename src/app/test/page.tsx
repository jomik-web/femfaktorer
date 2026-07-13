"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import type { AnswerValue } from "@/lib/scoring";
import { computeTestResult, type AnswerMap } from "@/lib/scoring";
import { loadAnswers, saveAnswers } from "@/lib/storage";
import { AnswerScale } from "@/components/AnswerScale";
import { ProgressBar } from "@/components/ProgressBar";

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Last lagrede svar ved oppstart (autolagring, Dokument 09 §10.3).
  useEffect(() => {
    const stored = loadAnswers();
    setAnswers(stored);
    const firstUnanswered = QUESTIONS.findIndex((q) => stored[q.id] === undefined);
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setHydrated(true);
  }, []);

  const question = QUESTIONS[index];
  const total = QUESTIONS.length;

  const firstUnansweredIndex = useMemo(
    () => QUESTIONS.findIndex((q) => answers[q.id] === undefined),
    [answers]
  );

  if (!hydrated || !question) return null;

  function handleAnswer(value: AnswerValue) {
    const next: AnswerMap = { ...answers, [question!.id]: value };
    setAnswers(next);
    saveAnswers(next);

    const result = computeTestResult(next);
    if (result.complete) {
      router.push("/resultat");
      return;
    }

    // Automatisk fremdrift (besluttet v1.5): gå til neste, eller til første
    // ubesvarte dersom vi allerede er ved slutten av listen.
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const firstGap = QUESTIONS.findIndex((q) => next[q.id] === undefined);
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
