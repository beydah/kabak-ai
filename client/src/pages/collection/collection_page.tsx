import React, { useEffect, useState } from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { useNavigate } from 'react-router-dom';
import { F_Get_All_Products, I_Product_Data } from '../../utils/storage_utils';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();
    const [products, set_products] = useState<I_Product_Data[]>([]);

    useEffect(() => {
        // Load items from local storage
        set_products(F_Get_All_Products());
    }, []);

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <F_Text p_variant="h1">
                        {F_Get_Text('collection.title')}
                    </F_Text>
                    <F_Button
                        p_label={F_Get_Text('collection.create_new')}
                        p_on_click={() => navigate('/new-product')}
                    />
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="bg-white dark:bg-bg-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-secondary/20 group"
                            >
                                <div className="aspect-[3/4] bg-secondary/10 relative overflow-hidden">
                                    <img
                                        src={product.front_image}
                                        alt="Front"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-4">
                                    <p className="font-medium text-text-light dark:text-text-dark truncate">
                                        ID: {product.id.substring(0, 8)}...
                                    </p>
                                    <p className="text-sm text-secondary truncate mt-1">
                                        {product.description || 'No description'}
                                    </p>
                                    <p className="text-xs text-secondary/60 mt-2">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-lg">
                        <F_Text p_variant="body" p_class_name="text-secondary">
                            {F_Get_Text('collection.empty_state')}
                        </F_Text>
                    </div>
                )}
            </div>
        </F_Main_Template>
    );
};
