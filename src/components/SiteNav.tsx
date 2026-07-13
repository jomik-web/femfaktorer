"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Forside" },
  { href: "/test", label: "Test" },
  { href: "/resultat", label: "Resultat" },
  { href: "/spir", label: "Spir" },
];

/**
 * Enkel, gjennomgående navigasjon slik at brukeren kan bevege seg fram og
 * tilbake i løsningen uten å måtte bruke nettleserens tilbake-knapp.
 * Vises ikke på /admin -- det er et eget, avgrenset område (§10.1).
 */
export function SiteNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-warmgray bg-white/90 backdrop-blur dark:border-white/10 dark:bg-ink/90">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold text-ink dark:text-white">
          FemFaktorer
        </Link>
        <ul className="flex gap-4 text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-medium text-teal"
                      : "text-ink/70 hover:text-teal dark:text-warmgray/70"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
