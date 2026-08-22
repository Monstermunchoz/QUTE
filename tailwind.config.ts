import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        qute: {
          pink: "#FF2D87",
          violet: "#7B2FFF",
          orange: "#FF6B2B",
          dark: "var(--bg)",
          card: "var(--surface)",
          border: "var(--border)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        qute: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
