import designConfig from "@curiousleaf/design/tailwind.config"
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  presets: [designConfig],

  content: [
    "./src/**/*.{ts,tsx}",

    // Design components inside @curiousleaf scope
    "../../node_modules/@curiousleaf/*/src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          lighter: `var(--color-primary-lighter, ${designConfig.theme.colors.blue.lighter})`,
          light: `var(--color-primary-light, ${designConfig.theme.colors.blue.light})`,
          DEFAULT: `var(--color-primary, ${designConfig.theme.colors.blue.DEFAULT})`,
          dark: `var(--color-primary-dark, ${designConfig.theme.colors.blue.dark})`,
          darker: `var(--color-primary-darker, ${designConfig.theme.colors.blue.darker})`,
        },
      },

      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config
