interface ProgressBarProps {
  current: number; // 1-basert
  total: number;
}

/**
 * v2.23 (produkteiers ønske: "rask start, sakte slutt" for motivasjon).
 * Selve TALLET under linjen ("Spørsmål X av Y") er alltid ekte og lineært --
 * det er kun den VISUELLE fyllingen av linjen som følger en ease-out-kurve.
 * Dette er en vanlig, ufarlig UX-teknikk (bl.a. i lengre spørreskjemaer):
 * rask oppfattet fremgang tidlig oppleves motiverende, mens fremgangen mot
 * slutten bevisst oppleves som "snart ferdig" lenge før den faktisk er det --
 * i motsetning til lineær fremgang, som kan føles som den bremser opp mot
 * slutten av et langt skjema (120/290 spørsmål).
 *
 * Formel: 1 - (1-t)^EASE_EXPONENT, der t er reell andel fullført (0-1).
 * Eksponent > 1 gir en konkav kurve: stigningen er brattest ved t=0 og avtar
 * mot t=1 (avledet: p*(1-t)^(p-1), synkende for p>1). 1.5 er en moderat
 * verdi -- linjen viser da f.eks. ~65 % ved reelt halvveis, og ~87 % ved
 * reelt tre firedeler. Øk tallet for en sterkere effekt, senk mot 1 for
 * nærmere lineær.
 */
const EASE_EXPONENT = 1.5;

function easedPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  const t = Math.min(1, Math.max(0, current / total));
  return Math.round((1 - Math.pow(1 - t, EASE_EXPONENT)) * 100);
}

/** Fremdriftsindikator (Dokument 02 §22/§28). Har alltid et tekstalternativ. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = easedPercent(current, total);
  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Spørsmål ${current} av ${total}`}
        className="h-2 w-full overflow-hidden rounded-full bg-warmgray dark:bg-white/10"
      >
        <div
          className="h-full rounded-full bg-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink/70 dark:text-warmgray/70">
        Spørsmål {current} av {total}
      </p>
    </div>
  );
}
