import { HTMLAttributes } from "react";

/**
 * Badge -- Designsystem v2.0.
 *
 * Liten pille til status/merker: faktornavn, "ny", "delt", poengsummer.
 * `factor` lar badgen fargelegges automatisk etter en av de fem
 * faktorfargene (se tailwind.config.ts -- theme.colors.factor).
 */

type BadgeTone = "neutral" | "gold" | "holo" | "sky";
type FactorKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "stability";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  factor?: FactorKey;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-lavender-100 text-indigo",
  gold: "bg-gold-light text-plum",
  holo: "bg-holo-gradient text-white",
  sky: "bg-holo-sky text-indigo",
};

/**
 * Filterchip -- den lille pillen man klikker for å filtrere en liste
 * (adminpanelets dagsvelger og område-filter).
 *
 * v2.50 (kvalitetsrevisjon 01.08.2026, funn 3.1): mønsteret var kopiert
 * ordrett to steder. Det er samme sprekk som ga et kritisk kontrastfunn
 * 24.07 -- kopierte stiler er nettopp slik feil sprer seg. Det er bevisst
 * IKKE slått sammen med `buttonClassNames`: en filterchip er en pille som
 * viser en TILSTAND, ikke en handlingsknapp, og å tvinge dem sammen ville
 * gitt en variant som passer dårlig begge steder.
 *
 * Fokusringen kommer fra den globale :focus-visible-regelen i globals.css.
 */
export function filterChipClassNames(active: boolean): string {
  return [
    "rounded-full px-3 py-1 text-xs transition-colors",
    active
      ? "bg-holo-sky font-medium text-indigo"
      : "border border-lavender-400 text-indigo/60 hover:border-holo-sky dark:border-white/15 dark:text-lavender-400/60",
  ].join(" ");
}

const FACTOR_BG: Record<FactorKey, string> = {
  openness: "bg-factor-openness",
  conscientiousness: "bg-factor-conscientiousness",
  extraversion: "bg-factor-extraversion",
  agreeableness: "bg-factor-agreeableness",
  stability: "bg-factor-stability",
};

export function Badge({
  tone = "neutral",
  factor,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const toneClass = factor ? `${FACTOR_BG[factor]} text-white` : TONE_CLASSES[tone];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1",
        "font-display text-xs font-semibold tracking-wide",
        toneClass,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
