// Theme Utility Functions
// Strict naming applied: F_*, p_*

import { F_Get_Preference, F_Set_Preference } from './storage_utils';

type Theme_Type = 'light' | 'dark';
const DEFAULT_THEME: Theme_Type = 'light';

/**
 * Get current theme from storage (Cookie/LS) or system preference
 */
export const F_Get_Theme = (): Theme_Type => {
    // 1. Check Preference (Cookie/LS)
    const saved_theme = F_Get_Preference('theme');
    if (saved_theme === 'light' || saved_theme === 'dark') {
        return saved_theme;
    }

    // 2. Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    // 3. Fallback
    return DEFAULT_THEME;
};

/**
 * Set theme in storage and apply to document
 */
export const F_Set_Theme = (p_theme: Theme_Type): void => {
    F_Set_Preference('theme', p_theme);
    F_Apply_Theme(p_theme);
};

/**
 * Apply theme class to document root
 */
export const F_Apply_Theme = (p_theme: Theme_Type): void => {
    const root = document.documentElement;
    if (p_theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light'); // Ensure cleanup
    } else {
        root.classList.remove('dark');
        root.classList.add('light');
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
