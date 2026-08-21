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
          dark: "#0A0A0A",
          card: "#111111",
          border: "#1E1E1E",
          muted: "#888888",
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
