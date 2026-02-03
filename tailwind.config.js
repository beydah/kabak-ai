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
                'bg-dark': '#0F172A', // Darker slate-900
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
