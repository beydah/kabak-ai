import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, Copy, Trash2 } from 'lucide-react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Card } from '../../components/organisms/product_card';
import { F_Analytics_Dashboard } from '../../components/organisms/analytics_dashboard';
import { F_Get_All_Products, I_Product_Data, F_Update_Product_Status, F_Get_Product_By_Id, F_Delete_Product_By_Id } from '../../utils/storage_utils';
import { F_Generate_SEO_Content } from '../../services/gemini_service';
import { useJobManager } from '../../components/providers/job_manager';
import { F_Get_Preference } from '../../utils/storage_utils';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();
    const [products, set_products] = useState<I_Product_Data[]>([]);

    // Force re-render on polling or status updates
    // In a real app with Context/Redux, 'products' would come from the store directly.
    // For now, we listen to local storage changes or rely on the polling interval in JobManager to trigger updates if we shared state.
    // BUT check this: JobManager is a Provider but doesn't expose 'products'.
    // We should expose a "refresh_products" or just poll here too for UI updates?
    // BETTER: Use a custom hook or event listener for 'kabak_ai_products' changes.

    const F_Refresh_Products = async () => {
        const data = await F_Get_All_Products();
        set_products(data);
    };

    useEffect(() => {
        F_Refresh_Products();

        // Simple polling for UI updates (every 2s) to show status changes live
        // Also handling generation loop here since we don't have a dedicated background worker
        const interval = setInterval(async () => {
            // refresh UI
            await F_Refresh_Products();

            // Queue Processor (Mini Job)
            const current = await F_Get_All_Products();
            const running = current.filter(p => p.status === 'running');

            for (const p of running) {
                // Double check status
                const fresh = await F_Get_Product_By_Id(p.id);
                if (fresh && fresh.status === 'running') {
                    try {
                        const lang = (F_Get_Preference('lang') as 'tr' | 'en') || 'en';
                        const result = await F_Generate_SEO_Content(fresh, lang);
                        // Result is direct object now { title, description, tags }, not { success, data } based on gemini_service return type
                        if (result && result.title) {
                            await F_Update_Product_Status(p.id, 'finished', undefined, result.title, result.description);
                        } else {
                            await F_Update_Product_Status(p.id, 'exited', "Generation Failed");
                        }
                    } catch (e: any) {
                        await F_Update_Product_Status(p.id, 'exited', e.message || "Unexpected Error");
                    }
                }
            }

        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // ... (rest of the component up to card mapping)

    const F_Handle_Bulk_Download = (e: React.MouseEvent, p_product: I_Product_Data) => {
        e.stopPropagation();
        if (p_product.front_image) {
            const link = document.createElement('a');
            link.href = p_product.front_image;
            link.download = `front_${p_product.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        if (p_product.back_image) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = p_product.back_image;
                link.download = `back_${p_product.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100);
        }
    };

    const { error_logs, clear_logs, remove_log } = useJobManager();
    const [show_notifications, set_show_notifications] = useState(false);

    const F_Copy_To_Clipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="space-y-6 relative">
                <div className="flex items-center justify-between">
                    <F_Text p_variant="h1">
                        {F_Get_Text('collection.title')}
                    </F_Text>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => set_show_notifications(!show_notifications)}
                                className="p-2 hover:bg-secondary/10 rounded-full transition-colors relative"
                            >
                                <Bell size={24} className={error_logs.length > 0 ? "text-primary" : "text-secondary"} />
                                {error_logs.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-bg-dark" />
                                )}
                            </button>

                            {/* Notification Popover */}
                            {show_notifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-bg-dark border border-secondary/20 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-secondary/20 flex items-center justify-between bg-secondary/5">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        {error_logs.length > 0 && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => F_Copy_To_Clipboard(JSON.stringify(error_logs, null, 2))}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Copy All
                                                </button>
                                                <button
                                                    onClick={clear_logs}
                                                    className="text-xs text-red-500 hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {error_logs.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-secondary">
                                                No new notifications.
                                            </div>
                                        ) : (
                                            error_logs.map(log => (
                                                <div key={log.id} className="p-3 border-b border-secondary/10 hover:bg-secondary/5 transition-colors flex gap-3 text-left">
                                                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-text-light dark:text-text-dark truncate">
                                                            Processing Failed
                                                        </p>
                                                        <p className="text-xs text-secondary mt-0.5 line-clamp-2 break-all">
                                                            {log.message}
                                                        </p>
                                                        <p className="text-[10px] text-secondary/60 mt-1">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <button
                                                            onClick={() => F_Copy_To_Clipboard(log.message)}
                                                            className="p-1 hover:bg-secondary/10 rounded text-secondary hover:text-primary"
                                                            title="Copy"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => remove_log(log.id)}
                                                            className="p-1 hover:bg-secondary/10 rounded text-secondary hover:text-red-500"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Click away listener could be added here or ideally a hook */}
                        {show_notifications && (
                            <div className="fixed inset-0 z-40" onClick={() => set_show_notifications(false)} />
                        )}

                        <F_Button
                            p_label={F_Get_Text('collection.create_new')}
                            p_on_click={() => navigate('/new-product')}
                        />
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {products.map((product) => (
                            <F_Product_Card
                                key={product.id}
                                p_product={product}
                                p_navigate={navigate}
                                p_on_download={F_Handle_Bulk_Download}
                                p_on_refresh={F_Refresh_Products}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-lg">
                        <F_Text p_variant="body" p_class_name="text-secondary">
                            {F_Get_Text('collection.empty_state')}
                        </F_Text>
                    </div>
                )}

                {/* Analytics Section */}
                <F_Analytics_Dashboard />

            </div>
        </F_Main_Template>
    );
};


