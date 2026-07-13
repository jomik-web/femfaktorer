import type { Config } from "tailwindcss";

// Design-tokens fra Dokument 02 (Designsystem v1.0) og Grunnlagsdokumentet §6.
// Låste verdier -- ikke endre uten å oppdatere kildedokumentet.
const config: Config = {
  darkMode: "media", // respekterer systeminnstilling; ingen manuell bryter i v1
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hovedpalett (§6.1)
        ink: "#0D3340", // Mørk blå -- overskrifter, logo, viktig tekst
        teal: "#2BA3A2", // Primærknapper, aktive elementer, lenker, fremdrift
        mint: "#E6F4F2", // Rolige bakgrunner, valgte svar
        coral: "#FF7A66", // Energi, avgrensede aksenter
        warmgray: "#F1F2F2", // Sekundære bakgrunner, deaktivert tilstand
        // Faktorfarger (§6.2)
        factor: {
          openness: "#7B6ECD", // Åpenhet for erfaring
          conscientiousness: "#4DA0D6", // Planmessighet
          extraversion: "#F3A63B", // Ekstroversjon
          agreeableness: "#6CC285", // Medmenneskelighet
          stability: "#F26D7D", // Emosjonell stabilitet
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        // Grunnrytme 4px (§6.3) -- suppleres av Tailwinds standardskala der de matcher
        4.5: "18px",
      },
      borderRadius: {
        sm: "6px", // små felt
        DEFAULT: "10px", // knapper/felt
        lg: "16px", // kort
        xl: "24px", // store flater
      },
    },
  },
  plugins: [],
};

export default config;
