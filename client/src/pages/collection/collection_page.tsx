import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_All_Products, I_Product_Data } from '../../utils/storage_utils';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();
    const [products, set_products] = useState<I_Product_Data[]>([]);

    useEffect(() => {
        set_products(F_Get_All_Products());
    }, []);

    // Helper to download both images
    const F_Handle_Bulk_Download = (e: React.MouseEvent, p_product: I_Product_Data) => {
        e.stopPropagation(); // Prevent card click

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
                            <F_Product_Card
                                key={product.id}
                                p_product={product}
                                p_navigate={navigate}
                                p_on_download={F_Handle_Bulk_Download}
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
            </div>
        </F_Main_Template>
    );
};

// Sub-component for individual card logic (Navigation state)
interface Product_Card_Props {
    p_product: I_Product_Data;
    p_navigate: (path: string) => void;
    p_on_download: (e: React.MouseEvent, product: I_Product_Data) => void;
}

const F_Product_Card: React.FC<Product_Card_Props> = ({ p_product, p_navigate, p_on_download }) => {
    const [current_view, set_current_view] = useState<'front' | 'back'>('front');

    const has_back_image = !!p_product.back_image;

    const F_Toggle_View = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (has_back_image) {
            set_current_view(prev => prev === 'front' ? 'back' : 'front');
        }
    };

    const display_image = current_view === 'front' ? p_product.front_image : p_product.back_image;

    return (
        <div
            onClick={() => p_navigate(`/product/${p_product.id}`)}
            className="bg-white dark:bg-bg-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-secondary/20 group relative"
        >
            {/* Image Container */}
            <div className="aspect-[3/4] bg-secondary/10 relative overflow-hidden">
                <img
                    src={display_image}
                    alt={current_view}
                    className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Bulk Download Button (Top Right) */}
                <button
                    onClick={(e) => p_on_download(e, p_product)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Download All Photos"
                >
                    <Download size={14} />
                </button>

                {/* Navigation Arrows (Only if back image exists) */}
                {has_back_image && (
                    <>
                        <button
                            onClick={F_Toggle_View}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={F_Toggle_View}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={16} />
                        </button>

                        {/* Indicator Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className={`w-1.5 h-1.5 rounded-full ${current_view === 'front' ? 'bg-white' : 'bg-white/50'}`} />
                            <div className={`w-1.5 h-1.5 rounded-full ${current_view === 'back' ? 'bg-white' : 'bg-white/50'}`} />
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="font-medium text-text-light dark:text-text-dark truncate">
                    ID: {p_product.id.substring(0, 8)}...
                </p>
                <p className="text-sm text-secondary truncate mt-1">
                    {p_product.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-secondary/60">
                        {new Date(p_product.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};
