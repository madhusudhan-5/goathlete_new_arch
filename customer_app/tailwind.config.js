/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A", // Deep Blue
        secondary: "#F59E0B", // Amber
        accent: "#10B981", // Emerald
      }
    },
  },
  plugins: [],
}
