import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

/**
 * ESLint-oppsett (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 5.1).
 *
 * HVORFOR DENNE FILEN MÅTTE LAGES
 * Prosjektet hadde ESLint 9 installert, men ingen konfigurasjonsfil i det
 * hele tatt -- verken `eslint.config.*` (flat config) eller en `.eslintrc.*`.
 * Fra og med ESLint 9 er flat config standarden, og uten en slik fil avbryter
 * ESLint med «couldn't find an eslint.config.(js|mjs|cjs) file». Samtidig sto
 * `eslint: { ignoreDuringBuilds: false }` i next.config.ts, altså var bygget
 * innstilt på å STOPPE på lintefeil -- fra et oppsett som ikke kunne kjøre.
 * I praksis betydde det at statisk analyse ikke var i drift, og det var
 * nettopp en slik feil (manglende dark:-variant, kritisk funn 1.1) som slapp
 * gjennom i samme runde.
 *
 * HVORFOR FlatCompat
 * `eslint-config-next` leveres fortsatt i det gamle eslintrc-formatet.
 * FlatCompat er ESLints offisielle bro for å bruke slike konfigurasjoner fra
 * en flat config, og er den samme løsningen `create-next-app` selv genererer.
 * Når Next.js en gang leverer en ekte flat config, kan dette forenkles til en
 * direkte import -- men ikke før, ellers mister vi Next-reglene stille.
 */
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  {
    /**
     * Bygg-output og avhengigheter. Må stå FØRST: i flat config gjelder
     * `ignores` i et objekt uten andre nøkler globalt, og ESLint leser
     * listen ovenfra og ned.
     */
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "next-env.d.ts",
      // Arkiverte dokumenter og gamle originaler -- ikke kode i drift.
      "00arkiv/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      /**
       * Ubrukte variabler er en ekte feilkilde, men mønsteret
       * `catch { /* med vilje tom *\/ }` og bevisst ubrukte argumenter er
       * gjennomgående og dokumentert i denne kodebasen. Understrek-prefiks
       * er den vanlige måten å si «ja, jeg mente det» på.
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      /**
       * `<img>` er et bevisst valg flere steder (delekortene mates videre til
       * canvas-generering, der next/image ikke gir mening). De stedene har
       * allerede en eslint-disable-next-line med begrunnelse. Regelen står
       * derfor som advarsel, ikke feil -- den skal minne, ikke blokkere.
       */
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;
