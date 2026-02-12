import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Form } from '../../components/organisms/product_form';
import { F_Save_Product, I_Product_Data, F_Save_Draft, F_Get_Draft, F_Clear_Draft, F_Remove_Draft_Image } from '../../utils/storage_utils';
import { F_File_To_Base64 } from '../../utils/file_utils';
import { F_Save_Product_Preferences, F_Get_Product_Preferences } from '../../utils/cookie_utils';

export const F_New_Product_Page: React.FC = () => {
    const navigate = useNavigate();
    const [initial_data, set_initial_data] = React.useState<Partial<I_Product_Data> | undefined>(undefined);
    const [is_loading, set_is_loading] = React.useState(true);

    // Initial Data Logic (Draft vs Cookies vs Empty) - ASYNC
    useEffect(() => {
        const load = async () => {
            try {
                const draft = await F_Get_Draft();
                if (draft) {
                    set_initial_data(draft);
                } else {
                    const cookies = F_Get_Product_Preferences();
                    set_initial_data(cookies);
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            } finally {
                set_is_loading(false);
            }
        };
        load();
    }, []);

    const F_Handle_Submit = async (p_data: Partial<I_Product_Data>, p_front_file: File | null, p_back_file: File | null) => {
        if (!p_front_file && !p_data.raw_front) {
            alert("Please upload a front photo.");
            return;
        }

        try {
            const front_b64 = p_front_file ? await F_File_To_Base64(p_front_file) : (p_data.raw_front || '');
            const back_b64 = p_back_file ? await F_File_To_Base64(p_back_file) : (p_data.raw_back || '');

            // SMART DEFAULTS & LOGIC
            const cookies = F_Get_Product_Preferences();

            // Gender Logic: Prefer Form Data -> Cookie -> Default (Female/True)
            let final_gender = true; // Default

            if (p_data.gender !== undefined) {
                final_gender = p_data.gender;
            } else if (cookies.gender !== undefined) {
                // Cookies store as string "true"/"false"
                final_gender = String(cookies.gender) === 'true';
            }

            // Ensure all required fields for I_Product_Data are present
            const new_product: I_Product_Data = {
                product_id: uuidv4(),
                created_at: Date.now(),
                update_at: Date.now(),
                raw_front: front_b64,
                raw_back: back_b64,

                // Strict Gender
                gender: final_gender,

                // Smart Fallbacks
                age: p_data.age || cookies.age || '30',
                vücut_tipi: p_data.vücut_tipi || cookies.body_type || 'average',
                kesim: p_data.kesim || cookies.fit || 'regular',
                background: p_data.background || cookies.background || 'orange',
                aksesuar: p_data.aksesuar || cookies.accessory || 'none',

                raw_desc: p_data.raw_desc || '',
                status: 'running',
                retry_count: 0
            };

            // VALIDATION: Ensure Data Integrity
            if (!new_product.product_id) throw new Error("ID Generation Failed");
            if (new_product.gender === undefined) new_product.gender = true;

            // 1. Save Product
            await F_Save_Product(new_product);

            // 2. Save Preferences (Cookies)
            F_Save_Product_Preferences(p_data);

            // 3. Clear Draft (Async)
            await F_Clear_Draft();
            await F_Remove_Draft_Image('kabak_draft_img_front');
            await F_Remove_Draft_Image('kabak_draft_img_back');

            navigate('/collection');

        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to create product. Please try again.");
        }
    };

    const F_Handle_Draft_Update = async (data: Partial<I_Product_Data>) => {
        // Fire and forget or simple catch
        try {
            await F_Save_Draft(data);
        } catch (e) {
            console.error("Failed to save draft", e);
        }
    };

    if (is_loading) {
        return (
            <F_Main_Template p_is_authenticated={true}>
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner text-primary"></span>
                </div>
            </F_Main_Template>
        );
    }

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-2xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/collection')}
                    className="text-primary hover:underline font-medium mb-6 flex items-center gap-2"
                >
                    {F_Get_Text('new_product.back_to_collection')}
                </button>

                {/* Title */}
                <F_Text p_variant="h1" p_class_name="mb-8 text-center text-text-light dark:text-text-dark">
                    {F_Get_Text('new_product.title')}
                </F_Text>

                {/* Form Card */}
                <div className="bg-white dark:bg-bg-dark rounded-xl shadow-lg border border-secondary/20 p-6 md:p-8">
                    <F_Product_Form
                        p_initial_data={initial_data as I_Product_Data}
                        p_on_submit={F_Handle_Submit}
                        p_on_cancel={() => navigate('/collection')}
                        p_on_change={F_Handle_Draft_Update}
                    />
                </div>
            </div>
        </F_Main_Template>
    );
};
