import Link from "next/link";
import type { Metadata } from "next";

/**
 * Verktøy-landingsside (v2.44, 31.07.2026, produkteiers ønske).
 *
 * Samler de tingene som handler om å ta vare på eller flytte dataene sine,
 * i motsetning til å lese resultatet. Bakgrunnen var at "Lagre resultatet
 * ditt" lå midt inne i rapporten på /resultat og fylte mye plass med å
 * forklare en funksjon som er avslått under betatestingen.
 *
 * Bevisst en server-komponent (ingen "use client"): siden er ren statisk
 * navigasjon. Selve verktøyene under er klientkomponenter fordi de leser
 * localStorage.
 *
 * Legger du til et nytt verktøy: opprett siden under /verktoy/, legg det inn
 * i TOOLS her, OG i VERKTOY_OPTIONS i components/SiteNav.tsx -- de to listene
 * må holdes i synk manuelt.
 */

export const metadata: Metadata = {
  title: "Verktøy",
  description: "Ta vare på svarene og resultatet ditt: last ned svardata, eller lagre resultatet på en konto.",
};

const TOOLS = [
  {
    href: "/verktoy/svardata",
    title: "Svardata (last ned / last opp)",
    description:
      "Last ned svarene dine som en fil, og last dem opp igjen senere. Nyttig under betatestingen, når testen endrer seg og du slipper å svare på nytt.",
  },
  {
    href: "/verktoy/lagre-resultat",
    title: "Lagre resultatet ditt",
    description:
      "Knytt resultatet til e-postadressen din, så kan du hente det fram igjen fra en annen enhet. Satt på pause under betatestingen.",
  },
] as const;

export default function VerktoyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-indigo dark:text-white">Verktøy</h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Her ligger det som handler om å ta vare på dataene dine, atskilt fra selve resultatet.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex flex-col gap-1.5 rounded-lg border border-lavender-400 p-5 transition-colors hover:border-holo-skyText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo-skyText focus-visible:ring-offset-2 dark:border-white/20 dark:hover:border-holo-sky"
            >
              <span className="font-display font-semibold text-indigo dark:text-white">
                {tool.title}
              </span>
              <span className="text-sm text-indigo/70 dark:text-lavender-400/70">
                {tool.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-4">
        <Link href="/resultat" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til resultatet
        </Link>
        <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}
