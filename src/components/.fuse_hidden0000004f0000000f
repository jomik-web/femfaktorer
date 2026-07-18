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

/**
 * v2.23 (produkteiers tilbakemelding 17.07.2026): for bipolare fasettnavn
 * ("Bekymring / ro") leser folk naturlig det FØRSTE ordet som det tallet
 * gjelder -- "Svært høyt" ved siden av "Bekymring / ro" leses lett som "mye
 * bekymring", selv om høy skår her (per konvensjonen i scoring.ts) alltid
 * betyr mer av det SISTE ordet. Løsning: naming direkte hvilket ord skåren
 * gjelder ("Svært høy grad av ro"), i stedet for en løsrevet intensitet som
 * krever at leseren allerede kjenner konvensjonen. Gjelder kun fasetter med
 * et bipolart navn (inneholder " / ") -- de 24 andre fasettene og alle fem
 * hovedfaktorene har ett entydig navn og trenger ikke denne behandlingen.
 */
function poleWords(label: string): { low: string; high: string } | null {
  const parts = label.split(" / ");
  if (parts.length !== 2) return null;
  const [low, high] = parts;
  if (!low || !high) return null;
  return { low: low.trim(), high: high.trim() };
}

function lowerFirst(word: string): string {
  return word.length > 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word;
}

function zoneLabelFor(label: string, zoneIndex: number): string {
  const poles = poleWords(label);
  if (!poles || zoneIndex === 2) return ZONE_LABELS[zoneIndex] ?? "Middels";
  const intensity = zoneIndex === 0 || zoneIndex === 4 ? "Svært høy" : "Høy";
  const word = zoneIndex >= 3 ? poles.high : poles.low;
  return `${intensity} grad av ${lowerFirst(word)}`;
}

interface RoughFactorIndicatorProps {
  factor: DisplayFactor;
  label: string;
  score: number; // 0-100, brukes KUN til å avgjøre hvilken av 5 soner -- vises aldri som tall
}

/**
 * Grov, sonebasert indikator -- viser ALDRI et eksakt tall, kun hvilken av 5
 * like brede soner (à 20 poeng) skåren havner i. HELE sonen fylles med farge,
 * ingen eksakt punktplassering innenfor den.
 *
 * Opprinnelig bygget kun for det FORELØPIGE (50-spørsmåls) resultatet, etter
 * produkteiers tilbakemelding om at et eksakt tall gir et falskt inntrykk av
 * presisjon når mange spørsmål gjenstår for full måling.
 *
 * v3 (designgjennomgang, se personvern-/metodesiden): samme resonnement
 * gjelder nå det fulle resultatet også -- hver fasett bygger på bare 4
 * spørsmål og har ikke et reelt normgrunnlag ennå (kun lineær skalering), så
 * et eksakt tall som "94/100" gir et falskt presisjonsinntrykk der også.
 * Komponenten erstatter derfor FactorScale (som viste eksakt tall og
 * posisjon) overalt, ikke bare i det foreløpige resultatet -- FactorScale er
 * fjernet.
 */
export function RoughFactorIndicator({ factor, label, score }: RoughFactorIndicatorProps) {
  const zoneIndex = zoneIndexFor(score);
  const zoneLabel = zoneLabelFor(label, zoneIndex);

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
        aria-label={`${label}: ${zoneLabel.toLowerCase()} -- grovt nivå, ikke et eksakt tall`}
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
