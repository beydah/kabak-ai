/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./client/index.html",
        "./client/src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Light Mode
                'bg-light': '#EAEFEF',
                'text-light': '#25343F',
                // Dark Mode
                'bg-dark': '#0A0A0A', // True Black
                'text-dark': '#EAEFEF',
                // Accent Colors
                'primary': '#FF7F11',
                'secondary': '#64748B',
            },
            backgroundColor: {
                'app': 'var(--bg-app)',
            },
            textColor: {
                'app': 'var(--text-app)',
            },
        },
    },
    plugins: [],
}
