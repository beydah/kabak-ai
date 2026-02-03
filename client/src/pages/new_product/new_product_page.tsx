import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Product_Form } from '../../components/organisms/product_form';
import { F_Save_Product, I_Product_Data } from '../../utils/storage_utils';
import { F_File_To_Base64 } from '../../utils/file_utils';

export const F_New_Product_Page: React.FC = () => {
    const navigate = useNavigate();

    const F_Handle_Submit = async (p_data: Partial<I_Product_Data>, p_front_file: File | null, p_back_file: File | null) => {
        if (!p_front_file) {
            alert("Please upload a front photo.");
            return;
        }

        try {
            const front_b64 = await F_File_To_Base64(p_front_file);
            const back_b64 = p_back_file ? await F_File_To_Base64(p_back_file) : '';

            // Ensure all required fields for I_Product_Data are present
            // We cast to any or check fields if stricter validation needed
            const new_product: I_Product_Data = {
                id: uuidv4(),
                created_at: Date.now(),
                front_image: front_b64,
                back_image: back_b64,
                gender: p_data.gender || 'female',
                body_type: p_data.body_type || 'average',
                fit: p_data.fit || 'regular',
                background: p_data.background || 'orange',
                accessory: p_data.accessory || 'glasses',
                age: p_data.age || 30,
                description: p_data.description || ''
            };

            F_Save_Product(new_product);
            navigate('/collection');

        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to create product. Please try again.");
        }
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-4xl mx-auto">
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
                        p_on_submit={F_Handle_Submit}
                        p_on_cancel={() => navigate('/collection')}
                    />
                </div>
            </div>
        </F_Main_Template>
    );
};
