import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Primary palette: amber-orange kekuningan ───────────────────
        primary: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          DEFAULT: "#f59e0b",   // amber-500
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // ─── Sidebar: warm dark (coklat tua, bukan biru dingin) ─────────
        sidebar: {
          bg:          "#1c1917",   // stone-900
          hover:       "#292524",   // stone-800
          active:      "#44403c",   // stone-700
          text:        "#a8a29e",   // stone-400
          "text-active": "#fef3c7", // amber-100
          border:      "#292524",
        },
        // ─── Status badges ───────────────────────────────────────────────
        status: {
          hadir:  "#16a34a",
          lembur: "#2563eb",
          cor:    "#d97706",
          alpha:  "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card":    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "amber":   "0 0 0 3px rgba(245,158,11,0.25)",
      },
      borderRadius: {
        "xl2": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
