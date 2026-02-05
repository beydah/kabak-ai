import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons removed as they were for notifications
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Card } from '../../components/organisms/product_card';
import { F_Analytics_Dashboard } from '../../components/organisms/analytics_dashboard';
import { F_Get_All_Products, I_Product_Data, F_Update_Product_Status, F_Get_Product_By_Id, F_Delete_Product_By_Id } from '../../utils/storage_utils';
import { F_Generate_SEO_Content } from '../../services/gemini_service';
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


