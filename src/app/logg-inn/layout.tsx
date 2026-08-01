import type { Metadata } from "next";

/**
 * Layout for /logg-inn (v2.50, funn 7.1 og 7.3). Noindex: en
 * innloggingsside har ingen verdi i et søkeresultat, og å indeksere den
 * flytter bare autoritet bort fra sidene som faktisk skal rangere.
 */
export const metadata: Metadata = {
  title: "Logg inn",
  robots: { index: false, follow: true },
};

export default function LoggInnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
