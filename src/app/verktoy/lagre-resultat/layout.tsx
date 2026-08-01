import type { Metadata } from "next";

/**
 * Layout for /verktoy/lagre-resultat (v2.50, funn 7.1 og 7.3). Noindex:
 * siden forutsetter et resultat i nettleseren og er tom for alle andre.
 */
export const metadata: Metadata = {
  title: "Lagre resultatet",
  robots: { index: false, follow: true },
};

export default function LagreResultatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
