import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { FlagsProvider } from "@/components/FlagsProvider";

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

/**
 * Besøksstatistikk (v2.46, 31.07.2026): Plausible.
 *
 * VALGT NETTOPP FORDI DEN IKKE KREVER SAMTYKKEBANNER. Plausible setter ingen
 * informasjonskapsler og lagrer ingenting på besøkendes enhet, og utdataene
 * er rene aggregater. Det er den kombinasjonen som gjør at målingen faller
 * utenfor samtykkekravet i ePrivacy/GDPR -- en uavhengig juridisk vurdering
 * av dette er publisert av leverandøren. Data hostes i EU.
 *
 * Personvernerklæringen har varslet nettopp dette verktøyet ved navn siden
 * v2.x, så ingen løftebrudd -- men teksten der må oppdateres fra "hvis vi en
 * gang..." til "vi gjør dette nå".
 *
 * Skriptet lastes KUN når NEXT_PUBLIC_PLAUSIBLE_DOMAIN er satt i Netlify.
 * Uten den variabelen skjer det ingen måling i det hele tatt -- lokal
 * utvikling forurenser dermed ikke statistikken.
 */
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={`${inter.variable} ${bricolage.variable}`}>
      {plausibleDomain && (
        <head>
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        </head>
      )}
      <body className="min-h-screen font-sans antialiased">
        {/* v2.46: gjør funksjonsbryterne fra adminpanelet tilgjengelige for
            hele nettstedet. Se FlagsProvider for hvorfor de hentes fra
            klienten og ikke leses her på serveren. */}
        <FlagsProvider>
          <SiteNav />
          {children}
          <SiteFooter />
        </FlagsProvider>
      </body>
    </html>
  );
}
