import { Fragment } from "react";

/**
 * Spir (Anthropic-modellen) skriver av og til enkel Markdown i svarene sine
 * -- "**fet skrift**", "*kursiv*", og noen ganger en "# Overskrift"-linje,
 * selv om chatten bare viste rå tegn til brukeren tidligere (rapportert
 * 20.07.2026: symbolene * og # dukket opp bokstavelig i chatboblene). Denne
 * komponenten tolker den samme, bevisst begrensede Markdown-varianten
 * systemPrompt.ts nå ber Spir bruke (se regel 11 der) -- KUN fet skrift,
 * kursiv, og en "#"-linje som Spir egentlig ikke skal bruke lenger (se
 * samme regel), men som vises pent som en fet linje her i tilfelle den
 * likevel dukker opp. Ingen andre Markdown-konstruksjoner (lister, lenker,
 * kodeblokker) støttes -- Spir er ikke bedt om å bruke dem.
 */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(INLINE_PATTERN).filter((part) => part.length > 0);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function SpirMessageText({ text }: { text: string }) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => {
        const headingMatch = line.match(/^#{1,6}\s+(.*)/);
        if (headingMatch) {
          return (
            <div key={i} className="font-semibold">
              {renderInline(headingMatch[1] ?? "", `h${i}`)}
            </div>
          );
        }
        return (
          <div key={i}>{renderInline(line, `l${i}`)}</div>
        );
      })}
    </div>
  );
}
