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
  /**
   * v2.42 (Kvalitetsrevisjon 31.07.2026, kap. 1, middels alvorlighet --
   * uendret funn fra forrige revisjon): radiogruppen hadde tidligere kun en
   * generisk `aria-label="Svaralternativer"`, uten programmatisk kobling til
   * selve spørsmålsteksten. En skjermleserbruker som hopper rett til
   * svaralternativene (f.eks. via "neste radiogruppe") fikk da bare
   * "Svaralternativer, radiogruppe", ikke HVILKET spørsmål svaret gjelder.
   * `aria-labelledby` peker nå til selve spørsmålsoverskriften (se
   * test/page.tsx), som er den anbefalte WAI-ARIA-praksisen når en
   * synlig, allerede eksisterende tekst kan gjenbrukes som navn.
   */
  questionHeadingId: string;
}

/** Fast 1-5 svarskala (Dokument 03 §6.2) -- samme ordlyd og rekkefølge overalt. */
export function AnswerScale({ questionId, value, onAnswer, questionHeadingId }: AnswerScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={questionHeadingId}
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
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-holo-skyText",
              selected
                ? "border-holo-sky bg-lavender-100 text-indigo dark:bg-holo-sky/20 dark:text-white"
                : "border-lavender-400 bg-white text-indigo hover:border-holo-sky dark:bg-transparent dark:text-lavender-400 dark:border-white/20",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
