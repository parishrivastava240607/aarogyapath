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
        background: "#FFFFFF",
        primary: {
          DEFAULT: "#E85B50",
          textSmall: "#C9453B",
        },
        text: {
          DEFAULT: "#25252B",
          heading: "#24242A",
        },
        muted: {
          DEFAULT: "#85858D",
          secondary: "#777980",
        },
        border: "#E5E6E9",
        surfaceGrey: "#F3F4F6",
        pastel: {
          pink: "#FCEAF2",
          purple: "#F5E8FA",
          blue: "#EAF4FC",
          mint: "#E7F5EC",
          peach: "#FFF0E8",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        sos: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-devanagari)", "sans-serif"],
        devanagari: ["var(--font-noto-sans-devanagari)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
        search: "30px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(0, 0, 0, 0.04)",
        sos: "0 4px 14px rgba(220, 38, 38, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
