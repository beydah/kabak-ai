import React, { useState } from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Form_Field } from '../../components/molecules/form_field';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_New_Product_Page: React.FC = () => {
    const [product_name, set_product_name] = useState('');

    const F_Handle_Submit = (p_event: React.FormEvent) => {
        p_event.preventDefault();
        // TODO: Implement product creation
        console.log('Creating product:', product_name);
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-xl mx-auto">
                <F_Text p_variant="h1" p_class_name="mb-6">
                    {F_Get_Text('new_product.title')}
                </F_Text>

                <form onSubmit={F_Handle_Submit} className="space-y-6">
                    <F_Form_Field
                        p_label={F_Get_Text('new_product.product_name')}
                        p_value={product_name}
                        p_on_change={set_product_name}
                    />

                    <div className="p-8 border-2 border-dashed border-secondary rounded-lg text-center">
                        <F_Text p_variant="body" p_class_name="text-secondary">
                            {F_Get_Text('new_product.upload_image')}
                        </F_Text>
                    </div>

                    <F_Button
                        p_label={F_Get_Text('new_product.generate_button')}
                        p_type="submit"
                        p_class_name="w-full"
                    />
                </form>
            </div>
        </F_Main_Template>
    );
};
