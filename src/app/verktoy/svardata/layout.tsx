import type { Metadata } from "next";

/**
 * Layout for /verktoy/svardata (v2.50, funn 7.1 og 7.3). Noindex: et
 * betaverktøy for import/eksport av svarsett hører ikke hjemme i et
 * søkeresultat, og forsvinner uansett når betaperioden er over.
 */
export const metadata: Metadata = {
  title: "Svardata",
  robots: { index: false, follow: true },
};

export default function SvardataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
