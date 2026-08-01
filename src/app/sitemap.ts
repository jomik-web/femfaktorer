import type { MetadataRoute } from "next";

/**
 * Nettstedskart (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 7.3).
 *
 * KUN SIDER SOM SKAL INDEKSERES. Sider som er merket noindex i sitt eget
 * layout (/admin, /resultat, /logg-inn, /spir, /verktoy/svardata,
 * /verktoy/lagre-resultat) hører IKKE hjemme her -- et nettstedskart som
 * lister sider man samtidig ber roboten la være å indeksere, sender to
 * motstridende signaler, og Search Console rapporterer det som en feil.
 *
 * `priority` er et svakt signal som Google i praksis stort sett ignorerer,
 * men det koster ingenting å være ærlig om hva som faktisk er viktigst:
 * forsiden og testen er inngangene, innholdssidene er det som kan rangere på
 * søk om femfaktormodellen.
 *
 * NB: nettstedskartet blir bare riktig når NEXT_PUBLIC_SITE_URL er satt i
 * Netlify. Uten den peker alle URL-ene på localhost. Det er samme variabel
 * som passkeys (rpID) og metadataBase bruker -- se lib/account/passkeys.ts.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/test", priority: 0.9, changeFrequency: "monthly" },
  { path: "/slik-fungerer", priority: 0.8, changeFrequency: "monthly" },
  { path: "/om-femfaktormodellen", priority: 0.8, changeFrequency: "monthly" },
  { path: "/metode-og-kilder", priority: 0.7, changeFrequency: "monthly" },
  { path: "/priser", priority: 0.6, changeFrequency: "monthly" },
  { path: "/verktoy", priority: 0.4, changeFrequency: "monthly" },
  { path: "/hjelp", priority: 0.5, changeFrequency: "monthly" },
  { path: "/personvern", priority: 0.4, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
