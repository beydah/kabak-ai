import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_Product_By_Id, F_Delete_Product_By_Id, I_Product_Data } from '../../utils/storage_utils';
import { F_Edit_Product_Modal } from '../../components/organisms/edit_product_modal';
import { F_Confirmation_Modal } from '../../components/molecules/confirmation_modal';

export const F_Product_Page: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, set_product] = useState<I_Product_Data | undefined>(undefined);
    const [copied_field, set_copied_field] = useState<string | null>(null);

    // State for image switcher
    const [active_image, set_active_image] = useState<'front' | 'back'>('front');

    // Modals
    const [is_edit_modal_open, set_is_edit_modal_open] = useState(false);
    const [is_delete_modal_open, set_is_delete_modal_open] = useState(false);

    useEffect(() => {
        F_Load_Product();
    }, [id]);

    const F_Load_Product = async () => {
        if (id) {
            const data = await F_Get_Product_By_Id(id);
            if (data) {
                set_product(data);
                set_active_image('front');
            }
        }
    };

    const F_Toggle_Image = () => {
        if (product?.back_image) {
            set_active_image(prev => prev === 'front' ? 'back' : 'front');
        }
    };

    const F_Handle_Download = () => {
        if (!product) return;
        if (product.front_image) {
            const link = document.createElement('a');
            link.href = product.front_image;
            link.download = `front_${product.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        if (product.back_image) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = product.back_image;
                link.download = `back_${product.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100);
        }
    };

    const F_Handle_Delete = async () => {
        if (id) {
            await F_Delete_Product_By_Id(id);
            navigate('/collection');
        }
    };

    const F_Copy_To_Clipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        set_copied_field(field);
        setTimeout(() => set_copied_field(null), 2000);
    };

    if (!product) {
        return (
            <F_Main_Template p_is_authenticated={true}>
                <div className="container mx-auto px-4 py-8 text-center">
                    <p className="text-secondary">{F_Get_Text('common.loading')}</p>
                </div>
            </F_Main_Template>
        );
    }

    const current_image_src = active_image === 'front' ? product.front_image : (product.back_image || product.front_image);
    const has_multiple_images = !!product.back_image;

    // Display Data
    const display_title = product.generated_title || F_Get_Text('product.title');
    const display_desc = product.generated_description || product.description || 'No description provided.';

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/collection')}
                    className="text-primary hover:underline font-medium mb-6 flex items-center gap-2"
                >
                    {F_Get_Text('new_product.back_to_collection')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: Images */}
                    <div className="space-y-4">
                        {/* Main Image Container */}
                        <div className="aspect-[3/4] bg-white dark:bg-bg-dark rounded-xl shadow-sm border border-secondary/20 overflow-hidden relative group">
                            <img
                                key={active_image} // Force re-render for animation
                                src={current_image_src}
                                alt="Main View"
                                className="w-full h-full object-cover animate-fade-in"
                            />

                            {/* Navigation Arrows (Only if multiple images) */}
                            {has_multiple_images && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); F_Toggle_Image(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={F_Get_Text('product.prev_image')}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); F_Toggle_Image(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={F_Get_Text('product.next_image')}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Row */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {/* Front Thumb */}
                            <button
                                onClick={() => set_active_image('front')}
                                className={`flex-shrink-0 w-24 h-32 rounded-lg border-2 overflow-hidden transition-all ${active_image === 'front'
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent hover:border-secondary/30'
                                    }`}
                            >
                                <img src={product.front_image} alt="Front Thumbnail" className="w-full h-full object-cover" />
                            </button>

                            {/* Back Thumb */}
                            {product.back_image && (
                                <button
                                    onClick={() => set_active_image('back')}
                                    className={`flex-shrink-0 w-24 h-32 rounded-lg border-2 overflow-hidden transition-all ${active_image === 'back'
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent hover:border-secondary/30'
                                        }`}
                                >
                                    <img src={product.back_image} alt="Back Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Actions */}
                    <div className="space-y-8">

                        {/* Title Section */}
                        <div className="border-b border-secondary/10 pb-6">
                            <div className="flex items-start justify-between gap-4">
                                <F_Text p_variant="h1" p_class_name="mb-2 leading-tight">
                                    {display_title}
                                </F_Text>
                                <button
                                    onClick={() => F_Copy_To_Clipboard(display_title, 'title')}
                                    className="p-2 text-secondary hover:text-primary transition-colors flex-shrink-0"
                                    title="Copy Title"
                                >
                                    {copied_field === 'title' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                </button>
                            </div>
                            <p className="text-secondary text-sm mt-1">ID: {product.id}</p>
                        </div>

                        {/* Description Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                                    {F_Get_Text('new_product.labels.description')}
                                </h3>
                                <button
                                    onClick={() => F_Copy_To_Clipboard(display_desc, 'desc')}
                                    className="p-1.5 text-secondary hover:text-primary transition-colors text-sm flex items-center gap-1.5"
                                    title="Copy Description"
                                >
                                    {copied_field === 'desc' ? (
                                        <>
                                            <Check size={16} className="text-green-500" />
                                            <span className="text-green-500 font-medium">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-secondary leading-relaxed whitespace-pre-line p-4 bg-secondary/5 rounded-lg border border-secondary/10 text-sm">
                                {display_desc}
                            </p>
                        </div>

                        {/* Attributes Grid */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.gender')}</dt>
                                <dd className="font-medium capitalize text-text-light dark:text-text-dark">
                                    {product.gender ? F_Get_Text(`new_product.options.gender.${product.gender}`) : product.gender}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.age')}</dt>
                                <dd className="font-medium text-text-light dark:text-text-dark">{product.age}</dd>
                            </div>
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.body_type')}</dt>
                                <dd className="font-medium capitalize text-text-light dark:text-text-dark">
                                    {product.body_type ? F_Get_Text(`new_product.options.body_type.${product.body_type}`) : product.body_type}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.fit')}</dt>
                                <dd className="font-medium capitalize text-text-light dark:text-text-dark">
                                    {product.fit ? F_Get_Text(`new_product.options.fit.${product.fit}`) : product.fit}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.background')}</dt>
                                <dd className="font-medium capitalize text-text-light dark:text-text-dark">
                                    {product.background ? F_Get_Text(`new_product.options.background.${product.background}`) : product.background}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-secondary text-sm">{F_Get_Text('new_product.labels.accessory')}</dt>
                                <dd className="font-medium capitalize text-text-light dark:text-text-dark">
                                    {product.accessory ? F_Get_Text(`new_product.options.accessory.${product.accessory}`) : product.accessory}
                                </dd>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 border-t border-secondary/10">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => set_is_edit_modal_open(true)}
                                    className="p-3 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-primary transition-colors tooltip-trigger"
                                    title={F_Get_Text('product.edit')}
                                >
                                    <Edit2 size={24} />
                                </button>
                                <button
                                    onClick={() => set_is_delete_modal_open(true)}
                                    className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors tooltip-trigger"
                                    title={F_Get_Text('product.delete')}
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>

                            <F_Button
                                p_label={F_Get_Text('product.download')}
                                p_variant="primary"
                                p_class_name="flex-1 py-3 flex items-center justify-center gap-2"
                                p_on_click={F_Handle_Download}
                            />
                        </div>
                    </div>
                </div>

                {/* MODALS */}
                <F_Edit_Product_Modal
                    p_is_open={is_edit_modal_open}
                    p_on_close={() => set_is_edit_modal_open(false)}
                    p_product={product}
                    p_on_update={F_Load_Product}
                />

                <F_Confirmation_Modal
                    p_is_open={is_delete_modal_open}
                    p_on_close={() => set_is_delete_modal_open(false)}
                    p_on_confirm={F_Handle_Delete}
                    p_title={F_Get_Text('product.confirm_delete_title')}
                    p_message={F_Get_Text('product.confirm_delete_message')}
                    p_confirm_label={F_Get_Text('product.delete_confirm_button')}
                    p_cancel_label={F_Get_Text('product.cancel')}
                />

            </div>
        </F_Main_Template>
    );
};
