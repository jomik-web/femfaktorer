"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/slik-fungerer", label: "Slik fungerer det" },
  { href: "/om-femfaktormodellen", label: "Om femfaktormodellen" },
  { href: "/metode-og-kilder", label: "Metode og kilder" },
  { href: "/hjelp", label: "Hjelp" },
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
