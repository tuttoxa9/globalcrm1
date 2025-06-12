import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#E5E7EB",
        },
        secondary: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#E5E7EB",
        },
        muted: {
          DEFAULT: "#6B7280",
          foreground: "#E5E7EB",
        },
        accent: {
          DEFAULT: "#3B82F6",
          foreground: "#E5E7EB",
        },
        popover: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
        card: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
