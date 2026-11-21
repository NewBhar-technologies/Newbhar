import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--bg)",
        subtle: "var(--bg-subtle)",
        surface: "var(--surface)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        foreground: "var(--fg)",
        muted: "var(--fg-muted)",
        faint: "var(--fg-faint)",
        accent: {
          DEFAULT: "var(--accent)",
          ink: "var(--accent-ink)",
          fg: "var(--accent-fg)",
          soft: "var(--accent-soft)",
        },
        brandy: {
          lime: "#98f90d",
          dark: "#08080a",
          card: "#12131b",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
      boxShadow: {
        glow: "0 0 25px rgba(152, 249, 13, 0.35)",
        "glow-sm": "0 0 15px rgba(152, 249, 13, 0.25)",
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      keyframes: {
        wheel: { "50%": { transform: "translateY(6px)" } },
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        wheel: "wheel 1.6s ease-in-out infinite",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
