/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
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
                'secondary': '#BFC9D1',
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
