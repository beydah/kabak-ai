// i18n Utility Functions
// Strict naming applied: F_*, p_*

import lang_data from '../locales/lang.json';
import { F_Get_Cookie, F_Set_Cookie } from './cookie_utils';
import { F_Get_Storage, F_Set_Storage } from './storage_utils';

type Language_Type = 'tr' | 'en';
const LANGUAGE_KEY = 'kabak_language';
const DEFAULT_LANGUAGE: Language_Type = 'en';

/**
 * Get current language based on priority:
 * 1. Cookie
 * 2. LocalStorage
 * 3. Browser language
 * 4. Fallback: 'en'
 */
export const F_Get_Language = (): Language_Type => {
    // Priority 1: Cookie
    const cookie_lang = F_Get_Cookie(LANGUAGE_KEY);
    if (cookie_lang === 'tr' || cookie_lang === 'en') {
        return cookie_lang;
    }

    // Priority 2: LocalStorage
    const storage_lang = F_Get_Storage<string>(LANGUAGE_KEY);
    if (storage_lang === 'tr' || storage_lang === 'en') {
        return storage_lang;
    }

    // Priority 3: Browser language
    const browser_lang = navigator.language.substring(0, 2).toLowerCase();
    if (browser_lang === 'tr') {
        return 'tr';
    }

    // Priority 4: Fallback
    return DEFAULT_LANGUAGE;
};

/**
 * Set language in both Cookie and LocalStorage
 */
export const F_Set_Language = (p_language: Language_Type): void => {
    F_Set_Cookie(LANGUAGE_KEY, p_language, 365);
    F_Set_Storage(LANGUAGE_KEY, p_language);
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
