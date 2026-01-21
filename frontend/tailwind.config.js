/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9eeff",
          200: "#b6ddff",
          300: "#7fc4ff",
          400: "#3ea3ff",
          500: "#1484ff",
          600: "#0063e6",
          700: "#004fba",
          800: "#044592",
          900: "#0a3b78",
        },
      },
    },
  },
  plugins: [],
};

