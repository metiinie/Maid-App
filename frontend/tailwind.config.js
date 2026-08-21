/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./context/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#1E3A8A',        // Deep Royal Blue
                    'blue-light': '#2563EB',  // Bright Royal Blue
                    'blue-dark': '#0F172A',   // Navy Blue
                    green: '#059669',       // Emerald Green
                    'green-light': '#10B981', // Bright Emerald Green
                    white: '#FFFFFF',       // Pure White
                    bg: '#F8FAFC',          // Light Slate Background
                    card: '#FFFFFF',        // Card White
                },
            },
        },
    },
    plugins: [],
};
