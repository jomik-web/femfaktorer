import type { Config } from "tailwindcss";

// Design-tokens -- Designsystem v2.0 (se DS2_00_Designsystem_v2.md).
// v1-fargene (ink/teal/mint/coral/warmgray) er faset helt ut -- all bruk i
// src/app og src/components er migrert til v2-tokenene under.
const config: Config = {
  darkMode: "media", // respekterer systeminnstilling; ingen manuell bryter i v1
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- v2: holografisk primærgradient ----
        holo: {
          mint: "#5FF0C0", // Frisk grønn -- start på gradient
          sky: "#5FC0F0", // Himmelblå -- midtpunkt. KUN til bakgrunn/dekorasjon -- for lys til tekst (2,04:1 mot hvit, se skyText).
          violet: "#C05FF0", // Fiolett -- slutt på gradient
          // Kvalitetsrevisjon 19.07.2026, kritisk WCAG 2.2 AA-funn (1.4.3):
          // holo-sky brukt som TEKSTFARGE ga kun 2,04:1 kontrast mot hvit
          // bakgrunn (krav 4,5:1). skyText er samme fargefamilie, mørket til
          // L=36% (fra 66%), som gir 5,03:1 -- bruk denne for all tekst/
          // lenker/kant-på-tekst der holo-sky tidligere ble brukt direkte.
          skyText: "#1076A8",
        },
        // ---- v2: gull-aksent (status, merker, sjeldne highlights) ----
        gold: {
          light: "#FFE07A",
          DEFAULT: "#E0A93A",
          dark: "#B9862A",
        },
        // ---- v2: tekst/kontrast ----
        indigo: "#14142B", // primær tekstfarge (erstatter ink)
        plum: "#3A2E5C", // sekundær mørk, f.eks. hover-tilstander
        // ---- v2: nøytrale bakgrunner ----
        lavender: {
          50: "#F6F4FC", // side-bakgrunn
          100: "#E9E5F5", // kort/paneler
          400: "#B9B4C9", // deaktivert / grense
        },
        // Faktorfarger -- justert i to omganger: (1) mer mettet for å matche
        // v2-paletten, (2) hue skjøvet vekk fra nærmeste primærfarge der
        // avstanden var under ~10° (Himmel/Planmessighet, Gull mørk/
        // Ekstroversjon) -- se DS2_10_faktorfarger_kollisjon.png for utregning.
        factor: {
          openness: "#8B7CE8",
          conscientiousness: "#4173E6", // var #4DA8E8 -- kolliderte med holo.sky (5°)
          extraversion: "#FF7033", // var #FFAB3D -- kolliderte med gold.DEFAULT (6°)
          agreeableness: "#51D663", // var #5FD98A -- lå tett på holo.mint (19°)
          stability: "#FF6B8A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // v2: ekspressiv overskriftsfont -- se layout.tsx
        display: ["var(--font-bricolage)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        // Grunnrytme 4px -- v2 bruker samme rytme som v1, uendret
        4.5: "18px",
      },
      borderRadius: {
        sm: "6px", // små felt
        DEFAULT: "10px", // knapper/felt
        lg: "16px", // kort
        xl: "24px", // store flater
        "2xl": "32px", // v2: store, myke flater (kort i ny stil, Spir-bobler)
      },
      backgroundImage: {
        // v2: gjenbrukbar holografisk gradient -- brukes sparsomt (CTA, Spir, highlights)
        "holo-gradient": "linear-gradient(135deg, #5FF0C0 0%, #5FC0F0 50%, #C05FF0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
