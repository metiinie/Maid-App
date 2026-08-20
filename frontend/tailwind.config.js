/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ethiopia: {
                    gold: '#D4AF37',
                    'gold-light': '#E5C158',
                    'gold-dark': '#B38F24',
                    navy: '#0A192F',
                    'navy-light': '#172A45',
                    'navy-dark': '#060E1A',
                    emerald: '#10B981',
                    crimson: '#E63946',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans Ethiopic', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
