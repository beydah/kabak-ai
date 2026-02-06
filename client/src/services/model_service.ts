export const AI_CONFIG = {
    VISUAL: {
        PRIMARY: 'imagen-4.0-fast-generate-001',
        FALLBACK: 'imagen-4.0-generate-001'
    },
    TEXT: {
        PRIMARY: 'gemini-3-flash-preview',
        FALLBACK: 'gemini-2.0-flash'
    },
    VIDEO: {
        PRIMARY: 'veo-3.0-fast-generate-001',
        FALLBACK: 'veo-3.0-generate-001'
    }
};

export const LIMITS = {
    RPM: {
        'gemini-flash': 15,
        'imagen': 5,
        'veo': 2
    },
    RPD: {
        'gemini-flash': 1500,
        'imagen': 100, // Conservative daily limit
        'veo': 10
    },
    THROTTLE_MS: 15000 // 15s delay between image requests for safety
};

/**
 * Executes an AI operation with automatic retry on 429/5xx errors using a fallback model.
 * NOW INCLUDES: Handling for API_400 (Input Not Supported) -> Switch to Fallback.
 * 
 * @param primaryFn Function executing the primary model call
 * @param fallbackFn Function executing the fallback model call
 * @param modelType 'TEXT' | 'VISUAL' | 'VIDEO' for logging
 */
export async function F_Execute_With_Retry<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    modelType: keyof typeof AI_CONFIG
): Promise<T> {
    try {
        return await primaryFn();
    } catch (error: any) {
        const msg = error.message || '';

        // Critical Safety Stop - Do NOT Fallback
        if (msg.includes('SAFETY_BLOCK') || msg.includes('SAFETY_FILTER')) {
            console.warn(`[AI Service] ${modelType} Primary Triggered Safety Filter. Aborting.`);
            throw error; // Re-throw to stop workflow
        }

        // Retry Conditions: 
        // 429 (Too Many Requests)
        // 5xx (Server Error)
        // 404 (Model temporarily missing)
        // 400 (Input Not Supported - specific to Imagen 4 migration issues, try fallback)
        if (
            msg.includes('429') ||
            msg.includes('500') ||
            msg.includes('503') ||
            msg.includes('404') ||
            msg.includes('400') ||
            msg.includes('Quota') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('Image in input is not supported') // Specific Imagen 4 error
        ) {
            console.warn(`[AI Service] ${modelType} Primary Failed (${msg}). Switching to Fallback...`);
            try {
                return await fallbackFn();
            } catch (fallbackError: any) {
                console.error(`[AI Service] ${modelType} Fallback also failed.`);
                throw new Error(`ALL_MODELS_FAILED: ${fallbackError.message}`);
            }
        }

        // Other errors (Client side, etc) -> Re-throw
        throw error;
    }
}
