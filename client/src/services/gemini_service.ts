import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductInput, Accessory, BgOption, ApiLog, I_Product_Data } from '../types/interfaces';
import { ModelService, AIModel } from './model_service';
import { F_Build_Imagen_Prompt, F_Get_Negative_Prompt, F_Build_Structured_Prompt } from '../utils/prompt_utils';
import { F_Optimize_Base64_For_Imagen } from '../utils/image_utils';

const LOGS_STORAGE_KEY = 'kabak_ai_logs';

// Singleton Instance Holder
let instance: GeminiService | null = null;

export class GeminiService {
    private ai: GoogleGenerativeAI;
    private apiKey: string;
    private modelService: ModelService;

    constructor() {
        this.apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
        if (!this.apiKey) console.error("FATAL: VITE_GEMINI_API_KEY is missing!");

        this.ai = new GoogleGenerativeAI(this.apiKey);
        this.modelService = ModelService.getInstance();

        console.log("[GeminiService] Initialized (Strict Gemini 2.0 Flash Mode)");
    }

    public static getInstance(): GeminiService {
        if (!instance) {
            instance = new GeminiService();
        }
        return instance;
    }

    // --- GÖREV 1 & 2: GÖRSEL ÜRETİM (Gemini 3 Pro Image Preview) ---
    async generateProductOnModel(input: ProductInput): Promise<string> {
        const productBase64 = input.frontImage?.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
        if (!productBase64) throw new Error("Input Image Missing");

        const prompt = `Dress the mannequin with the garment from the provided raw_front_img file.
        
        MANDATORY CONFIGURATION:
        - Gender: ${input.gender}
        - Model Age: ${input.age}
        - Body Type: ${input.fit}
        - Product Fit: ${input.productFit}
        - Background: ${input.backgroundColor}
        - Accessory: ${input.accessory}
        - Composition: Full-body shot (boydan çekim), showing the mannequin from head to toe.
        - Aspect Ratio: Vertical 3:4 (Portrait).
        
        CRITICAL OUTPUT INSTRUCTION:
        1. Generate a professional, high-fidelity studio photograph.
        2. The mannequin MUST be shown in a FULL-BODY composition.
        3. You MUST return the output as a binary image or a raw Base64 string.
        4. DO NOT provide conversational text or descriptions.
        
        NEGATIVE PROMPT: 
        Do not use plastic mannequins, headless mannequins, ghostly figures, or cartoonish styles. 
        Do not crop the head or feet. The model must be a REALISTIC HUMAN.`;

        return this.modelService.executeWithFailover('image', async () => {
            console.log(`[GeminiService] VISUAL SYNTHESIS with models/gemini-3-pro-image-preview...`);

            const genModel = this.ai.getGenerativeModel({ model: 'models/gemini-3-pro-image-preview' });

            const result = await genModel.generateContent([
                { text: prompt },
                { inlineData: { data: productBase64, mimeType: 'image/jpeg' } }
            ]);

            const response = await result.response;

            // 1. Check for Native Image Part (inlineData)
            if (result.response.candidates && result.response.candidates[0].content && result.response.candidates[0].content.parts) {
                const parts = result.response.candidates[0].content.parts;
                const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data);
                if (imagePart && imagePart.inlineData) {
                    return `data:${imagePart.inlineData.mimeType || 'image/jpeg'};base64,${imagePart.inlineData.data}`;
                }
            }

            // 2. Fallback: Check Text Output for Base64 (User's regex method)
            let textOutput = "";
            try { textOutput = response.text(); } catch (e) { /* Ignore if no text */ }

            const base64Regex = /([A-Za-z0-9+/]{100,})/;
            const match = textOutput.match(base64Regex);

            if (match && match[0].length > 1000) {
                return `data:image/jpeg;base64,${match[0]}`;
            }

            // Error Logging
            throw new Error(`Gemini 3 Pro Refused/Returned Text: "${textOutput.slice(0, 500)}..."`);
        });
    }

    // --- GÖREV 3, 4 & 5: AKILLI SEO VE METİN ÜRETİMİ ---
    // --- GÖREV 3, 4 & 5: AKILLI SEO VE METİN ÜRETİMİ (REVISED) ---
    async generateSEOContent(input: ProductInput, lang: string = 'tr'): Promise<{ title: string; description: string }> {
        return this.modelService.executeWithFailover('text', async () => {
            const genModel = this.ai.getGenerativeModel({
                model: 'gemini-2.5-flash', // Updated to 2.5 Flash as requested
                generationConfig: { responseMimeType: "application/json" }
            });

            const rawDesc = input.seo_context || "";

            // SMART EXTRACTION: Catch more patterns for Brand, Size, Defects
            const foundBrandMatch = rawDesc.match(/(Marka|Brand)\s*[:\-\s]?\s*([a-zA-Z0-9\s]+)/i);
            const foundSizeMatch = rawDesc.match(/(Beden|Size|Ölçü)\s*[:\-\s]?\s*([a-zA-Z0-9\s/]+)/i);
            const foundDefectMatch = rawDesc.match(/(defo|leke|yırtık|kusur|defect|stain|tear)/i);
            const foundUsageMatch = rawDesc.match(/(yeni|etiketli|ikinci el|kullanılmış|used|new)/i);

            // Extract the actual values or use regex matches directly if simple
            const brandVal = foundBrandMatch ? foundBrandMatch[2].trim() : "";
            const sizeVal = foundSizeMatch ? foundSizeMatch[2].trim() : "";
            const defectVal = foundDefectMatch ? foundDefectMatch[0].trim() : "";
            const usageVal = foundUsageMatch ? foundUsageMatch[0].trim() : "";

            const prompt = `You are a Senior E-commerce Copywriter and SEO Strategist.
            Task: Write a compelling, high-converting product description and title.
            
            INPUT DATA:
            - Raw Details: "${rawDesc}"
            - Product Fit: ${input.productFit}
            
            CRITICAL GUIDELINES:
            1. Title:
               - Max 5 words.
               - MUST include Brand (${brandVal}) and Size (${sizeVal}) if present.
               - Format: "[Brand] [Size] [Key Feature/Type]" (e.g., "Zara S Beden İpek Gömlek").
            
            2. Description:
               - Length: ~500 characters.
               - Style: Focus on Comfort & Style. Storytelling approach.
               - Structure: Single engaging paragraph.
               - Tone: Professional, inviting, and trustworthy.
            
            3. MANDATORY INCLUSIONS (Data Preservation):
               ${defectVal ? `- WARNING: You MUST mention the defect ("${defectVal}") clearly but professionally.` : ""}
               ${brandVal ? `- Mention Brand: "${brandVal}".` : ""}
               ${sizeVal ? `- Mention Size: "${sizeVal}".` : ""}
            
            4. Formatting:
               - EMOJI RULE: Use exactly 5 emojis. Place them naturally BETWEEN sentences or clauses. NOT all at the end.
               - End with exactly 5 relevant hashtags.
            
            OUTPUT LANGUAGE: ${lang === 'tr' ? 'Türkçe' : 'English'}
            OUTPUT JSON: {"title": "...", "description": "..."}`;

            const result = await genModel.generateContent(prompt);
            return JSON.parse(result.response.text());
        });
    }

    // --- BACK VIEW (GEMINI 3 PRO - HIGH FIDELITY) ---
    async generateBackView(input: ProductInput, frontViewImage: string, seoContext?: string): Promise<string> {
        // Updated to use the same high-fidelity model as Front View
        const modelName = 'models/gemini-3-pro-image-preview';
        console.log(`[GeminiService] Generating Back View with ${modelName}...`);

        return this.modelService.executeWithFailover('image', async () => {
            // Validate Inputs
            const frontBase64 = frontViewImage.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
            const backBase64 = input.backImage?.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

            if (!frontBase64) throw new Error("Missing Front Generated Image for reference");

            const genModel = this.ai.getGenerativeModel({ model: modelName });

            const prompt = `Generate a high-fidelity studio photograph of the BACK VIEW of the mannequin/product.
             
             INPUTS:
             - Image 1: The generated FRONT VIEW (Reference for style, lighting, mannequin details).
             - Image 2: The RAW BACK IMAGE (Reference for product details like cuts, labels, patterns).
             
             MANDATORY CONFIGURATION:
             - Composition: Full-body shot (boydan çekim), showing the mannequin from head to toe from the back.
             - Aspect Ratio: Vertical 3:4 (Portrait).
             - Consistency: The mannequin, lighting, and background MUST MATCH the Front View exactly.
             
             CRITICAL OUTPUT INSTRUCTION:
             1. Return ONLY a binary image.
             2. DO NOT include any text.
             `;

            const parts: any[] = [{ text: prompt }];
            // Pushing Front View first as primary style reference
            parts.push({ inlineData: { data: frontBase64, mimeType: 'image/jpeg' } });

            // Pushing Raw Back View if available for details
            if (backBase64) {
                parts.push({ inlineData: { data: backBase64, mimeType: 'image/jpeg' } });
            }

            const result = await genModel.generateContent(parts);
            const response = await result.response;

            // 1. Check for Native Image Part
            if (result.response.candidates && result.response.candidates[0].content && result.response.candidates[0].content.parts) {
                const parts = result.response.candidates[0].content.parts;
                const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data);
                if (imagePart && imagePart.inlineData) {
                    return `data:${imagePart.inlineData.mimeType || 'image/jpeg'};base64,${imagePart.inlineData.data}`;
                }
            }

            // 2. Fallback: Text Regex
            let textOutput = "";
            try { textOutput = response.text(); } catch (e) { /* Ignore */ }
            const base64Regex = /([A-Za-z0-9+/]{100,})/;
            const match = textOutput.match(base64Regex);

            if (match && match[0].length > 1000) {
                return `data:image/jpeg;base64,${match[0]}`;
            }

            throw new Error(`Back View Failed (Text Output): "${textOutput.slice(0, 100)}..."`);
        });
    }

    // --- VIDEO (Stubbed) ---
    async generateVideo(input: ProductInput, imageBase64: string): Promise<string> {
        return "";
    }

    // --- MULTIMODAL PIPELINE METHODS (Refactored) ---

    // Phase 2: Visual Analysis (Keep Flash)
    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        return this.modelService.executeWithFailover('image', async (model) => {
            // Flash is perfect for analysis
            const modelName = 'gemini-2.0-flash';
            console.log(`[GeminiService] ANALYZING with ${modelName}...`);
            const genModel = this.ai.getGenerativeModel({ model: modelName });
            const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

            const result = await genModel.generateContent([
                { text: prompt },
                { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } }
            ]);
            return result.response.text();
        });
    }

    // --- HELPERS ---
    private async generateImagen(prompt: string): Promise<string> {
        // Updated to Imagen 4.0 Fast based on available models list
        const modelName = 'imagen-4.0-fast-generate-001';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${this.apiKey}`;

        console.log(`[GeminiService] Calling Imagen 4 (${modelName}) via REST...`);

        const payload = {
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "3:4",
                personGeneration: "allow_adult"
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Imagen 4 HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();

            // Imagen response parsing
            if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
                return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
            }

            throw new Error(`Imagen 4 No Image Data: ${JSON.stringify(data).slice(0, 100)}...`);

        } catch (e) {
            console.error("[GeminiService] Imagen 4 Failed:", e);
            throw e;
        }
    }

    // Phase 4/5: Pro Image Generation (Hybrid: Flash Logic -> Imagen 4 Pixels)
    async generateProImage(
        prompt: string,
        mainImageBase64: string,
        referenceImageBase64?: string
    ): Promise<string> {
        // We use Imagen 3 for the actual pixel generation
        return this.modelService.executeWithFailover('image', async () => {
            // We inject the "Description" of the input image into the prompt
            // because Imagen 3 (Public) is Text-to-Image.
            // The 'prompt' passed here is usually constructed from attributes.
            // Ideally we would double-check prompt quality.
            return this.generateImagen(prompt);
        });
    }
}

export const F_Generate_SEO_Content = async (p_product: I_Product_Data, lang: 'tr' | 'en', contextOverride?: string) => {
    const service = GeminiService.getInstance();
    const input: ProductInput = {
        gender: p_product.gender ? 'Kadın' : 'Erkek',
        age: p_product.age || '30',
        fit: p_product.vücut_tipi || 'Standart',
        productFit: p_product.kesim || 'Normal',
        backgroundColor: (p_product.background as BgOption) || BgOption.STUDIO,
        accessory: (p_product.aksesuar as Accessory) || Accessory.NONE,
        frontImage: p_product.raw_front,
        backImage: p_product.raw_back || '',
        seo_context: contextOverride || p_product.raw_desc // Use override if provided
    };
    const result = await service.generateSEOContent(input, lang);
    return { title: result.title, description: result.description, tags: [] };
};

export const F_Generate_Model_Image = async (p_product: I_Product_Data): Promise<string | null> => {
    const service = GeminiService.getInstance();
    const input: ProductInput = {
        gender: p_product.gender ? 'Kadın' : 'Erkek',
        age: p_product.age || '30',
        fit: p_product.vücut_tipi || 'Standart',
        productFit: p_product.kesim || 'Normal',
        backgroundColor: (p_product.background as BgOption) || BgOption.STUDIO,
        accessory: (p_product.aksesuar as Accessory) || Accessory.NONE,
        frontImage: p_product.raw_front,
        backImage: p_product.raw_back || ''
    };
    return await service.generateProductOnModel(input);
};

export const F_Generate_Video_Preview = async (p_product: I_Product_Data): Promise<string | null> => {
    const service = GeminiService.getInstance();
    return await service.generateVideo({} as any, p_product.model_front || p_product.raw_front);
};

export const F_Analyze_Image = async (image: string, prompt: string): Promise<string> => {
    const service = GeminiService.getInstance();
    return await service.analyzeImage(image, prompt);
};

export const F_Generate_Pro_Image = async (prompt: string, front: string, back?: string): Promise<string> => {
    const service = GeminiService.getInstance();
    return await service.generateProImage(prompt, front, back);
};

export const F_Generate_Back_View = async (p_product: I_Product_Data, front_view: string): Promise<string> => {
    const service = GeminiService.getInstance();
    const input: ProductInput = {
        gender: p_product.gender ? 'Kadın' : 'Erkek',
        age: p_product.age || '30',
        fit: p_product.vücut_tipi || 'Standart',
        productFit: p_product.kesim || 'Normal',
        backgroundColor: (p_product.background as BgOption) || BgOption.STUDIO,
        accessory: (p_product.aksesuar as Accessory) || Accessory.NONE,
        frontImage: p_product.raw_front,
        backImage: p_product.raw_back || ''
    };
    return await service.generateBackView(input, front_view);
};
