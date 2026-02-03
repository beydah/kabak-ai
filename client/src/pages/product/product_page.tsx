import React from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_Product_Page: React.FC = () => {
    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-4xl mx-auto">
                <F_Text p_variant="h1" p_class_name="mb-6">
                    {F_Get_Text('product.title')}
                </F_Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-secondary/20 rounded-lg flex items-center justify-center">
                        <F_Text p_variant="caption">Product Image</F_Text>
                    </div>

                    {/* Product Actions */}
                    <div className="space-y-4">
                        <F_Button
                            p_label={F_Get_Text('product.download')}
                            p_variant="primary"
                            p_class_name="w-full"
                        />
                        <F_Button
                            p_label={F_Get_Text('product.edit')}
                            p_variant="secondary"
                            p_class_name="w-full"
                        />
                        <F_Button
                            p_label={F_Get_Text('product.delete')}
                            p_variant="ghost"
                            p_class_name="w-full"
                        />
                    </div>
                </div>
            </div>
        </F_Main_Template>
    );
};
