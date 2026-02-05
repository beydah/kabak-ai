import React, { useState } from 'react';
import { RotateCcw, Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { I_Product_Data, F_Update_Product_Status, F_Delete_Product_By_Id } from '../../utils/storage_utils';
import { useJobManager } from '../../components/providers/job_manager';
import { F_Get_Text } from '../../utils/i18n_utils';

export interface Product_Card_Props {
    p_product: I_Product_Data;
    p_navigate: (path: string) => void;
    p_on_download: (e: React.MouseEvent, product: I_Product_Data) => void;
    p_on_refresh: () => void;
}

export const F_Product_Card: React.FC<Product_Card_Props> = ({ p_product, p_navigate, p_on_download, p_on_refresh }) => {
    const [current_view, set_current_view] = useState<'front' | 'back'>('front');
    const [show_delete_confirm, set_show_delete_confirm] = useState(false);
    const { remove_log } = useJobManager();

    const has_back_image = !!p_product.back_image;
    const is_running = p_product.status === 'running';
    const is_exited = p_product.status === 'exited';

    const F_Toggle_View = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (has_back_image) {
            set_current_view(prev => prev === 'front' ? 'back' : 'front');
        }
    };

    const F_Handle_Retry = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await F_Update_Product_Status(p_product.id, 'running', undefined);
        p_on_refresh();
    };

    const F_Request_Delete = (e: React.MouseEvent) => {
        e.stopPropagation();
        set_show_delete_confirm(true);
    };

    const F_Confirm_Delete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await F_Delete_Product_By_Id(p_product.id);
        set_show_delete_confirm(false);
        p_on_refresh();
    };

    const F_Cancel_Delete = (e: React.MouseEvent) => {
        e.stopPropagation();
        set_show_delete_confirm(false);
    };

    const display_image = current_view === 'front' ? p_product.front_image : p_product.back_image;

    return (
        <>
            <div
                onClick={() => !is_exited && !is_running && p_navigate(`/product/${p_product.id}`)}
                className={`
                    bg-white dark:bg-bg-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-secondary/20 group relative
                    ${(is_running || is_exited) ? '' : ''} 
                `}
            >
                {/* Image Container */}
                <div className={`aspect-[3/4] bg-secondary/10 relative overflow-hidden`}>

                    {/* Front Image */}
                    <img
                        src={p_product.front_image}
                        alt="front"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 
                            ${current_view === 'front' ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                            ${(is_running) ? 'animate-breathe opacity-90 blur-[2px]' : ''} 
                            ${(is_exited) ? 'blur-sm grayscale' : ''}
                        `}
                    />

                    {/* Back Image (if exists) */}
                    {has_back_image && (
                        <img
                            src={p_product.back_image}
                            alt="back"
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 
                                ${current_view === 'back' ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                                ${(is_running) ? 'animate-breathe opacity-90 blur-[2px]' : ''} 
                                ${(is_exited) ? 'blur-sm grayscale' : ''}
                            `}
                        />
                    )}

                    {/* RUNNING STATE - Shimmer Animation */}
                    {is_running && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {/* Shimmer Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full animate-shimmer" />
                            {/* Pulse Overlay */}
                            <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />
                        </div>
                    )}

                    {/* EXITED (ERROR) STATE - Centered Buttons over Blurred Image */}
                    {is_exited && (
                        <div className="absolute inset-0 flex items-center justify-center gap-3 z-50 pointer-events-auto">
                            <button
                                onClick={F_Handle_Retry}
                                className="p-3 bg-white/90 hover:bg-white text-black rounded-full transition-all shadow-xl hover:scale-105"
                                title="Retry Generation"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                onClick={F_Request_Delete}
                                className="p-3 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition-all shadow-xl hover:scale-105"
                                title="Delete Product"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                    {/* NORMAL STATE (Buttons) */}
                    {!is_running && !is_exited && (
                        <>
                            {has_back_image && (
                                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={F_Toggle_View}
                                        className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full pointer-events-auto transition-transform hover:scale-110"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={F_Toggle_View}
                                        className="p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full pointer-events-auto transition-transform hover:scale-110"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 relative">
                    <p className="font-medium text-text-light dark:text-text-dark truncate">
                        {p_product.generated_title || `ID: ${p_product.id.substring(0, 8)}...`}
                    </p>
                    <p className="text-sm text-secondary truncate mt-1">
                        {p_product.generated_description || p_product.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-secondary/60">
                            {new Date(p_product.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {show_delete_confirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={F_Cancel_Delete}>
                    <div className="bg-white dark:bg-bg-dark rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-2">
                                {F_Get_Text('product.confirm_delete_title')}
                            </h3>
                            <p className="text-sm text-secondary mb-6">
                                {F_Get_Text('product.confirm_delete_message')}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={F_Cancel_Delete}
                                    className="flex-1 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-text-light dark:text-text-dark rounded-lg text-sm font-medium transition-colors"
                                >
                                    {F_Get_Text('product.cancel')}
                                </button>
                                <button
                                    onClick={F_Confirm_Delete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    {F_Get_Text('product.delete_confirm_button')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
