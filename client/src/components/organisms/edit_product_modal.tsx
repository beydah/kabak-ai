import React from 'react';
import { F_Modal } from '../molecules/modal';
import { F_Product_Form } from './product_form';
import { F_Get_Text } from '../../utils/i18n_utils';
import { I_Product_Data } from '../../utils/storage_utils';
import { F_File_To_Base64 } from '../../utils/file_utils';

interface Edit_Product_Modal_Props {
    p_is_open: boolean;
    p_on_close: () => void;
    p_product: I_Product_Data;
    p_on_update: () => void; // Callback to refresh parent data
}

export const F_Edit_Product_Modal: React.FC<Edit_Product_Modal_Props> = ({
    p_is_open,
    p_on_close,
    p_product,
    p_on_update
}) => {

    const F_Handle_Submit = async (p_data: Partial<I_Product_Data>, p_front_file: File | null, p_back_file: File | null) => {
        try {
            // Keep existing images if no new file is uploaded
            let front_b64 = p_product.front_image;
            if (p_front_file) {
                front_b64 = await F_File_To_Base64(p_front_file);
            }

            let back_b64 = p_product.back_image;
            if (p_back_file) {
                back_b64 = await F_File_To_Base64(p_back_file);
            }

            const updated_product: I_Product_Data = {
                ...p_product,
                ...p_data,
                front_image: front_b64,
                back_image: back_b64
            };

            // Update in local storage
            // Manual update logic since F_Save_Product only adds new ones in our mock
            const all = JSON.parse(localStorage.getItem('kabak_ai_products') || '[]');
            const filtered = all.filter((p: any) => p.id !== p_product.id);
            filtered.unshift(updated_product); // Add updated to top, or keep index? Unshift implies recent.
            localStorage.setItem('kabak_ai_products', JSON.stringify(filtered));

            p_on_update();
            p_on_close();
            // alert(F_Get_Text('product.update_success'));

        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product.");
        }
    };

    return (
        <F_Modal
            p_is_open={p_is_open}
            p_on_close={p_on_close}
            p_title={F_Get_Text('product.edit_modal_title')}
        >
            <F_Product_Form
                p_initial_data={p_product}
                p_on_submit={F_Handle_Submit}
                p_on_cancel={p_on_close}
                p_is_edit_mode={true}
                p_submit_label={F_Get_Text('product.save_changes')}
            />
        </F_Modal>
    );
};
