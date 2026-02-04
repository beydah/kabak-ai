import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    I_Product_Data,
    F_Get_All_Products,
    F_Update_Product_Status,
    F_Add_Error_Log,
    I_Error_Log,
    F_Get_Error_Logs,
    F_Clear_Error_Logs,
    F_Remove_Error_Log
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
                try {
                    console.log(`[Job Manager] Processing: ${product.id}`);

                    // Call Gemini API
                    const lang = F_Get_Language(); // Use current app language context? Or store lang in product? 
                    // ideally store lang in product to be robust, but for now app lang.

                    const result = await F_Generate_SEO_Content(product, lang as 'tr' | 'en');

                    // Success
                    F_Update_Product_Status(
                        product.id,
                        'finished',
                        undefined,
                        result.title,
                        result.description
                    );

                } catch (error: any) {
                    console.error(`[Job Manager] Job Failed:`, error);

                    // Fail
                    const err_msg = error.message || "Unknown Gemini Error";
                    F_Update_Product_Status(product.id, 'exited', err_msg);

                    // Log
                    F_Add_Error_Log({
                        product_id: product.id,
                        message: `Processing Failed: ${err_msg}`
                    });
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
