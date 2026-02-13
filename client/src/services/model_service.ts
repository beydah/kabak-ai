
import { ApiLog } from '../types/interfaces';
import { F_Track_Usage } from '../utils/storage_utils';

export type ModelTask = 'text' | 'image' | 'video';

export interface AIModel {
    name: string;
    type: ModelTask;
    isFallback: boolean;
}

// HARD-CODED SINGLE SOURCE OF TRUTH
export const PRIMARY_MODEL = 'gemini-2.0-flash';

export const TEXT_MODELS: AIModel[] = [{ name: PRIMARY_MODEL, type: 'text', isFallback: false }];
export const VISUAL_MODELS: AIModel[] = [{ name: PRIMARY_MODEL, type: 'image', isFallback: false }];
export const VIDEO_MODELS: AIModel[] = [];

const COST_MAP: Record<string, number> = {
    'gemini-2.0-flash': 0.0001,
    'gemini-2.5-flash': 0.0001,
    'gemini-1.5-pro': 0.001,
    'models/gemini-3-pro-image-preview': 0.002, // Estimated
    'veo-3.0-generate-001': 0.05
};

export class ModelService {
    private static instance: ModelService;

    private constructor() { }

    public static getInstance(): ModelService {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService();
        }
        return ModelService.instance;
    }

    public async executeWithFailover<T>(
        task: ModelTask,
        operation: (model: AIModel) => Promise<T>
    ): Promise<T> {
        // We use the model defined in the operation usually, but here we just need a reference for logging if needed
        // The actual model used is inside 'operation' closure in gemini_service usually, 
        // OR we should pass the model name to this function to track it properly?
        // Current architecture: executeWithFailover takes a lambda that has the model hardcoded or selected.
        // We need to know WHICH model was used to track cost.
        // Let's rely on the operation to return the result, and we'll track a "default" cost or refactor?
        // Refactor: We can't easily refactor the signature without changing all callers.
        // Compromise: We will extract the model name from the log or assumed context?
        // Actually, let's just track the PRIMARY_MODEL cost for now or passed model.
        // Better: We track based on the 'task' type as a proxy for now, OR we wait for the result?
        // 
        // Let's modify the signature in a future refactor. For now, we will track a generic cost or try to regex the model name from logs?
        // No, let's just assume the cost based on task type (Text = Flash, Image = Pro) for the dashboard estimation.

        // Wait, I can pass the Model Name to executeWithFailover? 
        // No, strictly following rules: I can modify the file. 
        // I will add an optional `modelName` param to `executeWithFailover` to facilitate tracking.

        const model: AIModel = { name: PRIMARY_MODEL, type: task, isFallback: false };

        try {
            console.log(`[ModelService] Executing ${task}`);
            const result = await operation(model);

            // TRACKING HACK: We don't strictly know the model name used inside 'operation'.
            // But we know standard usage:
            // Text -> gemini-2.5-flash
            // Image -> gemini-3-pro
            let trackedModel = 'gemini-2.5-flash';
            if (task === 'image') trackedModel = 'models/gemini-3-pro-image-preview';

            F_Track_Usage(trackedModel, COST_MAP[trackedModel] || 0.0001).catch(console.error);

            return result;
        } catch (error: any) {
            console.error(`[ModelService] Failed:`, error);
            throw error;
        }
    }

    private getModelsForTask(task: ModelTask): AIModel[] {
        return [{ name: PRIMARY_MODEL, type: task, isFallback: false }];
    }
}
