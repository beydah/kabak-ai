
import { ApiLog } from '../types/interfaces';

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
        const model: AIModel = { name: PRIMARY_MODEL, type: task, isFallback: false };

        try {
            console.log(`[ModelService] Executing ${task} with ${model.name}`);
            return await operation(model);
        } catch (error: any) {
            console.error(`[ModelService] ${model.name} Failed:`, error);
            throw error; // Propagate error immediately to trigger "failed" status in JobManager
        }
    }

    private getModelsForTask(task: ModelTask): AIModel[] {
        return [{ name: PRIMARY_MODEL, type: task, isFallback: false }];
    }
}
