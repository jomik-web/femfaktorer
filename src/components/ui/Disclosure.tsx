"use client";

import { useState, type ReactNode } from "react";

/**
 * Disclosure -- Designsystem v2.0.
 *
 * Skjult-som-standard, klikkbar seksjon (accordion) -- brukes til tekst som
 * er viktig å ha tilgjengelig, men som ikke trenger å ta plass før brukeren
 * ber om den (f.eks. "ikke en diagnose"-forbeholdet på resultatsiden).
 * Ren CSS-basert åpne/lukke-animasjon (grid-rows 0fr -> 1fr), ingen
 * målt høyde nødvendig.
 */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className = "",
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 text-left text-sm font-medium text-indigo/70 hover:text-indigo dark:text-lavender-400/70 dark:hover:text-lavender-400"
      >
        <svg
          viewBox="0 0 20 20"
          width={14}
          height={14}
          className={`shrink-0 transition-transform duration-200 print:hidden ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M7 4 L13 10 L7 16"
            stroke="currentColor"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {title}
      </button>
      {/* print:!grid-rows-[1fr] -- innholdet skal alltid være synlig i utskrift/PDF
          (bl.a. krisehjelp-teksten), uansett åpen/lukket tilstand på skjerm. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out print:!grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="flex flex-col gap-2 overflow-hidden pt-2">{children}</div>
      </div>
    </div>
  );
}
