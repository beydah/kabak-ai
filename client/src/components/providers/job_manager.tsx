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

        // POLL for "running" jobs (and Chained Update Statuses)
        const interval = setInterval(async () => {
            const products = await F_Get_All_Products();

            // Filter where status is 'running' OR any granular status is 'pending'/'updating'
            const active_products = products.filter(p =>
                p.status === 'running' ||
                p.analysis_status === 'pending' || p.analysis_status === 'updating' ||
                p.seo_status === 'pending' || p.seo_status === 'updating' ||
                p.front_status === 'pending' || p.front_status === 'updating' ||
                p.back_status === 'pending' || p.back_status === 'updating' ||
                p.video_status === 'pending' || p.video_status === 'updating'
            );

            active_products.forEach(async (product) => {
                // TIMEOUT GUARD (10 Minutes)
                const TIMEOUT_MS = 600000;
                if (Date.now() - product.created_at > TIMEOUT_MS) {
                    console.warn(`[Job Manager] System Timeout for ${product.product_id}`);
                    product.status = 'exited';
                    product.error_log = "System Timeout: 10 Minutes";
                    // Reset granular statuses to failed
                    if (product.seo_status === 'updating' || product.seo_status === 'pending') product.seo_status = 'failed';
                    if (product.front_status === 'updating' || product.front_status === 'pending') product.front_status = 'failed';
                    if (product.back_status === 'updating' || product.back_status === 'pending') product.back_status = 'failed';
                    if (product.video_status === 'updating' || product.video_status === 'pending') product.video_status = 'failed';

                    await F_Save_Product(product);
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
                    // LOCK: Stop if finished or failed
                    if (product.status === 'finished' || product.status === 'failed') return;

                    console.log(`[Job Manager] Processing Chain: ${product.product_id}`);

                    // --- PHASE 2: VISUAL ANALYSIS (Gemini 2.5 Flash) ---
                    // Condition: analysis 'pending' OR (running AND no analysis yet)
                    if (product.analysis_status === 'pending' || (product.status === 'running' && !product.front_analyse)) {
                        if (product.analysis_status !== 'updating') {
                            product.analysis_status = 'updating';
                            product.error_log = "Analyzing Visual Attributes (Flash 2.0)...";
                            await F_Save_Product(product);
                        }

                        const { F_Analyze_Image } = await import('../../services/gemini_service');

                        // 2a. Front Analysis
                        if (!product.front_analyse && product.raw_front) {
                            product.front_analyse = await F_Analyze_Image(product.raw_front, "Describe detailed technical fashion attributes: Fit, Length, Fabric, Neckline, Sleeve, Color, Pattern. Output as concise keywords.");
                        }

                        // 2b. Back Analysis
                        if (!product.back_analyse && product.raw_back) {
                            product.back_analyse = await F_Analyze_Image(product.raw_back, "Describe back details: Cuts, Zippers, Pockets, Fit from back. Output as concise keywords.");
                        }

                        product.analysis_status = 'completed';

                        // Trigger Next: SEO
                        if (product.seo_status !== 'completed') product.seo_status = 'pending';

                        await F_Save_Product(product);
                        console.log(`[Job Manager] Analysis Completed -> Triggering SEO`);
                        return;
                    }

                    // --- PHASE 3: LOCALIZED SEO ENGINE (Gemini 2.5 Flash) ---
                    if (product.seo_status === 'pending') {
                        // Dependency: Analysis
                        if (product.analysis_status !== 'completed' && !product.front_analyse) return;

                        // if (product.seo_status !== 'updating') {
                        product.seo_status = 'updating';
                        product.error_log = "Writing Localized Marketing Copy...";
                        await F_Save_Product(product);
                        // }

                        const { F_Generate_SEO_Content } = await import('../../services/gemini_service');

                        // Inject Analysis into Context
                        // We append analysis to the "raw_desc" or pass via context param?
                        // F_Generate_SEO_Content takes 'product'. Let's update product.seo_context temporarily or permanently?
                        // Interface has 'seo_context'.
                        const richContext = `User Input: ${product.raw_desc}. \nVisual Analysis: ${product.front_analyse} ${product.back_analyse || ''}`;
                        product.raw_desc = richContext; // Enriched context for SEO

                        const lang = product.language_pref || F_Get_Language() || 'en';
                        const result = await F_Generate_SEO_Content(product, lang as any);

                        product.product_title = result.title;
                        product.product_desc = result.description;
                        product.seo_status = 'completed';

                        // Trigger Next: Front Gen
                        if (product.front_status !== 'completed') product.front_status = 'pending';

                        await F_Save_Product(product);
                        console.log(`[Job Manager] SEO Completed -> Triggering Front Gen`);
                        return;
                    }

                    // --- PHASE 4: PRIMARY VIEW SYNTHESIS (Gemini 3 Pro Preview) ---
                    if (product.front_status === 'pending') {
                        // Dependency: SEO (for context)
                        if (product.seo_status !== 'completed') return;

                        // if (product.front_status !== 'updating') {
                        product.front_status = 'updating';
                        product.error_log = "Synthesizing High-Fidelity Front View (Pro)...";
                        await F_Save_Product(product);
                        // }

                        const { F_Generate_Pro_Image } = await import('../../services/gemini_service');

                        // Construct Pro Prompt
                        // "A detailed synthesis instruction using gender, model_age..."
                        const prompt = `Hyper-realistic fashion photography. Full body shot. 
                        Subject: ${product.age} year old ${product.gender ? 'Female' : 'Male'} model. 
                        Body Type: ${product.vücut_tipi}. Fit: ${product.kesim}.
                        Wearing: ${product.product_title}. 
                        Details: ${product.front_analyse}. 
                        Environment: ${product.background}. 
                        Lighting: Professional Studio. 8k resolution.`;

                        // Stage 4: Front Image Synthesis (Flash 2.5)
                        let generated_image = await F_Generate_Pro_Image(prompt, product.raw_front);

                        if (!generated_image) throw new Error("Pro Generation failed (Empty)");

                        product.model_front = generated_image;
                        product.front_status = 'completed';

                        // Trigger Next: Back Gen
                        if (product.back_status !== 'completed') product.back_status = 'pending';

                        await F_Save_Product(product);
                        console.log(`[Job Manager] Front Gen Completed -> Triggering Back Gen`);
                        return;
                    }

                    // --- PHASE 5: CONSISTENT BACK VIEW SYNTHESIS ---
                    if (product.back_status === 'pending') {
                        if (!product.raw_back) {
                            // Skip if no back image provided
                            product.back_status = 'completed';
                            await F_Save_Product(product);
                            return;
                        }

                        // if (product.back_status !== 'updating') {
                        product.back_status = 'updating';
                        product.error_log = "Synthesizing Consistent Back View...";
                        await F_Save_Product(product);
                        // }

                        const { F_Generate_Pro_Image } = await import('../../services/gemini_service');

                        const prompt = `Back view of the same model. 
                        Consistency: Match the front view model exactly.
                        Wearing: ${product.product_title} (Back Side).
                        Details: ${product.back_analyse}.
                        Environment: Match front view.`;

                        // Stage 5: Consistent Back View (Flash 2.5)
                        const back_gen = await F_Generate_Pro_Image(prompt, product.raw_back, product.model_front);

                        product.model_back = back_gen;
                        product.back_status = 'completed';

                        // FINALIZATION (Stage 5 finishes the job)
                        console.log(`[Job Manager] Pipeline Finished for ${product.product_id}`);
                        product.status = 'finished';
                        product.video_status = 'completed'; // Skipped
                        product.error_log = undefined;
                        await F_Save_Product(product);
                        return;
                    }

                    // Legacy Video Block Removed/Skipped


                } catch (error: any) {
                    console.error(`[Job Manager] Chain Failed:`, error);
                    // Circuit Breaker Logic
                    if (error.message?.includes("CIRCUIT_BREAKER")) {
                        product.status = 'exited';
                    } else {
                        // For now, exit on any error to prevent loops in this strict pipeline
                        product.status = 'exited';
                    }
                    product.error_log = `Pipeline Error: ${error.message}`;

                    // Fail current step
                    if (product.analysis_status === 'updating') product.analysis_status = 'failed';
                    if (product.seo_status === 'updating') product.seo_status = 'failed';
                    if (product.front_status === 'updating') product.front_status = 'failed';
                    if (product.back_status === 'updating') product.back_status = 'failed';

                    await F_Save_Product(product);
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
