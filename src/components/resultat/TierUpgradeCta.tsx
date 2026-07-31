import Link from "next/link";
import { buttonClassNames } from "@/components/ui/Button";
import type { ResultTier } from "@/lib/scoring";

const PRIMARY_MD_LINK_CLASSES = buttonClassNames("primary", "md");

/**
 * Oppfordring til å fortsette til neste nivå (eller lenke til et allerede
 * fullført høyere nivå) -- vises nederst på resultatsiden for "free" og
 * "full". Disse to oppfordringene skjules når brukeren allerede har
 * fullført neste nivå (bare ser på et kortere resultat via
 * rapportvalg-menyen) -- da tilbys en lenke til det andre, allerede ferdige
 * resultatet i stedet for en "fortsett testen"-oppfordring som ikke gir
 * mening lenger. Ingenting vises for "extended" (allerede høyeste nivå).
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx til egen fil, som del av samme opprydding som
 * FreeTierResult/DetailedResult/HistoryTable. Ingen atferdsendring -- de
 * fire opprinnelige `tier ===`-grenene i page.tsx er bevart uendret her.
 */
export function TierUpgradeCta({
  tier,
  unlockedTiers,
}: {
  tier: ResultTier;
  unlockedTiers: Record<ResultTier, boolean>;
}) {
  if (tier === "free" && !unlockedTiers.full) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
        <h2 className="font-display font-semibold text-indigo dark:text-white">
          Vil du se et mer presist resultat?
        </h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Ved å fortsette til alle 120 spørsmål får du en mer presis beregning, og du låser opp
          muligheten til å snakke videre med Spir om resultatet ditt. Resultatet ditt over er
          ikke ufullstendig som beskrivelse av deg fordi du velger å stoppe her -- de resterende
          spørsmålene gir bare en mer detaljert måling.
        </p>
        <Link href="/test" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
          Fortsett til alle 120
        </Link>
      </section>
    );
  }

  if (tier === "free" && unlockedTiers.full) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Du har allerede fullført {unlockedTiers.extended ? "både 120 og 290" : "120"} spørsmål.
        </p>
        <Link href="/resultat?tier=full" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
          Se resultatet fra {unlockedTiers.extended ? "120 spørsmål" : "den versjonen"}
        </Link>
      </section>
    );
  }

  if (tier === "full" && !unlockedTiers.extended) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
        <h2 className="font-display font-semibold text-indigo dark:text-white">Vil du gå enda dypere?</h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Utvidet versjon stiller 10 spørsmål per underkategori i stedet for 4-5 (290 spørsmål
          totalt), viser underkategoriene hver for seg med egen graf, og gir det mest presise
          resultatet Dine Fasetter kan tilby. Resultatet ditt over er ikke ufullstendig fordi du
          velger å stoppe her -- de resterende spørsmålene gir bare en enda sikrere måling.
        </p>
        <Link href="/test" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
          Fortsett til Utvidet versjon
        </Link>
      </section>
    );
  }

  if (tier === "full" && unlockedTiers.extended) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Du har allerede fullført Utvidet versjon (290 spørsmål), med underkategorier og
          samspill-analyser.
        </p>
        <Link href="/resultat?tier=extended" className={`self-start ${PRIMARY_MD_LINK_CLASSES}`}>
          Se den utvidede rapporten
        </Link>
      </section>
    );
  }

  return null;
}
