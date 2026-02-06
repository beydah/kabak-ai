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
    F_Save_Product,
    F_Delete_Product_By_Id
} from '../../utils/storage_utils';
import { F_Generate_SEO_Content } from '../../services/gemini_service';
import { F_Get_Language } from '../../utils/i18n_utils';
import { JobContext } from '../../context/JobContext';

export const F_Job_Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [error_logs, set_error_logs] = useState<I_Error_Log[]>([]);

    const refresh_logs = async () => {
        set_error_logs(await F_Get_Error_Logs());
    };

    const cancel_job = async (id: string) => {
        console.log(`[Job Manager] Cancelling (Deleting) job: ${id}`);
        await F_Delete_Product_By_Id(id);
        refresh_logs();
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
                // TIMEOUT GUARD (5 Minutes = 300,000ms)
                const TIMEOUT_MS = 300000;
                if (Date.now() - product.created_at > TIMEOUT_MS) {
                    console.warn(`[Job Manager] System Timeout for ${product.product_id}`);
                    await F_Update_Product_Status(product.product_id, 'exited', "System Timeout: 5 Minutes");
                    return;
                }

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
                        console.log(`[Job Manager] Status Change: Generating Image for ${product.product_id}...`);

                        // Notify UI of detailed status (via error_log field as status message for now)
                        // This allows the "Processing" badge to potentially show "Generating Image..." if UI checks this.
                        if (product.error_log !== "Generating Image...") {
                            product.error_log = "Generating Image...";
                            await F_Save_Product(product);
                        }

                        const { F_Generate_Model_Image } = await import('../../services/gemini_service');
                        const image_base64 = await F_Generate_Model_Image(product);

                        if (!image_base64) {
                            throw new Error("Image Generation Failed (Empty Response)");
                        }

                        // ECHO GUARD: Prevent storing raw input as result
                        if (image_base64 === product.raw_front) {
                            // Simulation placeholder bypass (Check Step 2523 implementation of F_Generate_Model_Image returns a specific 1x1 pixel)
                            // If it returns the 1x1 pixel, it is NOT equal to raw full raw_front.
                            // So this guard is safe for real failures.
                            throw new Error("Image Generation Failed (Returned Input)");
                        }

                        await F_Update_Product_Status(
                            product.product_id,
                            'finished',
                            undefined, // Clear error/status msg
                            undefined, // Keep title
                            undefined, // Keep desc
                            image_base64
                        );
                        console.log(`[Job Manager] Image Generated and Job Finished for: ${product.product_id}`);
                    }

                } catch (error: any) {
                    console.error(`[Job Manager] Job Failed:`, error);
                    const err_msg = error.message || "Unknown Gemini Error";

                    let notify_title = "Job Failed";
                    let notify_msg = err_msg;

                    // MAPPING (User Specified)
                    if (err_msg.includes("404")) {
                        notify_title = "Engine Maintenance";
                        notify_msg = "Image Engine (Imagen 3) unreachable. Falling back to placeholder.";
                    } else if (err_msg.includes("SAFETY_FILTER_TRIGGERED") || err_msg.includes("IMAGEN_API_NO_IMAGE")) {
                        notify_title = "Safety Filter";
                        notify_msg = "Visual output restricted by safety filters. Adjusting description...";
                    } else if (err_msg.includes("429") || err_msg.includes("Timeout")) {
                        notify_title = "System Busy";
                        notify_msg = "Upload too large or connection slow. Optimizing image...";
                    }

                    // CRITICAL VALIDATION FAILURE: Immediate Exit (No Retry)
                    if (err_msg.includes("SAFETY_FILTER_TRIGGERED") || err_msg.includes("IMAGEN_API_NO_IMAGE") || err_msg.includes("404") || err_msg.includes("invalid/empty image") || err_msg.includes("Visual Engine maintenance") || err_msg.includes("Maintenance")) {
                        console.error(`[Job Manager] Critical Failure for ${product.product_id}: ${err_msg}`);

                        // Set status to exited immediately for these known terminal errors
                        await F_Update_Product_Status(product.product_id, 'exited', `Exited: ${notify_title}`);

                        F_Add_Error_Log({
                            product_id: product.product_id,
                            message: `${notify_title}: ${notify_msg}`
                        });

                        refresh_logs();
                        return;
                    }

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
        <JobContext.Provider value={{ error_logs, clear_logs, remove_log, refresh_logs, cancel_job }}>
            {children}
        </JobContext.Provider>
    );
};
