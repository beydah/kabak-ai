import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_Product_Page: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // In a real app, use id to fetch data
    const navigate = useNavigate();

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <F_Text p_variant="h1">
                        {F_Get_Text('product.title')} {id ? `(${id})` : ''}
                    </F_Text>
                    <div className="flex gap-2">
                        <F_Button
                            p_label={F_Get_Text('product.edit')}
                            p_variant="secondary"
                            p_on_click={() => { }}
                        />
                        <F_Button
                            p_label={F_Get_Text('product.delete')}
                            p_variant="secondary"
                            p_class_name="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            p_on_click={() => navigate('/collection')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mock Product Image */}
                    <div className="aspect-[3/4] bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20">
                        <p className="text-secondary">Product Image {id}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white dark:bg-bg-dark rounded-xl border border-secondary/20">
                            <F_Text p_variant="h3" p_class_name="mb-4">Details</F_Text>
                            <div className="space-y-2">
                                <p className="text-secondary">AI Model: Gemini 3 Pro</p>
                                <p className="text-secondary">Status: Completed</p>
                                <p className="text-secondary">Created: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <F_Button
                            p_label={F_Get_Text('product.download')}
                            p_variant="primary"
                            p_class_name="w-full"
                            p_on_click={() => { }}
                        />
                    </div>
                </div>
            </div>
        </F_Main_Template>
    );
};
