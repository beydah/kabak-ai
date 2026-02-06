import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    I_Product_Data,
    F_Get_All_Products,
    F_Update_Product_Status,
    F_Add_Error_Log,
    I_Error_Log,
    F_Get_Error_Logs,
    F_Clear_Error_Logs,
    F_Remove_Error_Log,
    F_Save_Product
} from '../../utils/storage_utils';
import { F_Generate_SEO_Content } from '../../services/gemini_service';
import { F_Get_Language } from '../../utils/i18n_utils';

interface JobContextType {
    error_logs: I_Error_Log[];
    clear_logs: () => void;
    remove_log: (id: string) => void;
    refresh_logs: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const F_Job_Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [error_logs, set_error_logs] = useState<I_Error_Log[]>([]);

    const refresh_logs = async () => {
        set_error_logs(await F_Get_Error_Logs());
    };

    useEffect(() => {
        refresh_logs();

        // POLL for "running" jobs
        // In a real app, this might be a websocket or a dedicated worker.
        // Here we use an interval to check local storage state.
        const interval = setInterval(async () => {
            const products = await F_Get_All_Products();
            const running_products = products.filter(p => p.status === 'running');

            running_products.forEach(async (product) => {
                // Retry Guard
                if ((product.retry_count || 0) >= 3) {
                    console.warn(`[Job Manager] Max retries reached for ${product.product_id}. Exiting.`);
                    // We must force 'exited' status and save. 
                    // F_Update_Product_Status handles standard updates, but we need to ensure it's saved as exited.
                    if (product.status !== 'exited') {
                        await F_Update_Product_Status(product.product_id, 'exited', "Max Retries Exceeded");
                    }
                    return;
                }

                try {
                    console.log(`[Job Manager] Processing: ${product.product_id} (Attempt ${(product.retry_count || 0) + 1})`);

                    // Call Gemini API
                    const lang = F_Get_Language();

                    // STEP 1: Generate Text (SEO Content)
                    if (!product.product_title || !product.product_desc) {
                        const result = await F_Generate_SEO_Content(product, lang as 'tr' | 'en');

                        await F_Update_Product_Status(
                            product.product_id,
                            'running',
                            undefined,
                            result.title,
                            result.description
                        );
                        console.log(`[Job Manager] Text Generated for: ${product.product_id}`);
                        return;
                    }

                    // STEP 2: Generate Image
                    if (!product.model_front) {
                        const { F_Generate_Model_Image } = await import('../../services/gemini_service');
                        const image_base64 = await F_Generate_Model_Image(product);

                        if (!image_base64) {
                            throw new Error("Image Generation Failed (Empty Response)");
                        }

                        await F_Update_Product_Status(
                            product.product_id,
                            'finished',
                            undefined, // No error
                            undefined, // Keep title
                            undefined, // Keep desc
                            image_base64
                        );
                        console.log(`[Job Manager] Image Generated and Job Finished for: ${product.product_id}`);
                    }

                } catch (error: any) {
                    console.error(`[Job Manager] Job Failed:`, error);
                    const err_msg = error.message || "Unknown Gemini Error";

                    // Increment Retry
                    const new_retry = (product.retry_count || 0) + 1;

                    // We need to persist this retry count.
                    // Since F_Update_Product_Status refreshes from DB, we should update the DB with new retry count.
                    // But F_Update_Product_Status doesn't expose retry_count arg.
                    // So we must manually save the product with updated retry_count.
                    // We need F_Save_Product.
                    product.retry_count = new_retry;
                    product.error_log = `Retry ${new_retry}: ${err_msg}`;

                    if (new_retry >= 3) {
                        product.status = 'exited';
                        product.error_log = `Max Retries Exceeded: ${err_msg}`;
                        F_Add_Error_Log({
                            product_id: product.product_id,
                            message: `Job Exited: ${err_msg}`
                        });
                    }

                    await F_Save_Product(product);
                    refresh_logs();
                }
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const clear_logs = () => {
        F_Clear_Error_Logs();
        refresh_logs();
    };

    const remove_log = (id: string) => {
        F_Remove_Error_Log(id);
        refresh_logs();
    };

    return (
        <JobContext.Provider value={{ error_logs, clear_logs, remove_log, refresh_logs }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobManager = () => {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error('useJobManager must be used within a F_Job_Provider');
    }
    return context;
};
