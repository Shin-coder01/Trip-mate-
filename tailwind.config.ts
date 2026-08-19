import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kraft: "#ECE4D3",
        paper: "#F7F0DF",
        ink: "#23272B",
        stamp: "#B23A2E",
        brass: "#9C7A3C",
        "ticket-line": "#C8B891",
        "muted-ink": "#6F6A5F",
        "bg-primary": "#ECE4D3",
        "bg-dark": "#23272B",
        "accent-green": "#B23A2E",
        "text-primary": "#23272B",
        "text-muted": "#6F6A5F",
        "border-subtle": "#C8B891",
      },
      backgroundColor: {
        "surface-glass": "rgba(247,240,223,0.9)",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Arial", "Helvetica", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      borderRadius: {
        "4xl": "0.5rem",
      },
      boxShadow: {
        floating: "none",
      },
      transitionTimingFunction: {
        "power3-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
        "power4-inOut": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
