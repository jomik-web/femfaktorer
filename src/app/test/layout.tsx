import type { Metadata } from "next";

/**
 * Layout for /test (v2.50, funn 7.1). Testsiden er en klientkomponent og kan
 * ikke eksportere metadata selv.
 *
 * Denne INDEKSERES, i motsetning til /resultat og /logg-inn: «ta
 * personlighetstest» er nettopp det folk søker etter, og dette er siden de
 * skal lande på.
 */
export const metadata: Metadata = {
  title: "Ta testen",
  description:
    "Svar på 50, 120 eller 290 spørsmål -- du velger selv hvor langt du vil gå. Gratis, uten konto, og svarene blir liggende i din egen nettleser.",
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
