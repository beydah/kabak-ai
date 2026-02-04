import { GoogleGenerativeAI } from '@google/generative-ai';
import { I_Product_Data, F_Track_Usage } from '../utils/storage_utils';

// Access API Key
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

// Initialize SDK
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Helper to get the model with fallback logic
const F_Get_Gemini_Model = (model_name: string) => {
    return genAI.getGenerativeModel({ model: model_name });
};

// Priority: Gemini 2.0 Flash -> Exp -> 3 Flash -> 3 Pro
const MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash", // Fallback to stable 1.5 if 2.0/3.0 unavailable
    "gemini-1.5-pro"
];

// Helper to convert Base64 string to Part object
function F_File_To_Generative_Part(path: string, mimeType: string) {
    return {
        inlineData: {
            data: path.split(',')[1], // Remove header "data:image/png;base64,"
            mimeType
        },
    };
}

export const F_Generate_SEO_Content = async (
    p_product: I_Product_Data,
    p_lang: 'tr' | 'en'
): Promise<{ title: string; description: string; tags: string[] }> => {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // Prepare Prompt parts
    const text_prompt = `
        You are an SEO expert for an e-commerce fashion brand.
        
        TASK:
        Analyze the provided images (Front and Back) and the following product attributes to generate a high-ranking SEO Product Title and Description.

        PRODUCT ATTRIBUTES:
        - Gender: ${p_product.gender}
        - Age Group: ${p_product.age}
        - Body Type: ${p_product.body_type}
        - Fit: ${p_product.fit}
        - User Specific Details (MUST INCORPORATE): ${p_product.description}
        - Background Context: ${p_product.background} (Ignore background for product description, focus on item)
        - Accessory: ${p_product.accessory}

        OUTPUT RULES (SEO DESCRIPTION):
        1. Write a SINGLE, cohesive paragraph.
        2. Incorporate specific visual details from the images (colors, patterns, distinct features).
        3. STRICTLY include ALL "User Specific Details" provided above.
        5. Use exactly 5 emojis, naturally dispersed throughout the text.
        6. Language: ${p_lang === 'tr' ? 'Turkish (Türkçe)' : 'English'}.

        OUTPUT RULES (TITLE):
        1. Create a concise, high-ranking SEO title.
        2. Length: Approximately 5 words (+/- 1 word).

        OUTPUT RULES (TAGS):
        1. Generate exactly 5 SEO-compliant tags/keywords.
        2. Focus on product type, fabric, style, and fit.
        3. Append these at the end of the description as hashtags (e.g. #Summer #Cotton).

        FORMAT:
        Return ONLY valid JSON:
        {
            "title": "...",
            "description": "...",
            "tags": []
        }
    `;

    const parts: any[] = [text_prompt];

    // Add Images if they exist
    if (p_product.front_image) {
        parts.push(F_File_To_Generative_Part(p_product.front_image, "image/png"));
    }
    if (p_product.back_image) {
        parts.push(F_File_To_Generative_Part(p_product.back_image, "image/png"));
    }

    // Try models in sequence
    let last_error;
    for (const model_name of MODELS_TO_TRY) {
        try {
            console.log(`[Kabak AI] Attempting generation with model: ${model_name}`);
            const model = F_Get_Gemini_Model(model_name);

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            // Cost Calculation Helper
            const COST_TABLE: Record<string, { input: number; output: number }> = {
                'gemini-2.0-flash': { input: 0.10, output: 0.40 },
                'gemini-2.0-flash-exp': { input: 0.10, output: 0.40 },
                'gemini-3-flash': { input: 0.15, output: 0.60 },
                'gemini-3-pro': { input: 1.25, output: 5.00 },
                'gemini-1.5-pro': { input: 3.50, output: 10.50 },
            };

            const F_Calculate_Estimated_Cost = (model: string, input_tokens: number, output_tokens: number): number => {
                const rates = COST_TABLE[model] || COST_TABLE['gemini-2.0-flash'];
                const input_cost = (input_tokens / 1000000) * rates.input;
                const output_cost = (output_tokens / 1000000) * rates.output;
                return input_cost + output_cost;
            };

            // Clean markdown
            const cleaned_text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            console.log(`[Kabak AI] Model Active: ${model_name}`);

            // Estimate Cost
            // Rough calc: text length / 4 chars per token. Image ~ 1000 tokens.
            const input_tokens = (text_prompt.length / 4) + (parts.length > 1 ? 1000 * (parts.length - 1) : 0);
            const output_tokens = cleaned_text.length / 4;
            const cost = F_Calculate_Estimated_Cost(model_name, input_tokens, output_tokens);

            // Track Usage
            await F_Track_Usage(model_name, cost);

            return JSON.parse(cleaned_text);

        } catch (error: any) {
            console.warn(`[Gemini Service] Failed with ${model_name}:`, error.message);
            last_error = error;
            continue;
        }
    }

    console.error("All Gemini models failed.");
    throw last_error;
};
