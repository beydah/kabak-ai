import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';
import { F_Get_Preference, F_Set_Preference } from './utils/storage_utils';
import { F_Set_Language } from './utils/i18n_utils';

// Initialization Logic
const F_Initialize_App = () => {
    // 1. Language
    const saved_lang = F_Get_Preference('lang');
    if (saved_lang) {
        F_Set_Language(saved_lang);
    } // else defaults to 'tr' or browser default in i18n_utils

    // 2. Theme
    const saved_theme = F_Get_Preference('theme');
    if (saved_theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (saved_theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // System default (optional, usually falls back to system)
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    }
};

F_Initialize_App();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
