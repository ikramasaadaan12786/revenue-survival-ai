import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: "#0F172A",
        surfaceElevated: "#1E293B",
        primary: {
          DEFAULT: "#00F0FF",
          hover: "#38F9D7",
          glow: "rgba(0, 240, 255, 0.25)",
        },
        accent: {
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        },
        survival: {
          active: "#10B981",
          critical: "#EF4444",
          pivoting: "#F59E0B",
          completed: "#00F0FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(0, 240, 255, 0.3)",
        dangerGlow: "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        cardGlow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }
    },
  },
  plugins: [],
};
export default config;
