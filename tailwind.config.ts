import type { Config } from "tailwindcss";
import appTheme from "./styles/theme.json";

const { brand, status, neutral, pastel, utility } = appTheme;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand,
        status,
        neutral,
        pastel,
        utility,
      },
    },
  },
  plugins: [],
};
export default config;
