/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7ff",
          100: "#e8edff",
          200: "#cfd9ff",
          500: "#4a67ff",   // primary
          600: "#3d56d6",
          900: "#1b2460",
        },
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        slidepost: {
          "primary": "#4a67ff",
          "primary-content": "#ffffff",
          "secondary": "#0ea5e9",
          "accent": "#22c55e",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f7f7fb",
          "base-300": "#eef0f6",
          "info": "#38bdf8",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light",
    ],
  },
};
