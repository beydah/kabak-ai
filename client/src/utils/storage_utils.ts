import { DB_Service } from '../services/storage_service';
import { I_Product_Data, I_Error_Log, I_Metric, ProductStatus } from '../types/interfaces';

export type { I_Product_Data, I_Error_Log, I_Metric }; // Re-export types

const STORAGE_KEY_DRAFT = 'kabak_ai_draft';
const STORAGE_KEY_THEME = 'kabak_ai_theme';
const STORAGE_KEY_LANG = 'kabak_ai_lang';

// MIGRATION TRIGGER
// Fire and forget on load
DB_Service.migrateFromLocalStorage().catch(console.error);

// SYNC CHANNEL
const SYNC_CHANNEL = new BroadcastChannel('kabak_sync_channel');

export const F_Subscribe_To_Updates = (callback: () => void) => {
    const handler = () => callback();
    SYNC_CHANNEL.addEventListener('message', handler);
    return () => SYNC_CHANNEL.removeEventListener('message', handler);
};

const F_Notify_Table = () => {
    SYNC_CHANNEL.postMessage({ type: 'update' });
};

// PRODUCT OPERATIONS (ASYNC - IndexedDB)
export const F_Save_Product = async (p_product: I_Product_Data) => {
    if (!p_product.product_id || p_product.product_id === 'undefined') {
        console.error("[Storage] Save aborted: Missing ID", p_product);
        throw new Error("Invalid ID");
    }
    try {
        await DB_Service.saveProduct(p_product);
        F_Notify_Table();
    } catch (e) {
        console.error("Failed to save product:", e);
        throw e;
    }
};

export const F_Get_All_Products = async (): Promise<I_Product_Data[]> => {
    try {
        const products = await DB_Service.getAllProducts();
        // Filter out corrupt data from UI immediately
        return products.filter(p => p.product_id && p.product_id !== 'undefined');
    } catch (e) {
        console.error("Failed to fetch products:", e);
        return [];
    }
};

export const F_Get_Product_By_Id = async (p_id: string): Promise<I_Product_Data | undefined> => {
    if (!p_id || p_id === 'undefined') {
        console.error("[Storage] Get aborted: Invalid ID");
        return undefined;
    }
    try {
        return await DB_Service.getProduct(p_id);
    } catch (e) {
        console.error("Failed to fetch product:", e);
        return undefined;
    }
};

export const F_Update_Product_Status = async (p_id: string, p_status: ProductStatus, p_error?: string, p_title?: string, p_desc?: string, p_generated_image?: string) => {
    if (!p_id || p_id === 'undefined') {
        console.error("[Storage] Update Status aborted: Invalid ID");
        throw new Error("FATAL: Invalid ID in Status Update");
    }
    try {
        const product = await DB_Service.getProduct(p_id);
        if (product) {
            product.status = p_status;
            if (p_error) product.error_log = p_error;
            if (p_title) product.product_title = p_title;
            if (p_desc) product.product_desc = p_desc;
            if (p_generated_image) product.model_front = p_generated_image;

            // Retry Count Logic handled by caller, but we persist it if it exists in object
            // Just updating timestamp here
            product.update_at = Date.now();

            await DB_Service.saveProduct(product);
            F_Notify_Table();
        } else {
            console.warn(`[Storage] Product not found for update: ${p_id}`);
        }
    } catch (e) {
        console.error("Failed to update status:", e);
        throw e;
    }
};

export const F_Delete_Product_By_Id = async (p_id: string) => {
    if (!p_id || p_id === 'undefined') return;
    await DB_Service.deleteProduct(p_id);
    F_Notify_Table();
}

export const F_Purge_Corrupt_Data = async () => {
    try {
        const products = await DB_Service.getAllProducts();
        const corrupt = products.filter(p => !p.product_id || p.product_id === 'undefined');

        if (corrupt.length > 0) {
            console.warn(`[Storage] Found ${corrupt.length} corrupt items. Purging...`);
            for (const p of corrupt) {
                // Try to delete using the key if it matches the bad ID, 
                // or just best effort if the key is effectively unreachable standardly.
                // Assuming key was saved as 'undefined' string or empty.
                if (p.product_id) await DB_Service.deleteProduct(p.product_id);
            }
            F_Notify_Table();
        }
    } catch (e) {
        console.error("[Storage] Purge failed", e);
    }
};
// Run Purge
F_Purge_Corrupt_Data();

// ... (Draft operations unchanged) ...
// DRAFT OPERATIONS (SYNC - LocalStorage)
// Drafts are small and need instant access for form hydration
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

// ERROR LOG OPERATIONS (ASYNC - IndexedDB)
// ERROR LOG OPERATIONS (ASYNC - IndexedDB)

export const F_Add_Error_Log = async (p_log: Omit<I_Error_Log, 'id' | 'timestamp'>) => {
    const new_log: I_Error_Log = {
        ...p_log,
        id: crypto.randomUUID(),
        timestamp: Date.now()
    };
    await DB_Service.addLog(new_log);
    F_Notify_Table(); // Also notify for logs? maybe.
};

export const F_Get_Error_Logs = async (): Promise<I_Error_Log[]> => {
    return await DB_Service.getAllLogs();
};

export const F_Clear_Error_Logs = async () => {
    await DB_Service.clearLogs();
    F_Notify_Table();
};

export const F_Remove_Error_Log = async (p_id: string) => {
    await DB_Service.removeLog(p_id);
    F_Notify_Table();
};

// METRICS OPERATIONS (ASYNC - IndexedDB)
export const F_Track_Usage = async (model_id: string, cost: number) => {
    // Use local YYYY-MM-DD
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const today = new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    let metric = await DB_Service.getMetric(model_id);

    if (!metric) {
        metric = {
            model_id,
            total_requests: 0,
            total_cost: 0,
            usage_history: [],
            last_updated: Date.now()
        };
    }

    metric.total_requests += 1;
    metric.total_cost += cost;
    metric.last_updated = Date.now();

    // Update history for today
    const historyIndex = metric.usage_history.findIndex((h: any) => h.date === today);
    if (historyIndex >= 0) {
        metric.usage_history[historyIndex].count += 1;
        metric.usage_history[historyIndex].cost += cost;
    } else {
        metric.usage_history.push({ date: today, count: 1, cost: cost });
    }

    await DB_Service.updateMetric(metric);
    F_Notify_Table();
};

export const F_Get_All_Metrics = async (): Promise<I_Metric[]> => {
    return await DB_Service.getAllMetrics();
};

// Preference Utils using Cookies (as requested) + LocalStorage backup
export const F_Set_Preference = (p_key: 'theme' | 'lang' | 'app_currency', p_value: string) => {
    // Set Cookie
    document.cookie = `${p_key}=${p_value}; path=/; max-age=31536000; SameSite=Lax; Secure`; // 1 year

    // Set LocalStorage (redundancy)
    let ls_key = 'kabak_ai_currency';
    if (p_key === 'theme') ls_key = STORAGE_KEY_THEME;
    if (p_key === 'lang') ls_key = STORAGE_KEY_LANG;

    localStorage.setItem(ls_key, p_value);
};

export const F_Get_Preference = (p_key: 'theme' | 'lang' | 'app_currency'): string | null => {
    const match = document.cookie.split('; ').find(row => row.startsWith(`${p_key}=`));
    if (match) return match.split('=')[1];

    let ls_key = 'kabak_ai_currency';
    if (p_key === 'theme') ls_key = STORAGE_KEY_THEME;
    if (p_key === 'lang') ls_key = STORAGE_KEY_LANG;

    return localStorage.getItem(ls_key);
};
