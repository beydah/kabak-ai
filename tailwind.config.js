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
                'bg-dark': '#25343F',
                'text-dark': '#EAEFEF',
                // Accent Colors
                'primary': '#FF7F11',
                'secondary': '#94A3B8',
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
