import designConfig from "@curiousleaf/design/tailwind.config"
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  presets: [designConfig],

  content: [
    "./src/**/*.{ts,tsx}",

    // Design components inside @curiousleaf scope
    "node_modules/@curiousleaf/*/src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          lighter: "rgb(var(--color-primary-lighter) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          darker: "rgb(var(--color-primary-darker) / <alpha-value>)",
        },
      },

      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config
