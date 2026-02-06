export type ProductStatus = 'draft' | 'running' | 'finished' | 'exited';

export interface I_Product_Data {
    product_id: string; // Unique UUID

    // Images (Base64/Blob)
    raw_front: string;
    raw_back: string;
    model_front?: string; // AI Generated result
    model_back?: string;  // Placeholder
    model_video?: string; // Placeholder

    // AI Content
    product_title?: string;
    product_desc?: string;

    // Attributes
    gender: boolean; // true = Female, false = Male (Assumption based on fashion default)
    age: string;     // User input
    vücut_tipi: string; // body_type
    kesim: string;      // fit
    background: string;
    aksesuar: string;   // accessory

    raw_desc: string; // Original user input text

    // Metadata
    update_at: number;
    created_at: number; // Keeping for sort
    status: ProductStatus;
    retry_count?: number;
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
