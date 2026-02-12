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

    // --- CORE MULTIMODAL PIPELINE (Flash 2.5) ---
    async generateProductOnModel(
        input: ProductInput,
        side: 'ön' | 'arka',
        referenceModelImage?: string,
        seoContext?: string,
        viewTypeOverride?: 'front' | 'back'
    ): Promise<string> {
        // Redirect 'back' view generation
        if ((side === 'arka' || viewTypeOverride === 'back') && referenceModelImage) {
            return this.generateBackView(input, referenceModelImage, seoContext);
        }

        // 1. PRE-PROCESSING
        let productBase64 = side === 'ön' ? input.frontImage : input.backImage;
        if (!productBase64) throw new Error("No Input Image");
        const cleanBase64 = productBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

        // 2. PROMPT CONSTRUCTION
        const viewType = viewTypeOverride || (side === 'arka' ? 'back' : 'front');
        let prompt = F_Build_Structured_Prompt(input, seoContext, viewType);
        prompt = prompt.replace(/model/gi, "subject").replace(/body type/gi, "physique");

        // 3. EXECUTION (Flash Only)
        return this.modelService.executeWithFailover('image', async (model) => {
            console.log(`[GeminiService] VISUAL SYNTHESIS with ${model.name}...`);

            const genModel = this.ai.getGenerativeModel({ model: model.name });
            const result = await genModel.generateContent([
                { text: prompt },
                { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } }
            ]);

            const response = await result.response;
            const text = response.text();

            if (text && text.length > 1000 && !text.includes(' ')) {
                return `data:image/jpeg;base64,${text}`;
            }

            // Failing Check
            throw new Error(`Gemini Flash returned Text (Not Image): "${text.slice(0, 50)}..."`);
        });
    }

    // --- TEXT PIPELINE ---
    async generateSEOContent(input: ProductInput, image: string, language: string = 'en'): Promise<{ title: string; description: string }> {
        return this.modelService.executeWithFailover('text', async (model) => {
            console.log(`[GeminiService] SEO GEN with ${model.name}`);
            const genModel = this.ai.getGenerativeModel({
                model: model.name, // Will be Flash
                generationConfig: { responseMimeType: "application/json" }
            });

            const cleanBase64 = image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
            const prompt = `ACT AS A SENIOR E-COMMERCE COPYWRITER.
            INPUTS: Age: ${input.age}, Gender: ${input.gender}, Fit: ${input.fit}, Context: ${input.seo_context}
            OUTPUT LANGUAGE: ${language}
            TASK: Write product title and description.
            OUTPUT JSON: {"title": "...", "description": "..."}`;

            const result = await genModel.generateContent([
                { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
                { text: prompt }
            ]);

            const text = result.response.text();
            try { return JSON.parse(text); } catch { return { title: "Error", description: text.slice(0, 100) }; }
        });
    }

    // --- BACK VIEW ---
    async generateBackView(input: ProductInput, frontViewImage: string, seoContext?: string): Promise<string> {
        const modelName = 'gemini-3-pro-image-preview';
        console.log(`[GeminiService] Generating Back View with ${modelName}...`);

        return this.modelService.executeWithFailover('image', async (model) => {
            const genModel = this.ai.getGenerativeModel({ model: modelName });
            const prompt = "Generate consistent back view. (See Front View)";

            const p1 = input.backImage?.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
            const p2 = frontViewImage.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

            const parts: any[] = [{ text: prompt }];
            if (p1) parts.push({ inlineData: { data: p1, mimeType: 'image/jpeg' } });
            if (p2) parts.push({ inlineData: { data: p2, mimeType: 'image/jpeg' } });

            const result = await genModel.generateContent(parts);
            const text = result.response.text();
            if (text && text.length > 1000 && !text.includes(' ')) {
                return `data:image/jpeg;base64,${text}`;
            }
            throw new Error("Back View Gen Failed: " + text.slice(0, 50));
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

export const F_Generate_SEO_Content = async (p_product: I_Product_Data, lang: 'tr' | 'en') => {
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
    const result = await service.generateSEOContent(input, p_product.raw_front, lang);
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
    return await service.generateProductOnModel(input, 'ön', undefined, p_product.raw_desc);
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
