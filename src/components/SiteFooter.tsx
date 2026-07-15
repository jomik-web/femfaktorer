"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_SAVE_ENABLED } from "@/lib/featureFlags";

const LINKS = [
  // v2.5: /om-femfaktormodellen og /metode-og-kilder er slått sammen inn i
  // /slik-fungerer ("Om FemFaktorer") -- se redirect-filene i de gamle
  // mappene. Personvern flyttet til egen, fullstendig side.
  { href: "/slik-fungerer", label: "Om FemFaktorer" },
  { href: "/personvern", label: "Personvern" },
  { href: "/hjelp", label: "Hjelp" },
  // Lagret fullversjon-resultat (v2.4) -- gjelder kun fulltesten, se
  // resultat/page.tsx. Skjules midlertidig når ACCOUNT_SAVE_ENABLED er
  // slått av (v2.16, se lib/featureFlags.ts).
  ...(ACCOUNT_SAVE_ENABLED ? [{ href: "/logg-inn", label: "Logg inn" }] : []),
];

/**
 * Informasjonslenker fra Dokument 04, NAV-001. Lagt i bunnteksten i stedet
 * for i den faste toppmenyen (SiteNav), slik at toppmenyen kan holdes
 * fokusert på selve brukerreisen (fram/tilbake i testflyten).
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-warmgray py-8 dark:border-white/10">
      <nav className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 px-6 text-sm text-ink/60 dark:text-warmgray/60">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-teal">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
