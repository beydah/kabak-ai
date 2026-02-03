// Theme Utility Functions
// Strict naming applied: F_*, p_*

import { F_Get_Cookie, F_Set_Cookie } from './cookie_utils';
import { F_Get_Storage, F_Set_Storage } from './storage_utils';

type Theme_Type = 'light' | 'dark';
const THEME_KEY = 'kabak_theme';
const DEFAULT_THEME: Theme_Type = 'light';

/**
 * Get current theme from storage or default
 */
export const F_Get_Theme = (): Theme_Type => {
    const cookie_theme = F_Get_Cookie(THEME_KEY);
    if (cookie_theme === 'light' || cookie_theme === 'dark') {
        return cookie_theme;
    }

    const storage_theme = F_Get_Storage<string>(THEME_KEY);
    if (storage_theme === 'light' || storage_theme === 'dark') {
        return storage_theme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return DEFAULT_THEME;
};

/**
 * Set theme in both Cookie and LocalStorage, and apply to document
 */
export const F_Set_Theme = (p_theme: Theme_Type): void => {
    F_Set_Cookie(THEME_KEY, p_theme, 365);
    F_Set_Storage(THEME_KEY, p_theme);
    F_Apply_Theme(p_theme);
};

/**
 * Apply theme class to document root
 */
export const F_Apply_Theme = (p_theme: Theme_Type): void => {
    const root = document.documentElement;
    if (p_theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

/**
 * Toggle between light and dark theme
 */
export const F_Toggle_Theme = (): Theme_Type => {
    const current = F_Get_Theme();
    const new_theme: Theme_Type = current === 'light' ? 'dark' : 'light';
    F_Set_Theme(new_theme);
    return new_theme;
};

/**
 * Initialize theme on app load
 */
export const F_Init_Theme = (): void => {
    const theme = F_Get_Theme();
    F_Apply_Theme(theme);
};
