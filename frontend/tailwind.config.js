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
                'ethiopia-gold': '#D4AF37',
                'ethiopia-gold-light': '#E8C84A',
                'ethiopia-navy': '#0A192F',
                'ethiopia-navy-light': '#112240',
                'ethiopia-crimson': '#DC2626',
                'ethiopia-emerald': '#10B981',
            },
            fontFamily: {
                sans: ['Inter'],
                'ethiopic': ['NotoSansEthiopic'],
            },
        },
    },
    plugins: [],
};
