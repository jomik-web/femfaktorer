"use client";

import type { AnswerValue } from "@/lib/scoring";

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 1, label: "Helt uenig" },
  { value: 2, label: "Litt uenig" },
  { value: 3, label: "Verken enig eller uenig" },
  { value: 4, label: "Litt enig" },
  { value: 5, label: "Helt enig" },
];

interface AnswerScaleProps {
  questionId: string;
  value: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
}

/** Fast 1-5 svarskala (Dokument 03 §6.2) -- samme ordlyd og rekkefølge overalt. */
export function AnswerScale({ questionId, value, onAnswer }: AnswerScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Svaralternativer"
      className="flex flex-col gap-3 sm:flex-row sm:gap-3"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={`answer-${questionId}`}
            onClick={() => onAnswer(option.value)}
            className={[
              "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
              selected
                ? "border-teal bg-mint text-ink dark:bg-teal/20 dark:text-white"
                : "border-warmgray bg-white text-ink hover:border-teal dark:bg-transparent dark:text-warmgray dark:border-white/20",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
