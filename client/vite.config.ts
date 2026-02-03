import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Using snake_case for the config file name: vite_config.ts

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
    },
    envDir: '..',
});
