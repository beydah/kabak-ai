import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Form } from '../../components/organisms/product_form';
import { F_Save_Product, I_Product_Data, F_Save_Draft, F_Get_Draft, F_Clear_Draft } from '../../utils/storage_utils';
import { F_File_To_Base64 } from '../../utils/file_utils';
import { F_Save_Product_Preferences, F_Get_Product_Preferences } from '../../utils/cookie_utils';

export const F_New_Product_Page: React.FC = () => {
    const navigate = useNavigate();

    // Initial Data Logic (Draft vs Cookies vs Empty)
    const F_Get_Initial_Data = (): Partial<I_Product_Data> => {
        const draft = F_Get_Draft();
        if (draft) return draft;

        const cookies = F_Get_Product_Preferences();
        return cookies; // Will populate gender, bg etc.
    };

    const initial_data = F_Get_Initial_Data();

    // Auto-Save Draft happens inside ProductForm? 
    // Ideally ProductForm should accept an onChange to bubble up changes, or we handle it here.
    // Since ProductForm handles state internally, we need to inject a mechanism.
    // For now, simpler: we modify ProductForm to accept `p_on_change` and we save draft there.
    // OR: ProductForm can handle draft internal logic if we pass `p_enable_draft`.
    // Let's modify ProductForm usage. We need to catch updates.

    // Actually, ProductForm props don't have on_change.
    // We will update ProductForm to emit changes or handle draft internally?
    // Let's pass `p_on_draft_update` to ProductForm.

    const F_Handle_Submit = async (p_data: Partial<I_Product_Data>, p_front_file: File | null, p_back_file: File | null) => {
        if (!p_front_file && !p_data.raw_front) {
            alert("Please upload a front photo."); // Should be handled by form validation now
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
                // p_data uses Interface Keys (Turkish/Mixed), Cookies use English aliases
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
            if (new_product.gender === undefined) new_product.gender = true; // Final safety net

            // PAYLOAD DEBUG (User Request)
            console.log("--------------- SUBMISSION PAYLOAD ---------------");
            console.table({
                id: new_product.product_id,
                gender_bool: new_product.gender,
                gender_text: new_product.gender !== false ? 'FEMALE' : 'MALE',
                age: new_product.age,
                body: new_product.vücut_tipi,
                fit: new_product.kesim,
                desc: new_product.raw_desc
            });
            console.log("--------------------------------------------------");

            // 1. Save Product
            await F_Save_Product(new_product);

            // 2. Save Preferences (Cookies)
            F_Save_Product_Preferences(p_data);

            // 3. Clear Draft
            F_Clear_Draft();

            navigate('/collection');

        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to create product. Please try again.");
        }
    };

    const F_Handle_Draft_Update = (data: Partial<I_Product_Data>) => {
        F_Save_Draft(data);
    };

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
                        p_initial_data={initial_data as I_Product_Data} // Cast to satisfy prop requirement if Partial is not enough, but we changed prop type to Partial.
                        p_on_submit={F_Handle_Submit}
                        p_on_cancel={() => navigate('/collection')}
                        p_on_change={F_Handle_Draft_Update}
                    />
                </div>
            </div>
        </F_Main_Template>
    );
};
