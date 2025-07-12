import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "media",             // já que usa prefers-color-scheme
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fade-in .3s ease-out forwards",
        "scale-up": "scale-up .3s ease-out forwards",
        "fade-in-up": "fade-in-up .8s ease-out .2s forwards",
        "infinite-scroll": "infinite-scroll linear infinite",
      },
      keyframes: {
        // opcional se já deixou no CSS, mas assim o purge reconhece:
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        // ...
      },
    },
  },
  plugins: [],
}
export default config;
