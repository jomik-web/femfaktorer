import type { DisplayFactor } from "@/lib/scoring";
import { bandFor, type Band } from "@/data/interpretations";

const FACTOR_COLOR_CLASS: Record<DisplayFactor, string> = {
  openness: "bg-factor-openness",
  conscientiousness: "bg-factor-conscientiousness",
  extraversion: "bg-factor-extraversion",
  agreeableness: "bg-factor-agreeableness",
  stability: "bg-factor-stability",
};

const BAND_LABEL: Record<Band, string> = {
  low: "mot lavere enden",
  mid: "nær midten",
  high: "mot høyere enden",
};

// Markøren senteres midt i den tredjedelen av skalaen båndet tilhører --
// IKKE på den eksakte poengsummen (se filhode-kommentar under komponenten).
const BAND_CENTER_PERCENT: Record<Band, number> = { low: 16.5, mid: 50, high: 83.5 };

interface RoughFactorIndicatorProps {
  factor: DisplayFactor;
  label: string;
  score: number; // 0-100, brukes KUN til å avgjøre sone -- vises aldri som tall
}

/**
 * Grov, sonebasert indikator for det FORELØPIGE (50-spørsmåls) resultatet.
 * Besluttet etter produkteiers tilbakemelding: et eksakt tall og en presis
 * plassering gir et falskt inntrykk av presisjon når mange spørsmål gjenstår
 * for full måling. Derfor: ingen tallverdi, og markøren plasseres midt i
 * riktig tredjedel (lav/midt/høy) -- ikke på det faktiske skårpunktet -- og
 * vises bredere/mykere enn den eksakte prikken i FactorScale (som brukes for
 * det presise 120-resultatet, se den komponenten).
 */
export function RoughFactorIndicator({ factor, label, score }: RoughFactorIndicatorProps) {
  const band = bandFor(score);
  const centerPercent = BAND_CENTER_PERCENT[band];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-ink dark:text-white">{label}</span>
        <span className="text-sm text-ink/60 dark:text-warmgray/60" aria-hidden="true">
          {BAND_LABEL[band]}
        </span>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-warmgray dark:bg-white/10"
        role="img"
        aria-label={`${label}: foreløpig anslag ${BAND_LABEL[band]} -- grovt estimat, ikke et eksakt tall`}
      >
        {/* Svake skillelinjer mellom de tre sonene, for å signalisere "sone" fremfor "punkt". */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/70 dark:bg-ink/40" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/70 dark:bg-ink/40" />
        <div
          className={`absolute top-1/2 h-4 w-10 -translate-y-1/2 rounded-full opacity-60 blur-[1px] ${FACTOR_COLOR_CLASS[factor]}`}
          style={{ left: `calc(${centerPercent}% - 20px)` }}
        />
      </div>
    </div>
  );
}
