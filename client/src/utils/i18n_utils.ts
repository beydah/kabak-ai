// i18n Utility Functions
// Strict naming applied: F_*, p_*

import lang_data from '../locales/lang.json';
import { F_Get_Preference, F_Set_Preference } from './storage_utils';

type Language_Type = 'tr' | 'en';
const DEFAULT_LANGUAGE: Language_Type = 'en';

/**
 * Get current language based on priority:
 * 1. Preference (Cookie/LS)
 * 2. Browser language
 * 3. Fallback: 'en'
 */
export const F_Get_Language = (): Language_Type => {
    // 1. Preference
    const saved_lang = F_Get_Preference('lang');
    if (saved_lang === 'tr' || saved_lang === 'en') {
        return saved_lang;
    }

    // 2. Browser language
    const browser_lang = navigator.language.substring(0, 2).toLowerCase();
    if (browser_lang === 'tr') {
        return 'tr';
    }

    // 3. Fallback
    return DEFAULT_LANGUAGE;
};

/**
 * Set language preference
 */
export const F_Set_Language = (p_language: Language_Type): void => {
    F_Set_Preference('lang', p_language);
};

/**
 * Get translated text by key path (e.g., 'login.title')
 */
export const F_Get_Text = (p_key_path: string, p_language?: Language_Type): string => {
    const current_lang = p_language || F_Get_Language();
    const keys = p_key_path.split('.');

    let result: any = (lang_data as any)[current_lang];

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            // Fallback to English if key not found
            result = (lang_data as any)['en'];
            for (const fallback_key of keys) {
                if (result && typeof result === 'object' && fallback_key in result) {
                    result = result[fallback_key];
                } else {
                    return p_key_path; // Return key path if not found
                }
            }
            break;
        }
    }

    return typeof result === 'string' ? result : p_key_path;
};
