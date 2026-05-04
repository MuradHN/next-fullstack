import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./state/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        app: {
          background: "#f6f7f9",
          foreground: "#1d2430",
          muted: "#647084",
          border: "#d9dee7",
          accent: "#0f766e"
        }
      }
    }
  },
  plugins: []
};

export default config;
