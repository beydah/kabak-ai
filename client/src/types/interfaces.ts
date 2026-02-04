export type ProductStatus = 'draft' | 'running' | 'finished' | 'exited';

export interface I_Product_Data {
    id: string;
    created_at: number;
    front_image: string;
    back_image: string;
    gender: string;
    age: number;
    body_type: string;
    fit: string;
    background: string;
    accessory: string;
    description: string;
    // New Fields
    status: ProductStatus;
    generated_title?: string;
    generated_description?: string;
    error_log?: string;
}

export interface I_Error_Log {
    id: string;
    product_id?: string;
    message: string;
    timestamp: number;
}

export interface I_Metric {
    model_id: string; // e.g. "gemini-3-pro"
    total_requests: number;
    total_cost: number;
    usage_history: { date: string; count: number; cost: number }[]; // For daily/weekly views
    last_updated: number;
}
