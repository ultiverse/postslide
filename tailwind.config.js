/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Professional blue scale (primary brand)
        brand: {
          50:  "#f5f8ff",
          100: "#e9f0ff",
          200: "#d3e0ff",
          300: "#b9c8ff",
          400: "#8aa8ff",
          500: "#4a67ff",   // primary
          600: "#3a52d6",
          700: "#2e40aa",
          800: "#253689",
          900: "#1b2965",
        },
        // Neutral grays for backgrounds & text
        neutral: {
          50:  "#fafafa",
          100: "#f5f5f5",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // Cyan accent for highlights, active states, links
        accent: {
          400: "#06b6d4",
          500: "#0891b2",
          600: "#0e7490",
        },
        error:   "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: {
        soft: "0 6px 24px rgba(2, 6, 23, 0.06)",
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", md: "1.25rem", lg: "2rem" },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        slidepost: {
          primary: "#4a67ff",
          "primary-content": "#ffffff",
          secondary: "#3a52d6",
          accent: "#0891b2",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e5e7eb",
          info: "#06b6d4",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "light",
    ],
  },
};
