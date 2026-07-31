"use client";

import Link from "next/link";
import { AccountSavePanel } from "@/components/AccountSavePanel";

/**
 * Verktøy: lagre resultatet på konto (v2.44, 31.07.2026).
 *
 * Flyttet hit fra resultat/page.tsx på produkteiers ønske -- se
 * doc-kommentaren i AccountSavePanel.tsx for begrunnelsen. Selve
 * funksjonaliteten ligger i den komponenten, slik at denne siden kun er
 * innramming (overskrift, forklaring, tilbakelenker), på samme måte som
 * /verktoy/svardata bygger på AnswerSetCsvPanel.
 */
export default function LagreResultatVerktoyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-indigo dark:text-white">
          Verktøy: lagre resultatet ditt
        </h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Knytt resultatet ditt til en e-postadresse, så kan du hente det fram igjen senere -- også
          fra en annen enhet -- uten å ta testen på nytt.
        </p>
      </header>

      <AccountSavePanel />

      <div className="flex flex-wrap gap-4">
        <Link href="/verktoy" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Alle verktøy
        </Link>
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
