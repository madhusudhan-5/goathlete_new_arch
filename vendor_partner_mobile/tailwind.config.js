/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#0A1F35',
                    orange: '#DA6F2B',
                },
                primary: {
                    DEFAULT: '#0A1F35',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#DA6F2B',
                    foreground: '#FFFFFF',
                },
            },
        },
    },
    plugins: [],
}
