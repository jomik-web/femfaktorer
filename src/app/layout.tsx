import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Overskriftsfont for Designsystem v2.0 -- se DS2_00_Designsystem_v2.md.
// Bevisst "håndsatt"/uperfekt grotesk (i motsetning til Inters nøytrale
// presisjon) for å gi merkevaren mer personlighet i store flater
// (H1/H2, knappetekst, tall/resultater), mens Inter beholdes til brødtekst
// og lange leseflater der nøytral lesbarhet er viktigst.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dine Fasetter -- Flere sider av deg",
  description:
    "Bli litt klokere på hvem du egentlig er. En norsk personlighetstest basert på offentlig tilgjengelig forskning på femfaktormodellen (Big Five).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
