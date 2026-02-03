import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Download } from 'lucide-react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_Product_By_Id, I_Product_Data } from '../../utils/storage_utils';

export const F_Product_Page: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, set_product] = useState<I_Product_Data | undefined>(undefined);

    useEffect(() => {
        if (id) {
            const data = F_Get_Product_By_Id(id);
            if (data) {
                set_product(data);
            } else {
                // Handle not found
            }
        }
    }, [id]);

    const F_Handle_Download = () => {
        if (!product) return;
        // Create links for both images and click them
        if (product.front_image) {
            const link = document.createElement('a');
            link.href = product.front_image;
            link.download = `front_${product.id}.png`; // Assuming png for simplicity of base64 commonality
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        if (product.back_image) {
            setTimeout(() => { // Small delay to ensure both trigger
                const link = document.createElement('a');
                link.href = product.back_image;
                link.download = `back_${product.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100);
        }
    };

    const F_Handle_Delete = () => {
        if (confirm("Are you sure you want to delete this product?")) {
            // Delete logic (Simple remove from LS for now)
            const all = JSON.parse(localStorage.getItem('kabak_ai_products') || '[]');
            const filtered = all.filter((p: any) => p.id !== id);
            localStorage.setItem('kabak_ai_products', JSON.stringify(filtered));
            navigate('/collection');
        }
    };

    if (!product) {
        return (
            <F_Main_Template p_is_authenticated={true}>
                <div className="container mx-auto px-4 py-8 text-center">
                    <p className="text-secondary">Loading...</p>
                </div>
            </F_Main_Template>
        );
    }

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="container mx-auto px-4 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <F_Text p_variant="h1">
                            {F_Get_Text('product.title')}
                        </F_Text>
                        <p className="text-secondary text-sm mt-1">ID: {product.id}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={F_Handle_Download}
                            className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title={F_Get_Text('product.download')}
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={() => navigate(`/edit-product/${product.id}`)}
                            className="p-3 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-primary transition-colors"
                            title={F_Get_Text('product.edit')}
                        >
                            <Edit2 size={20} />
                        </button>
                        <button
                            onClick={F_Handle_Delete}
                            className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title={F_Get_Text('product.delete')}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Images Section (Side-by-Side Cards) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Image */}
                        <div className="bg-white dark:bg-bg-dark rounded-xl shadow-sm border border-secondary/20 overflow-hidden">
                            <div className="p-4 border-b border-secondary/10">
                                <h3 className="font-medium text-text-light dark:text-text-dark">Front View</h3>
                            </div>
                            <div className="aspect-[3/4] bg-secondary/5 relative">
                                <img
                                    src={product.front_image}
                                    alt="Front"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Back Image */}
                        <div className="bg-white dark:bg-bg-dark rounded-xl shadow-sm border border-secondary/20 overflow-hidden">
                            <div className="p-4 border-b border-secondary/10">
                                <h3 className="font-medium text-text-light dark:text-text-dark">Back View</h3>
                            </div>
                            <div className="aspect-[3/4] bg-secondary/5 relative">
                                {product.back_image ? (
                                    <img
                                        src={product.back_image}
                                        alt="Back"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-secondary/40">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-bg-dark rounded-xl shadow-sm border border-secondary/20 p-6">
                            <F_Text p_variant="h3" p_class_name="mb-6 border-b border-secondary/10 pb-4">
                                Product Details
                            </F_Text>

                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-secondary text-sm">Description</dt>
                                    <dd className="text-text-light dark:text-text-dark mt-1">
                                        {product.description || 'No description provided.'}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-secondary text-sm">Gender</dt>
                                        <dd className="font-medium capitalize text-text-light dark:text-text-dark">{product.gender}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-secondary text-sm">Age</dt>
                                        <dd className="font-medium text-text-light dark:text-text-dark">{product.age}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-secondary text-sm">Body Type</dt>
                                        <dd className="font-medium capitalize text-text-light dark:text-text-dark">{product.body_type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-secondary text-sm">Fit</dt>
                                        <dd className="font-medium capitalize text-text-light dark:text-text-dark">{product.fit}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-secondary text-sm">Background</dt>
                                        <dd className="font-medium capitalize text-text-light dark:text-text-dark">{product.background}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-secondary text-sm">Accessory</dt>
                                        <dd className="font-medium capitalize text-text-light dark:text-text-dark">{product.accessory}</dd>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </F_Main_Template>
    );
};
