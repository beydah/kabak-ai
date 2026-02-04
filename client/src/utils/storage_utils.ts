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

const STORAGE_KEY_PRODUCTS = 'kabak_ai_products';
const STORAGE_KEY_DRAFT = 'kabak_ai_draft';
const STORAGE_KEY_LOGS = 'kabak_ai_error_logs';
const STORAGE_KEY_THEME = 'kabak_ai_theme';
const STORAGE_KEY_LANG = 'kabak_ai_lang';

// PRODUCT OPERATIONS
export const F_Save_Product = (p_product: I_Product_Data) => {
    const products = F_Get_All_Products();
    // Check if exists and update, or add new
    const index = products.findIndex(p => p.id === p_product.id);
    if (index >= 0) {
        products[index] = p_product;
    } else {
        products.unshift(p_product); // Add to beginning
    }
    try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
            alert("Storage Limit Reached. Please delete some old products to create new ones.");
            throw e; // Bubble up so UI knows it failed
        }
    }
};

export const F_Get_All_Products = (): I_Product_Data[] => {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return data ? JSON.parse(data) : [];
};

export const F_Get_Product_By_Id = (p_id: string): I_Product_Data | undefined => {
    const products = F_Get_All_Products();
    return products.find(p => p.id === p_id);
};

export const F_Update_Product_Status = (p_id: string, p_status: ProductStatus, p_error?: string, p_title?: string, p_desc?: string) => {
    const products = F_Get_All_Products();
    const product = products.find(p => p.id === p_id);
    if (product) {
        product.status = p_status;
        if (p_error) product.error_log = p_error;
        if (p_title) product.generated_title = p_title;
        if (p_desc) product.generated_description = p_desc;
        F_Save_Product(product);
    }
};

// DRAFT OPERATIONS
export const F_Save_Draft = (p_data: Partial<I_Product_Data>) => {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(p_data));
};

export const F_Get_Draft = (): Partial<I_Product_Data> | null => {
    const data = localStorage.getItem(STORAGE_KEY_DRAFT);
    return data ? JSON.parse(data) : null;
};

export const F_Clear_Draft = () => {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
};

// ERROR LOG OPERATIONS (Global Overlay)
export interface I_Error_Log {
    id: string;
    product_id?: string;
    message: string;
    timestamp: number;
}

export const F_Add_Error_Log = (p_log: Omit<I_Error_Log, 'id' | 'timestamp'>) => {
    const logs = F_Get_Error_Logs();
    const new_log: I_Error_Log = {
        ...p_log,
        id: crypto.randomUUID(),
        timestamp: Date.now()
    };
    logs.unshift(new_log);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
};

export const F_Get_Error_Logs = (): I_Error_Log[] => {
    const data = localStorage.getItem(STORAGE_KEY_LOGS);
    return data ? JSON.parse(data) : [];
};

export const F_Clear_Error_Logs = () => {
    localStorage.removeItem(STORAGE_KEY_LOGS);
};

export const F_Remove_Error_Log = (p_id: string) => {
    const logs = F_Get_Error_Logs();
    const new_logs = logs.filter(l => l.id !== p_id);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(new_logs));
};

// Preference Utils using Cookies (as requested) + LocalStorage backup
export const F_Set_Preference = (p_key: 'theme' | 'lang', p_value: string) => {
    // Set Cookie
    document.cookie = `${p_key}=${p_value}; path=/; max-age=31536000`; // 1 year
    // Set LocalStorage (redundancy)
    localStorage.setItem(p_key === 'theme' ? STORAGE_KEY_THEME : STORAGE_KEY_LANG, p_value);
};

export const F_Get_Preference = (p_key: 'theme' | 'lang'): string | null => {
    const match = document.cookie.split('; ').find(row => row.startsWith(`${p_key}=`));
    if (match) return match.split('=')[1];
    return localStorage.getItem(p_key === 'theme' ? STORAGE_KEY_THEME : STORAGE_KEY_LANG);
};
