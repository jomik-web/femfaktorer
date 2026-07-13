import type { DisplayFactor } from "@/lib/scoring";

const FACTOR_COLOR_CLASS: Record<DisplayFactor, string> = {
  openness: "bg-factor-openness",
  conscientiousness: "bg-factor-conscientiousness",
  extraversion: "bg-factor-extraversion",
  agreeableness: "bg-factor-agreeableness",
  stability: "bg-factor-stability",
};

interface FactorScaleProps {
  factor: DisplayFactor;
  label: string;
  score: number; // 0-100
}

/**
 * Horisontal skala 0-100 med eksakt punktmarkør (Dokument 02 §6, besluttet
 * v1.5: måleusikkerhet formidles kun via tekstspråk, ikke visuelt intervall).
 * Har alltid et tekstalternativ (Dokument 02 §20, WCAG 2.2 AA).
 */
export function FactorScale({ factor, label, score }: FactorScaleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-ink dark:text-white">{label}</span>
        <span className="text-sm text-ink/60 dark:text-warmgray/60" aria-hidden="true">
          {score}/100
        </span>
      </div>
      <div
        className="relative h-3 w-full rounded-full bg-warmgray dark:bg-white/10"
        role="img"
        aria-label={`${label}: ${score} av 100`}
      >
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow ${FACTOR_COLOR_CLASS[factor]}`}
          style={{ left: `calc(${score}% - 8px)` }}
        />
      </div>
    </div>
  );
}
