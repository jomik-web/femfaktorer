import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminEmail } from "@/lib/admin/auth";

/**
 * Layout for hele /admin (v2.50, kvalitetsrevisjon 31.07.2026 kveld,
 * funn 2.2, 7.1 og 7.3).
 *
 * Gjør tre ting, alle på ett sted slik at nye adminsider er dekket
 * automatisk uten at noen må huske det:
 *
 * 1. TILGANGSKONTROLL PÅ SERVEREN, FØR NOE RENDRES.
 *    Adminsidene er klientkomponenter, og tilgangskontrollen lå kun i
 *    API-rutene de kaller. Det er riktig sted for DATAENE -- ingenting lakk
 *    noen gang -- men selve panelet ble rendret for hvem som helst som skrev
 *    inn adressen, og fylte seg så med feilmeldinger. Det er en forvirrende
 *    opplevelse, og det eksponerer strukturen i administrasjonsflaten unødig.
 *
 *    Fordi dette er en server-komponent, kjører sjekken før HTML sendes:
 *    en uinnlogget besøkende havner på /logg-inn og ser aldri panelet.
 *    API-rutenes egne `requireAdminEmail()`-kall står uendret -- de er den
 *    ekte sperren, og skal aldri fjernes til fordel for denne. Dette er et
 *    lag i tillegg, ikke en erstatning: et layout beskytter det som rendres,
 *    ikke det som hentes.
 *
 * 2. NOINDEX. Et administrasjonspanel skal aldri havne i et søkeresultat.
 *    `nocache` og `noimageindex` er med for at en allerede indeksert side
 *    skal falle ut igjen, ikke bare unngå å bli lagt til.
 *
 * 3. METADATA, som klientkomponentene under ikke kan eksportere selv.
 */
export const metadata: Metadata = {
  title: "Administrasjon",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

/**
 * Aldri statisk: tilgangssjekken under leser cookies, og siden skal vurderes
 * på nytt for hver forespørsel.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) {
    // Samme mål for både "ikke innlogget" og "innlogget, men ikke admin" --
    // en vanlig bruker skal ikke få vite at /admin finnes som noe annet enn
    // en side som ikke er for dem.
    redirect("/logg-inn");
  }

  return <>{children}</>;
}
