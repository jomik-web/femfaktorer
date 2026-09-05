"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Bryter mellom gratis- og betalt visning (v2.65) -- kun i demoperioden.
 *
 * Se DEMO_VIEW_SWITCH_ENABLED i lib/featureFlags.ts for hvorfor den finnes
 * og hvorfor den skal skrus av før ekte betaling.
 *
 * DEN SKRIVER TIL URL-EN, IKKE TIL LAGRET TILSTAND. To grunner: lenken kan
 * sendes til en tester som da ser nøyaktig samme visning, og en bruker som
 * bare laster siden på nytt kommer tilbake til sin egen, riktige visning.
 * `router.replace` brukes framfor `push` slik at tilbakeknappen fører ut av
 * resultatsiden i stedet for å bla gjennom hver eneste gang man byttet.
 *
 * UTFORMINGEN ER MED VILJE UPYNTELIG. Den er stiplet, liten og merket
 * "Demo" fordi den ikke er en del av produktet -- ser den ut som en vanlig
 * funksjon, tester folk den som en funksjon og rapporterer feil på den.
 */
export function DemoViewSwitch({ previewFree }: { previewFree: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(free: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (free) params.set("visning", "gratis");
    else params.delete("visning");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const base =
    "rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo-sky";
  const active = "bg-indigo text-white dark:bg-white dark:text-indigo";
  const inactive =
    "text-indigo/70 hover:bg-white/60 dark:text-lavender-400/70 dark:hover:bg-white/10";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-indigo/25 bg-white/40 px-4 py-3 dark:border-white/20 dark:bg-white/5 print:hidden">
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo/50 dark:text-lavender-400/50">
        Demo
      </span>
      <div className="flex items-center gap-1" role="group" aria-label="Velg visning">
        <button
          type="button"
          onClick={() => setView(false)}
          aria-pressed={!previewFree}
          className={`${base} ${!previewFree ? active : inactive}`}
        >
          Betalt versjon
        </button>
        <button
          type="button"
          onClick={() => setView(true)}
          aria-pressed={previewFree}
          className={`${base} ${previewFree ? active : inactive}`}
        >
          Gratis versjon
        </button>
      </div>
      <p className="w-full text-xs text-indigo/50 dark:text-lavender-400/50">
        Denne bryteren vises kun mens tjenesten testes, og endrer bare hva du ser -- ikke svarene
        dine.
      </p>
    </div>
  );
}
