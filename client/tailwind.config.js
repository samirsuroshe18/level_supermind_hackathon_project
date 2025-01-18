/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          800: "#1e1e2c",
        },
        dark: {
          900: "#111827",
          800: "#1E293B",
          700: "#374151",
        },
        blue: {
          500: "#3B82F6",
          400: "#60A5FA",
        },
        purple: {
          900: "#1a132b",
        },
      },
    },
  },
  plugins: [],
};
