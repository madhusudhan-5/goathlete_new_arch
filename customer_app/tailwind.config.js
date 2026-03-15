/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0A1F35',
        'brand-orange': '#DA6F2B',
        primary: "#DA6F2B", // Reusing Orange as Primary for native components that might default to 'primary'
        secondary: "#0A1F35",
      }
    },
  },
  plugins: [],
}
