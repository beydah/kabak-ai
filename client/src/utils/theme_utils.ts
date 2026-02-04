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
    window.dispatchEvent(new Event('theme-change'));
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
 * Advanced Circular Reveal Transition
 */
export const F_Transition_Theme = (e: React.MouseEvent, p_on_complete?: () => void) => {
    const x = e.clientX;
    const y = e.clientY;

    const current_theme = F_Get_Theme();
    const next_theme = current_theme === 'light' ? 'dark' : 'light';

    // Create overlay element
    const circle = document.createElement('div');
    circle.style.position = 'fixed';
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.style.width = '0px';
    circle.style.height = '0px';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'translate(-50%, -50%)';

    // Correct Colors from Index.css + Text Overlay
    // Dark Target: #25343F
    // Light Target: #EAEFEF
    circle.style.backgroundColor = next_theme === 'dark' ? '#25343F' : '#EAEFEF';
    circle.style.zIndex = '9999';
    circle.style.pointerEvents = 'none';
    circle.style.display = 'flex';
    circle.style.alignItems = 'center';
    circle.style.justifyContent = 'center';
    circle.style.overflow = 'hidden'; // Clip the text
    circle.style.transition = 'width 1s ease-in-out, height 1s ease-in-out';

    // Branding Text
    const text = document.createElement('span');
    text.innerText = 'Kabak AI';
    text.style.fontFamily = 'Inter, sans-serif'; // Ensure font matches
    text.style.fontSize = '2rem';
    text.style.fontWeight = 'bold';
    text.style.color = next_theme === 'dark' ? '#EAEFEF' : '#25343F'; // Contrast color
    text.style.opacity = '0';
    text.style.transition = 'opacity 0.4s ease-in-out';
    text.style.whiteSpace = 'nowrap';

    circle.appendChild(text);
    document.body.appendChild(circle);

    // Force reflow
    circle.getBoundingClientRect();

    // Calculate required size to cover screen
    const max_dim = Math.max(window.innerWidth, window.innerHeight);
    const size = max_dim * 2.5;

    requestAnimationFrame(() => {
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        // Fade in text halfway through
        setTimeout(() => {
            text.style.opacity = '1';
        }, 300);
    });

    // Wait for animation to cover screen
    setTimeout(() => {
        F_Set_Theme(next_theme);
        if (p_on_complete) p_on_complete();

        // Fade out branding text first
        text.style.opacity = '0';

        setTimeout(() => {
            circle.style.opacity = '0';
            circle.style.transition = 'opacity 0.4s ease-out';

            setTimeout(() => {
                if (document.body.contains(circle)) {
                    document.body.removeChild(circle);
                }
            }, 400);
        }, 200); // Short delay to let users see the logo

    }, 1000); // Sync with transition duration
};

/**
 * Initialize theme on app load
 */
export const F_Init_Theme = (): void => {
    const theme = F_Get_Theme();
    F_Apply_Theme(theme);
};
