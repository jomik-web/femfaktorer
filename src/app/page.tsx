import Link from "next/link";
import { FREE_QUESTIONS } from "@/data/questions";
import SpirMascot from "@/components/SpirMascot";
import { FactorIcon } from "@/components/FactorIcon";
import { PageBackground } from "@/components/ui/PageBackground";
import type { DisplayFactor } from "@/lib/scoring";

// Klasser hentet 1:1 fra Button (variant="primary" size="lg") -- Link kan
// ikke bruke <Button> direkte (den er en <button>), men skal se identisk ut.
const PRIMARY_LG_LINK_CLASSES =
  "font-display font-semibold transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo-sky focus-visible:ring-offset-2 " +
  "bg-holo-sky text-indigo shadow-sm hover:opacity-90 hover:shadow-md active:opacity-100 active:scale-[0.98] " +
  "px-8 py-4 text-lg rounded-2xl";

const FACTORS: DisplayFactor[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "stability",
];

export default function ForsidePage() {
  // Forsiden viser gratis-inngangen (de første 50) -- ikke hele 120-settet,
  // som er noe man eventuelt fortsetter til etter det foreløpige resultatet.
  const minutes = Math.ceil(FREE_QUESTIONS.length * 0.15); // grovt anslag, ~9 sek/spørsmål

  return (
    <PageBackground>
      <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 overflow-hidden px-6 py-16 text-center">
        {/* Myk, uskarp glød bak Spir -- gir dybde uten å bli støyete */}
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-holo-gradient opacity-20 blur-3xl"
          aria-hidden="true"
        />

        <SpirMascot expression="oppmuntrende" size={120} className="relative" />
        <h1 className="font-display text-3xl font-bold text-indigo dark:text-white sm:text-4xl">
          Dine Fasetter
        </h1>
        <p className="text-lg font-medium text-holo-skyText">Flere sider av deg</p>
        <p className="max-w-md text-indigo/80 dark:text-lavender-400/80">
          Bli litt klokere på hvem du egentlig er. En norsk personlighetstest basert på
          offentlig tilgjengelig forskning på femfaktormodellen (Big Five).
        </p>

        <div className="flex gap-3" aria-hidden="true">
          {FACTORS.map((factor) => (
            <FactorIcon key={factor} factor={factor} size={32} />
          ))}
        </div>

        <p className="rounded-full bg-lavender-100 px-4 py-1.5 text-sm text-indigo/70 dark:bg-white/10 dark:text-lavender-400/80">
          {FREE_QUESTIONS.length} gratis spørsmål &middot; ca. {minutes} minutter &middot; helt anonymt
        </p>

        <Link href="/test" className={PRIMARY_LG_LINK_CLASSES}>
          Start testen
        </Link>
        <Link
          href="/slik-fungerer"
          className="text-sm text-indigo/70 underline underline-offset-2 dark:text-lavender-400/70"
        >
          Se hvordan testen fungerer
        </Link>
        <p className="max-w-md text-xs text-indigo/50 dark:text-lavender-400/50">
          Svarene dine lagres bare i denne nettleseren. Ingen konto er nødvendig.
        </p>
      </main>
    </PageBackground>
  );
}
