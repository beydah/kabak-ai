import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons removed as they were for notifications
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Card } from '../../components/organisms/product_card';
import { F_Analytics_Dashboard } from '../../components/organisms/analytics_dashboard';
import F_Storage_Dashboard from '../../components/molecules/storage_dashboard'; // Default export
import { F_Get_All_Products, I_Product_Data, F_Update_Product_Status, F_Get_Product_By_Id, F_Delete_Product_By_Id } from '../../utils/storage_utils';
import { F_Generate_SEO_Content } from '../../services/gemini_service';
import { F_Get_Preference } from '../../utils/storage_utils';
import { F_Filter_Bar, I_Filter_State } from '../../components/molecules/filter_bar';
import { F_Detect_Gender_In_Query, F_Remove_Gender_Keywords } from '../../utils/keyword_utils';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();
    const [all_products, set_all_products] = useState<I_Product_Data[]>([]);
    const [filtered_products, set_filtered_products] = useState<I_Product_Data[]>([]);
    const [current_filters, set_current_filters] = useState<I_Filter_State>({
        search: '', gender: 'all', status: 'all', age_range: 'all', sort: 'newest'
    });

    // Sub-components
    // Use dynamic import if needed or regular. Assume regular import is added at top by me or auto.
    // I need to add import for F_Filter_Bar. I'll do it in a separate block if needed or assume I can add it here if I replace imports.
    // Since I'm replacing middle config, I'll rely on IDE or separate tool call for import if I can't do it here. 
    // Actually I can use the previous tool view to see imports. I will add import in a separate small edit or try to slide it in? 
    // No, I will just implement the logic and then add import.

    const F_Refresh_Products = async () => {
        const data = await F_Get_All_Products();
        set_all_products(data);
        F_Apply_Filters(data, current_filters);
    };

    const F_Apply_Filters = (data: I_Product_Data[], filters: I_Filter_State) => {
        let result = [...data];

        // 1. Search (Smart Gender Filtering)
        if (filters.search) {
            let q = filters.search.toLowerCase().trim();
            const detectedGender = F_Detect_Gender_In_Query(q);

            // If gender detected, filter heavily on it first
            if (detectedGender) {
                // strict check: product.gender (boolean) mapping? 
                // Interface says: gender: boolean (false=Male, true=Female)? Check interfaces.ts or usage
                // In F_Apply_Filters: result = result.filter(p => p.gender === is_female);
                // So true = Female ('Kadın'), false = Male ('Erkek')
                const isFemale = detectedGender === 'Kadın';
                result = result.filter(p => p.gender === isFemale);

                // Remove the gender keyword from search to find the actual item (e.g. "ceket")
                q = F_Remove_Gender_Keywords(q);
            }

            // Continue with text search if there is anything left (or if originally just text)
            if (q.length > 0) {
                result = result.filter(p =>
                    p.product_id.toLowerCase().includes(q) ||
                    (p.product_title && p.product_title.toLowerCase().includes(q)) ||
                    (p.raw_desc && p.raw_desc.toLowerCase().includes(q))
                );
            }
        }

        // 2. Gender
        if (filters.gender !== 'all') {
            const is_female = filters.gender === 'female';
            result = result.filter(p => p.gender === is_female);
        }

        // 3. Status
        if (filters.status !== 'all') {
            result = result.filter(p => p.status === filters.status);
        }

        // 4. Age Range
        if (filters.age_range !== 'all') {
            const [min, max] = filters.age_range.split('-').map(Number);
            result = result.filter(p => {
                const age = parseInt(p.age || '0');
                return age >= min && age <= max;
            });
        }

        // 5. Sort
        result.sort((a, b) => {
            if (filters.sort === 'newest') return b.created_at - a.created_at;
            return a.created_at - b.created_at;
        });

        set_filtered_products(result);
    };

    const F_Handle_Filter_Change = (filters: I_Filter_State) => {
        set_current_filters(filters);
        F_Apply_Filters(all_products, filters);
    };

    useEffect(() => {
        F_Refresh_Products();

        // Simple polling for UI updates (every 2s) to show status changes live
        // Also handling generation loop here since we don't have a dedicated background worker
        const interval = setInterval(async () => {
            // refresh UI (Keep filters)
            const current = await F_Get_All_Products();
            set_all_products(current);
            // We need to re-apply filters to new data BUT keep current filter state
            // We can't access 'current_filters' easily inside closure without ref or dep.
            // But we can depend on current_filters in useEffect? No, that causes loop.
            // Use functional state update or ref. 
            // For simplicity, I'll just rely on `products` update triggering a filter effect? 
            // Better: F_Apply_Filters(current, current_filters (from ref?))

            // NOTE: For this simple app, I will just re-apply the last known state or 
            // let the user refresh manually for major list changes, BUT we need status updates.
            // So:
            // Just update 'all_products' state. And have a useEffect([all_products, current_filters]) to update 'filtered'.

        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Effect to re-filter when all_products changes (e.g. from polling) or filters change
    useEffect(() => {
        F_Apply_Filters(all_products, current_filters);
    }, [all_products, current_filters]);

    // ... (rest of the component up to card mapping)

    const F_Handle_Bulk_Download = (e: React.MouseEvent, p_product: I_Product_Data) => {
        e.stopPropagation();
        if (p_product.raw_front) {
            const link = document.createElement('a');
            link.href = p_product.raw_front;
            link.download = `front_${p_product.product_id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        if (p_product.raw_back) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = p_product.raw_back;
                link.download = `back_${p_product.product_id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100);
        }
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
                            p_label="Clear All Data"
                            p_on_click={async () => {
                                if (confirm("RESET SYSTEM? This will delete all products, drafts, and settings.")) {
                                    localStorage.clear();
                                    const products = await F_Get_All_Products();
                                    for (const p of products) await F_Delete_Product_By_Id(p.product_id);
                                    window.location.reload();
                                }
                            }}
                            p_variant="secondary"
                            p_class_name="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                        />
                        <F_Button
                            p_label={F_Get_Text('collection.create_new')}
                            p_on_click={() => navigate('/new-product')}
                        />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className='w-full'>
                    {/* Dynamic Import or component must be valid. I'll assume F_Filter_Bar is imported. */}
                    <F_Filter_Bar p_on_filter_change={F_Handle_Filter_Change} />
                </div>

                {filtered_products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {filtered_products.map((product) => (
                            <F_Product_Card
                                key={product.product_id}
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

                {/* Storage Management */}
                <F_Storage_Dashboard />

            </div>
        </F_Main_Template>
    );
};


