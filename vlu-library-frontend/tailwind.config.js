/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // VLU Brand Colors
        "vlu-red": {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c", // Primary VLU Red
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      boxShadow: {
        card: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "card-hover": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
  // Tương thích với MUI
  important: "#root",
  corePlugins: {
    preflight: false, // Tắt preflight để không conflict với MUI reset
  },
};
