/**
 * Monark v2 — Tailwind config (référence).
 *
 * NOTE: ce projet utilise Tailwind v4, dont la configuration est CSS-first
 * dans `src/styles.css` via la directive `@theme`. Les tokens ci-dessous
 * sont la source de vérité documentaire et seront repris à l'identique
 * en CSS. Tailwind v4 n'exige plus ce fichier mais on le garde pour
 * lisibilité d'équipe.
 */
import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0A0A0B",
        },
        accent: {
          primary: "#3B82F6",
        },
        trading: {
          foncer: "#10B981",
          passer: "#EF4444",
          negocier: "#F59E0B",
          tenter: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
} satisfies Config;

export default config;