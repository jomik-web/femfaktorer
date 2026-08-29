/**
 * Betaversjonsnummer vist ved siden av "Dine Fasetter"-logoen i toppmenyen
 * (v2.34, produkteiers ønske 19.07.2026) -- IKKE det samme som `version` i
 * package.json (som følger npm sin semver-konvensjon og ikke er ment for
 * visning). Dette tallet følger i stedet changelog-nummereringen i
 * OPPGAVER-FOR-PRODUKTEIER.md, slik at produkteier kjenner igjen tallet fra
 * loggen sin. Husk å oppdatere denne konstanten sammen med hver ny
 * changelog-oppføring.
 */
/**
 * HUSK: DENNE KONSTANTEN STEMPLES PÅ INNSAMLEDE DATA.
 *
 * Den følger med hvert anonyme svarsett (lib/research/types.ts) og hver
 * betatilbakemelding (lib/feedback/blobs.ts). Står den feil, merkes data med
 * en versjon som ikke beskriver koden de ble samlet inn under -- og da er de
 * ubrukelige til å avgjøre om en endring virket.
 *
 * v2.50 (kvalitetsrevisjon 01.08.2026, funn 5.1): sto på "2.49" mens 23
 * filer allerede omtalte endringene som v2.50, inkludert et snudd
 * samtykkevalg som endrer HVEM som bidrar med data. Nøyaktig den typen
 * glidning questionSetVersion.ts er bygget for å hindre ett nivå ned.
 */
export const APP_VERSION = "2.59";
