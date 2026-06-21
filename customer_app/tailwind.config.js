/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",       // keep for any remaining refs
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0A1F35',
        'brand-orange': '#DA6F2B',
        primary: '#DA6F2B',
        secondary: '#0A1F35',
      },
    },
  },
  plugins: [],
};
