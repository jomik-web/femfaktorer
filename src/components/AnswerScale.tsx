"use client";

import { useRef } from "react";
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
   * svaralternativene (f.eks. via «neste radiogruppe») fikk da bare
   * «Svaralternativer, radiogruppe», ikke HVILKET spørsmål svaret gjelder.
   * `aria-labelledby` peker nå til selve spørsmålsoverskriften (se
   * test/page.tsx), som er den anbefalte WAI-ARIA-praksisen når en
   * synlig, allerede eksisterende tekst kan gjenbrukes som navn.
   */
  questionHeadingId: string;
}

/**
 * Fast 1-5 svarskala (Dokument 03 §6.2) -- samme ordlyd og rekkefølge overalt.
 *
 * TASTATURMØNSTERET (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 1.3).
 *
 * Fram til nå var `role="radio"` satt på hver knapp uten at oppførselen fulgte
 * med: hvert alternativ var sitt eget tabulatorstopp, og piltastene gjorde
 * ingenting. Det er verre enn å ikke bruke rollen i det hele tatt -- rollen er
 * et LØFTE til hjelpemidler om hvordan noe oppfører seg, og når løftet ikke
 * holdes, navigerer skjermleserbrukeren etter en modell som ikke stemmer.
 *
 * Nå følges WAI-ARIAs radiogroup-mønster:
 *
 *  - ROVING TABINDEX: hele gruppen er ETT tabulatorstopp. Det valgte
 *    alternativet har tabIndex 0; er ingenting valgt ennå, har det første det,
 *    slik at gruppen alltid kan nås. Resten har -1.
 *  - PILTASTER flytter mellom alternativene OG velger samtidig. At pilene
 *    velger direkte er med vilje og i tråd med mønsteret for radiogrupper --
 *    det gjør en 290-spørsmåls test langt raskere å komme gjennom for den som
 *    ikke bruker mus.
 *  - HOME/END hopper til første/siste.
 *  - Listen wrapper rundt (høyre fra siste går til første), som mønsteret
 *    foreskriver.
 *
 * Mellomrom/Enter trengs ikke håndteres eksplisitt: elementene er ekte
 * <button>, som aktiverer onClick på begge tastene av seg selv.
 */
export function AnswerScale({ questionId, value, onAnswer, questionHeadingId }: AnswerScaleProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = OPTIONS.findIndex((o) => o.value === value);
  /** Hvilket alternativ som er «i tur» for tabulator. Se roving tabindex over. */
  const focusableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  function moveTo(nextIndex: number) {
    const wrapped = (nextIndex + OPTIONS.length) % OPTIONS.length;
    const option = OPTIONS[wrapped];
    if (!option) return;
    onAnswer(option.value);
    // Fokus må flyttes eksplisitt: uten dette ville skjermleseren fortsatt
    // stått på det gamle alternativet mens verdien endret seg under føttene
    // på den -- nøyaktig den forvirringen mønsteret er til for å unngå.
    buttonRefs.current[wrapped]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(OPTIONS.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={questionHeadingId}
      className="flex flex-col gap-3 sm:flex-row sm:gap-3"
    >
      {OPTIONS.map((option, index) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === focusableIndex ? 0 : -1}
            name={`answer-${questionId}`}
            onClick={() => onAnswer(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
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
