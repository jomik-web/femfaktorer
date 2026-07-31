import Link from "next/link";
import { PageBackground } from "@/components/ui/PageBackground";
import { buttonClassNames } from "@/components/ui/Button";

/**
 * 404-side (v2.46, Kvalitetsrevisjon 31.07.2026, kap. 7, middels
 * alvorlighet): Next.js sin innebygde standardside for ukjente URL-er er på
 * engelsk og stilløs -- brøt med at absolutt alt annet på siden er norsk.
 * Denne filen fanges automatisk opp av Next sin App Router for enhver rute
 * som ikke finnes, og rendres inni root-layouten (SiteNav/SiteFooter vises
 * altså fortsatt rundt den).
 */
export default function NotFound() {
  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-indigo dark:text-white">
          Fant ikke siden
        </h1>
        <p className="text-indigo/70 dark:text-lavender-400/70">
          Siden du prøvde å nå finnes ikke, eller har flyttet på seg.
        </p>
        <Link href="/" className={buttonClassNames("primary", "md")}>
          Gå til forsiden
        </Link>
      </main>
    </PageBackground>
  );
}
