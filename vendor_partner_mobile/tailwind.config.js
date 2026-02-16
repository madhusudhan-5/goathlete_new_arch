/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    foreground: '#FFFFFF',
                },
            },
        },
    },
    plugins: [],
}
