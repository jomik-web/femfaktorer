"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFlags } from "@/components/FlagsProvider";

// v2.5: /om-femfaktormodellen og /metode-og-kilder er slått sammen inn i
// /slik-fungerer ("Om Dine Fasetter") -- se redirect-filene i de gamle
// mappene. Personvern flyttet til egen, fullstendig side.
const BASE_LINKS = [
  { href: "/slik-fungerer", label: "Om Dine Fasetter" },
  { href: "/priser", label: "Nivåer og priser" },
  { href: "/personvern", label: "Personvern" },
  { href: "/hjelp", label: "Hjelp" },
];

/**
 * Informasjonslenker fra Dokument 04, NAV-001. Lagt i bunnteksten i stedet
 * for i den faste toppmenyen (SiteNav), slik at toppmenyen kan holdes
 * fokusert på selve brukerreisen (fram/tilbake i testflyten).
 */
export function SiteFooter() {
  const pathname = usePathname();
  // v2.46: bryteren leses nå i komponenten, ikke på modulnivå -- den kan
  // endres fra adminpanelet mens siden kjører, og en modulkonstant ville
  // vært låst til verdien den hadde da bygget ble laget.
  const { accountSaveEnabled } = useFlags();
  if (pathname?.startsWith("/admin")) return null;

  const links = accountSaveEnabled
    ? [...BASE_LINKS, { href: "/logg-inn", label: "Logg inn" }]
    : BASE_LINKS;

  return (
    <footer className="border-t border-lavender-400 py-8 dark:border-white/10">
      <nav className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 px-6 text-sm text-indigo/60 dark:text-lavender-400/60">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-holo-skyText">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
