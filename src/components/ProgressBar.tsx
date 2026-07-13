interface ProgressBarProps {
  current: number; // 1-basert
  total: number;
}

/** Fremdriftsindikator (Dokument 02 §22/§28). Har alltid et tekstalternativ. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
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
