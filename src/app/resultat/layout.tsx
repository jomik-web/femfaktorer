import type { Metadata } from "next";

/**
 * Layout for /resultat (v2.50, funn 7.1 og 7.3).
 *
 * NOINDEX er bevisst her. Resultatsiden er en klientside som leser svarene
 * fra localStorage, så det finnes ingen personopplysninger å indeksere for en
 * søkemotorrobot -- den ville sett en tom side. Men nettopp derfor bør den
 * heller ikke indekseres: en tom, innholdsløs side i søkeresultatet er dårlig
 * for både bruker og domenets samlede kvalitetsinntrykk. Og skulle siden en
 * gang få en delbar URL med resultat i (jf. delekortene), er noindex allerede
 * på plass i stedet for noe man må huske å legge til.
 */
export const metadata: Metadata = {
  title: "Resultatet ditt",
  robots: { index: false, follow: true },
};

export default function ResultatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
