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

/**
 * Rot-metadata (utvidet v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn
 * 7.1 og 7.2).
 *
 * TITTELMALEN er det viktigste her. `title.template` gjør at hver undersides
 * `title` automatisk får «-- Dine Fasetter» bak seg, slik at sidene får egne,
 * unike titler uten at hver enkelt må gjenta merkenavnet. Fram til nå hadde
 * 17 av 19 sider ingen egen metadata i det hele tatt og arvet forsidens
 * tittel ordrett -- altså 17 sider med identisk tittel i søkeresultatet.
 *
 * openGraph/twitter manglet helt, og det var den mest påfallende mangelen i
 * hele revisjonen: produktet har nettopp fått delbare meme-kort og et
 * Spir-motiv-kort som hele poenget er at folk skal dele -- men lenken de
 * limte inn viste ingen tittel, ingen beskrivelse og intet bilde. Nå gjør
 * den det.
 *
 * metadataBase er nødvendig for at relative bilde-URL-er over skal bli
 * absolutte (OG-bilder MÅ være absolutte). Den leses fra
 * NEXT_PUBLIC_SITE_URL, samme variabel som passkeys henter rpID fra -- ved
 * domenebytte er det altså ett sted å endre, ikke to.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const SITE_DESCRIPTION =
  "Bli litt klokere på hvem du egentlig er. En norsk personlighetstest basert på offentlig tilgjengelig forskning på femfaktormodellen (Big Five).";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dine Fasetter -- Flere sider av deg",
    template: "%s -- Dine Fasetter",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Dine Fasetter",

  /**
   * Kanonisk adresse (v2.50, kvalitetsrevisjon 01.08.2026, funn 7.3).
   *
   * Undersider arver dette som utgangspunkt og får sin egen bane lagt til av
   * Next.js. Poenget er Netlify-permalinkene: hver utrulling får en egen
   * adresse på formen `<hash>--sitenavn.netlify.app`, og uten en kanonisk
   * peker kan de bli indeksert som selvstendige duplikater av hele
   * nettstedet. Samme adresseforvirring har allerede vært et reelt problem
   * for passkeys (se v2.49) -- der ga den en uforståelig feilmelding, her
   * ville den gitt splittet søkeautoritet.
   */
  alternates: {
    canonical: "/",
  },

  /**
   * MERK: openGraph.images og twitter.images settes IKKE her.
   *
   * Bildene ligger som `src/app/opengraph-image.png` og
   * `src/app/twitter-image.png` (1200x630), og Next.js sin filkonvensjon
   * plukker dem opp automatisk og genererer riktige, absolutte URL-er med
   * bredde/høyde. Å i tillegg sette dem her ville gitt to kilder til samme
   * sannhet -- og den ene ville før eller siden blitt glemt ved en endring.
   *
   * Bildene ble laget i v2.50 (funn 7.1): `twitter.card` sto på
   * `summary_large_image` uten at det fantes noe bilde, på et produkt der
   * delbare kort er den største konverteringsinvesteringen som er gjort.
   * Lenker viste tittel og beskrivelse, men tom bilderute.
   */
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Dine Fasetter",
    title: "Dine Fasetter -- Flere sider av deg",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dine Fasetter -- Flere sider av deg",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
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
    /* lang="nb" (v2.50, funn 7.4/1.4): var "no", som er makrospråket norsk.
       Innholdet er utvetydig bokmål, og og:locale sier allerede "nb_NO" --
       de to skal si det samme. Skjermlesere velger uttaleregler ut fra denne
       verdien, så presisjonen har praktisk virkning, ikke bare formell. */
    <html lang="nb" className={`${inter.variable} ${bricolage.variable}`}>
      {plausibleDomain && (
        <head>
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        </head>
      )}
      <body className="min-h-screen font-sans antialiased">
        {/* Hopp til innhold (v2.50, funn 1.3).

            Skjult til den får tastaturfokus, og da synlig som en vanlig
            knapp øverst til venstre. Uten den må en tastaturbruker
            tabulere gjennom hele toppmenyen på nytt for hvert sideskifte --
            og på /test betyr det før hvert eneste spørsmål man navigerer
            tilbake til.

            `sr-only focus:not-sr-only` er Tailwinds standardmønster for
            nettopp dette: elementet er tilgjengelig for hjelpemidler hele
            tiden, men tar ingen visuell plass før noen faktisk trenger det.

            Målet #hovedinnhold settes i SiteNav-søsknenes <main>-elementer;
            se kommentaren der. */}
        <a
          href="#hovedinnhold"
          className="sr-only rounded-lg bg-holo-sky px-4 py-2 font-display font-semibold text-indigo focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Hopp til innhold
        </a>
        {/* v2.46: gjør funksjonsbryterne fra adminpanelet tilgjengelige for
            hele nettstedet. Se FlagsProvider for hvorfor de hentes fra
            klienten og ikke leses her på serveren. */}
        <FlagsProvider>
          <SiteNav />
          <div id="hovedinnhold">{children}</div>
          <SiteFooter />
        </FlagsProvider>
      </body>
    </html>
  );
}
