import Link from "next/link";
import { FREE_QUESTIONS } from "@/data/questions";
import SpirMascot from "@/components/SpirMascot";
import { FactorIcon } from "@/components/FactorIcon";
import { PageBackground } from "@/components/ui/PageBackground";
import { buttonClassNames } from "@/components/ui/Button";
import type { DisplayFactor } from "@/lib/scoring";

// Bruker den delte buttonClassNames()-byggeren fra Button (variant="primary"
// size="lg") -- Link kan ikke bruke <Button> direkte (den er en <button>),
// men skal se identisk ut. Var tidligere en lokal, duplisert konstant her --
// slått sammen med Button-komponentets egen kilde (kvalitetsrevisjon
// 2026-07-24) slik at fremtidige fargeendringer (som fokusring-fiksen i
// samme revisjon) ikke må gjøres flere steder.
const PRIMARY_LG_LINK_CLASSES = buttonClassNames("primary", "lg");

const FACTORS: DisplayFactor[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "stability",
];

/**
 * Strukturerte data (JSON-LD) -- v2.50, kvalitetsrevisjon 31.07.2026 kveld,
 * funn 7.4.
 *
 * Hva dette er til: det lar en søkemotor forstå HVA nettstedet er, ikke bare
 * lese teksten. `WebApplication` med `offers: 0 kr` er den typen som best
 * beskriver et gratis, avgrenset verktøy, og er det som kan gi en rikere
 * visning i søkeresultatet.
 *
 * BEVISST UTELATT: `AggregateRating`. Det er fristende (det gir stjerner i
 * søkeresultatet), men vi har ingen ekte vurderinger å vise til, og
 * oppdiktede vurderingsdata er både et brudd på Googles retningslinjer og
 * uærlig. Legges inn hvis og når det finnes reelle tall.
 *
 * `inLanguage: "nb-NO"` er verdt å ha med: testen er norsk, og det er en av
 * de få tingene som faktisk skiller den fra de engelskspråklige
 * Big Five-testene den konkurrerer med i søk.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dine Fasetter",
  url: SITE_URL,
  applicationCategory: "HealthApplication",
  inLanguage: "nb-NO",
  description:
    "Norsk personlighetstest basert på femfaktormodellen (Big Five). Gratis, uten konto, med svarene lagret lokalt i nettleseren din.",
  operatingSystem: "Alle moderne nettlesere",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NOK",
  },
  isAccessibleForFree: true,
};

export default function ForsidePage() {
  // Forsiden viser gratis-inngangen (de første 50) -- ikke hele 120-settet,
  // som er noe man eventuelt fortsetter til etter det foreløpige resultatet.
  const minutes = Math.ceil(FREE_QUESTIONS.length * 0.15); // grovt anslag, ~9 sek/spørsmål

  return (
    <PageBackground>
      {/* JSON-LD, se JSON_LD over. Ligger i en <script type="application/ld+json">
          fordi det er formatet søkemotorene leser -- innholdet vises aldri.
          dangerouslySetInnerHTML er påkrevd her og trygt: strengen kommer fra
          en konstant i denne filen, aldri fra brukerinput. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
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
