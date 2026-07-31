import { splitIntoParagraphs, type ClosingSynthesis } from "@/data/interpretations";
import type { DisplayFactor, ResultTier } from "@/lib/scoring";
import { FactorHero } from "@/components/FactorHero";

/**
 * Den avsluttende "Oppsummering"-fanen ("Hva betyr dette for deg?") i den
 * detaljerte visningen (full/extended) -- vises for BÅDE full og extended
 * (facets er tom for "full", så `buildClosingSynthesis` faller naturlig
 * tilbake til kun domenenivå-samspill der).
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx til egen fil -- se filhodet i DetailedResult.tsx for
 * hele opprydningen. Ingen atferdsendring; `closing`-null-sjekken som
 * tidligere lå rundt kallstedet ligger nå inni komponenten selv.
 */
export function ClosingSummarySection({
  closing,
  activeFactor,
  tier,
}: {
  closing: ClosingSynthesis | null;
  activeFactor: DisplayFactor | "summary" | null;
  tier: ResultTier | null;
}) {
  if (!closing) return null;

  return (
    <section
      className={`flex flex-col gap-4 border-t border-lavender-400 pt-8 dark:border-white/10 ${
        activeFactor === "summary" ? "" : "hidden print:flex"
      }`}
      aria-hidden={activeFactor !== "summary"}
    >
      <FactorHero factor="summary" className="w-full rounded-2xl" />
      <h2 className="font-display text-xl font-semibold text-indigo dark:text-white">Hva betyr dette for deg?</h2>
      {/* v2.36: Utvidet (290) deles i flere avsnitt enn Standard
          (120) -- en STRUKTURELL forskjell, ikke bare avhengig av at
          richCombos-teksten tilfeldigvis blir lang nok av seg selv. */}
      {splitIntoParagraphs(closing.text, tier === "extended" ? 3 : 2).map((p, i) => (
        <p key={i} className="text-indigo/80 dark:text-lavender-400/80">
          {p}
        </p>
      ))}
    </section>
  );
}
