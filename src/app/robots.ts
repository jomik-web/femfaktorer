import type { MetadataRoute } from "next";

/**
 * robots.txt (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 7.3).
 *
 * TO LAG, MED VILJE. Sidene under er ALLEREDE merket noindex i sine egne
 * layouts, og det er den mekanismen som faktisk holder dem ute av
 * søkeresultatet. Denne filen er et supplement, ikke en erstatning:
 *
 *  - `disallow` her sier «ikke bruk tid på å hente disse», altså sparte
 *    crawl-ressurser på sider som uansett ikke skal rangere.
 *  - `noindex` i layoutene sier «ikke vis disse», som er det som gjelder.
 *
 * Rekkefølgen betyr noe: en side som BÅDE er disallow her og noindex i
 * layoutet, kan i teorien bli hengende i indeksen fordi roboten aldri får
 * hentet siden og dermed aldri ser noindex-taggen. Derfor er /resultat og
 * /spir bevisst IKKE disallow her -- de skal kunne hentes, slik at noindex
 * leses. Kun /admin og /api, som aldri skal hentes i det hele tatt, er
 * blokkert.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
