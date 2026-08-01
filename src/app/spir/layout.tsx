import type { Metadata } from "next";

/**
 * Layout for /spir (v2.50, funn 7.1).
 *
 * Noindex: siden krever et fullført resultat i localStorage for å ha innhold,
 * så en robot ville sett en tom skjerm. Følgelenker beholdes, slik at
 * navigasjonen herfra fortsatt teller.
 */
export const metadata: Metadata = {
  title: "Snakk med Spir",
  robots: { index: false, follow: true },
};

export default function SpirLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
