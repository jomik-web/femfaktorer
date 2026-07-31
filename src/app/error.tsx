"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageBackground } from "@/components/ui/PageBackground";
import { buttonClassNames } from "@/components/ui/Button";

/**
 * Feilside (v2.46, Kvalitetsrevisjon 31.07.2026, kap. 7, middels
 * alvorlighet): Next.js sin innebygde standard-feilside er på engelsk --
 * samme funn/begrunnelse som not-found.tsx. Next krever at denne filen er
 * en Client Component (`"use client"`) og tar imot `error`/`reset`-props --
 * `reset()` prøver å rendre den samme rutesegmentet på nytt uten en full
 * sideinnlasting.
 *
 * Logger KUN feilmeldingen til nettleserkonsollen (ikke noe
 * personopplysning/resultatdata) -- til feilsøking, ikke til brukeren.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[feilside]", error);
  }, [error]);

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-indigo dark:text-white">
          Noe gikk galt
        </h1>
        <p className="text-indigo/70 dark:text-lavender-400/70">
          Det oppstod en uventet feil. Prøv gjerne igjen, eller gå tilbake til forsiden.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className={buttonClassNames("secondary", "md")}>
            Prøv igjen
          </button>
          <Link href="/" className={buttonClassNames("primary", "md")}>
            Gå til forsiden
          </Link>
        </div>
      </main>
    </PageBackground>
  );
}
