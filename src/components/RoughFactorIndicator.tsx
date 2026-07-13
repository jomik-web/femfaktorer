import type { DisplayFactor } from "@/lib/scoring";

const FACTOR_COLOR_CLASS: Record<DisplayFactor, string> = {
  openness: "bg-factor-openness",
  conscientiousness: "bg-factor-conscientiousness",
  extraversion: "bg-factor-extraversion",
  agreeableness: "bg-factor-agreeableness",
  stability: "bg-factor-stability",
};

const ZONE_LABELS = ["Svært lavt", "Lavt", "Middels", "Høyt", "Svært høyt"] as const;

/** 0-19 -> sone 0, 20-39 -> sone 1, ... 80-100 -> sone 4 (5 like brede soner à 20 poeng). */
function zoneIndexFor(score: number): number {
  return Math.min(4, Math.max(0, Math.floor(score / 20)));
}

interface RoughFactorIndicatorProps {
  factor: DisplayFactor;
  label: string;
  score: number; // 0-100, brukes KUN til å avgjøre hvilken av 5 soner -- vises aldri som tall
}

/**
 * Grov, sonebasert indikator for det FORELØPIGE (50-spørsmåls) resultatet.
 * Besluttet etter produkteiers tilbakemelding: et eksakt tall gir et falskt
 * inntrykk av presisjon når mange spørsmål gjenstår for full måling.
 *
 * v2 (ny tilbakemelding): en smal markør plassert midt i en sone så likevel
 * ut til å antyde en presis posisjon. Nå deles skalaen i 5 like brede soner
 * (à 20 poeng), og HELE sonen brukeren havner i fylles med farge -- ingen
 * eksakt punktplassering innenfor sonen. Det presise 120-resultatet bruker
 * fortsatt FactorScale med tall og eksakt posisjon, se den komponenten.
 */
export function RoughFactorIndicator({ factor, label, score }: RoughFactorIndicatorProps) {
  const zoneIndex = zoneIndexFor(score);
  // zoneIndexFor() klemmer alltid til [0, 4], så indekseringen er alltid
  // gyldig i praksis -- fallbacken er kun for å tilfredsstille TypeScripts
  // strenge indekssjekk (noUncheckedIndexedAccess), ikke fordi den kan skje.
  const zoneLabel = ZONE_LABELS[zoneIndex] ?? "Middels";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-ink dark:text-white">{label}</span>
        <span className="text-sm text-ink/60 dark:text-warmgray/60" aria-hidden="true">
          {zoneLabel}
        </span>
      </div>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${label}: foreløpig anslag -- ${zoneLabel.toLowerCase()} -- grovt estimat, ikke et eksakt tall`}
      >
        {ZONE_LABELS.map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full ${
              i === zoneIndex ? FACTOR_COLOR_CLASS[factor] : "bg-warmgray dark:bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
