import { I_Product_Data, I_Error_Log, I_Metric } from '../types/interfaces';

const DB_NAME = 'KabakAI_DB';
const DB_VERSION = 2; // Increment version to trigger upgrade
const STORE_PRODUCTS = 'products';
const STORE_LOGS = 'error_logs';
const STORE_METRICS = 'metrics';

class StorageService {
    private db: IDBDatabase | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
                    db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
                }
                const STORE_METRICS = 'metrics';

                // ... (Inside onupgradeneeded)
                if (!db.objectStoreNames.contains(STORE_LOGS)) {
                    db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORE_METRICS)) {
                    db.createObjectStore(STORE_METRICS, { keyPath: 'model_id' });
                }
            };
        });
    }

    // ... (Generic helpers remain same)

    // METRICS METHODS
    async getMetric(model_id: string): Promise<any | undefined> {
        return this.getById(STORE_METRICS, model_id);
    }

    async updateMetric(metric: any): Promise<void> {
        await this.put(STORE_METRICS, metric);
    }

    async getAllMetrics(): Promise<any[]> {
        return this.getAll(STORE_METRICS);
    }

    // ... (Other methods)

    // GENERIC HELPERS
    private async getAll<T>(storeName: string): Promise<T[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async getById<T>(storeName: string, id: string): Promise<T | undefined> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async put<T>(storeName: string, item: T): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async delete(storeName: string, id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private async clear(storeName: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // PRODUCT METHODS
    async getAllProducts(): Promise<I_Product_Data[]> {
        // Return reversed to show newest first (mimicking unshift)
        const items = await this.getAll<I_Product_Data>(STORE_PRODUCTS);
        return items.sort((a, b) => b.created_at - a.created_at);
    }

    async getProduct(id: string): Promise<I_Product_Data | undefined> {
        return this.getById<I_Product_Data>(STORE_PRODUCTS, id);
    }

    async saveProduct(product: I_Product_Data): Promise<void> {
        await this.put(STORE_PRODUCTS, product);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.delete(STORE_PRODUCTS, id);
    }

    // LOG METHODS
    async getAllLogs(): Promise<I_Error_Log[]> {
        const items = await this.getAll<I_Error_Log>(STORE_LOGS);
        return items.sort((a, b) => b.timestamp - a.timestamp);
    }

    async addLog(log: I_Error_Log): Promise<void> {
        await this.put(STORE_LOGS, log);
    }

    async removeLog(id: string): Promise<void> {
        await this.delete(STORE_LOGS, id);
    }

    async clearLogs(): Promise<void> {
        await this.clear(STORE_LOGS);
    }

    // MIGRATION HELPER
    async migrateFromLocalStorage(): Promise<void> {
        // Products
        const raw_products = localStorage.getItem('kabak_ai_products');
        if (raw_products) {
            try {
                const products: I_Product_Data[] = JSON.parse(raw_products);
                if (Array.isArray(products) && products.length > 0) {
                    console.info("[Migration] Moving products to IndexedDB...");
                    for (const p of products) {
                        await this.saveProduct(p);
                    }
                    localStorage.removeItem('kabak_ai_products'); // Clear after success
                }
            } catch (e) {
                console.error("[Migration] Failed to migrate products:", e);
            }
        }

        // Logs
        const raw_logs = localStorage.getItem('kabak_ai_error_logs');
        if (raw_logs) {
            try {
                const logs: I_Error_Log[] = JSON.parse(raw_logs);
                if (Array.isArray(logs) && logs.length > 0) {
                    console.info("[Migration] Moving logs to IndexedDB...");
                    for (const l of logs) {
                        await this.addLog(l);
                    }
                    localStorage.removeItem('kabak_ai_error_logs');
                }
            } catch (e) {
                console.error("[Migration] Failed to migrate logs:", e);
            }
        }
    }
}

export const DB_Service = new StorageService();
