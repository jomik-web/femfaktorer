import { HTMLAttributes } from "react";

/**
 * Badge -- Designsystem v2.0.
 *
 * Liten pille til status/merker: faktornavn, "ny", "delt", poengsummer.
 * `factor` lar badgen fargelegges automatisk etter en av de fem
 * faktorfargene (se tailwind.config.ts -- theme.colors.factor).
 */

type BadgeTone = "neutral" | "gold" | "holo";
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
};

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
