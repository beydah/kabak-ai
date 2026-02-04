import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronLeft, ChevronRight, Bell, Trash2, Copy, AlertCircle, RotateCcw } from 'lucide-react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_All_Products, I_Product_Data } from '../../utils/storage_utils';
import { useJobManager } from '../../components/providers/job_manager';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();
    const [products, set_products] = useState<I_Product_Data[]>([]);

    // Force re-render on polling or status updates
    // In a real app with Context/Redux, 'products' would come from the store directly.
    // For now, we listen to local storage changes or rely on the polling interval in JobManager to trigger updates if we shared state.
    // BUT check this: JobManager is a Provider but doesn't expose 'products'.
    // We should expose a "refresh_products" or just poll here too for UI updates?
    // BETTER: Use a custom hook or event listener for 'kabak_ai_products' changes.

    const F_Refresh_Products = () => {
        set_products(F_Get_All_Products());
    };

    useEffect(() => {
        F_Refresh_Products();

        // Simple polling for UI updates (every 2s) to show status changes live
        const interval = setInterval(F_Refresh_Products, 2000);
        return () => clearInterval(interval);
    }, []);

    // ... (rest of the component up to card mapping)

    const F_Handle_Bulk_Download = (e: React.MouseEvent, p_product: I_Product_Data) => {
        e.stopPropagation();
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

    const { error_logs, clear_logs, remove_log } = useJobManager();
    const [show_notifications, set_show_notifications] = useState(false);

    const F_Copy_To_Clipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="space-y-6 relative">
                <div className="flex items-center justify-between">
                    <F_Text p_variant="h1">
                        {F_Get_Text('collection.title')}
                    </F_Text>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => set_show_notifications(!show_notifications)}
                                className="p-2 hover:bg-secondary/10 rounded-full transition-colors relative"
                            >
                                <Bell size={24} className={error_logs.length > 0 ? "text-primary" : "text-secondary"} />
                                {error_logs.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-bg-dark" />
                                )}
                            </button>

                            {/* Notification Popover */}
                            {show_notifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-bg-dark border border-secondary/20 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-secondary/20 flex items-center justify-between bg-secondary/5">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        {error_logs.length > 0 && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => F_Copy_To_Clipboard(JSON.stringify(error_logs, null, 2))}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Copy All
                                                </button>
                                                <button
                                                    onClick={clear_logs}
                                                    className="text-xs text-red-500 hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {error_logs.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-secondary">
                                                No new notifications.
                                            </div>
                                        ) : (
                                            error_logs.map(log => (
                                                <div key={log.id} className="p-3 border-b border-secondary/10 hover:bg-secondary/5 transition-colors flex gap-3 text-left">
                                                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-text-light dark:text-text-dark truncate">
                                                            Processing Failed
                                                        </p>
                                                        <p className="text-xs text-secondary mt-0.5 line-clamp-2 break-all">
                                                            {log.message}
                                                        </p>
                                                        <p className="text-[10px] text-secondary/60 mt-1">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <button
                                                            onClick={() => F_Copy_To_Clipboard(log.message)}
                                                            className="p-1 hover:bg-secondary/10 rounded text-secondary hover:text-primary"
                                                            title="Copy"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => remove_log(log.id)}
                                                            className="p-1 hover:bg-secondary/10 rounded text-secondary hover:text-red-500"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Click away listener could be added here or ideally a hook */}
                        {show_notifications && (
                            <div className="fixed inset-0 z-40" onClick={() => set_show_notifications(false)} />
                        )}

                        <F_Button
                            p_label={F_Get_Text('collection.create_new')}
                            p_on_click={() => navigate('/new-product')}
                        />
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {products.map((product) => (
                            <F_Product_Card
                                key={product.id}
                                p_product={product}
                                p_navigate={navigate}
                                p_on_download={F_Handle_Bulk_Download}
                                p_on_refresh={F_Refresh_Products}
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

interface Product_Card_Props {
    p_product: I_Product_Data;
    p_navigate: (path: string) => void;
    p_on_download: (e: React.MouseEvent, product: I_Product_Data) => void;
    p_on_refresh: () => void;
}

// ... imports
// import { F_Modal } from '../../components/molecules/modal'; // Assuming we have a generic modal or we build a simple one. 
// Actually I'll build a simple inline modal for deletion to avoid dependency guessing if F_Modal isn't suitable.
// Accessing keys: product.confirm_delete_title, product.confirm_delete_message, product.delete_confirm_button, product.cancel

// ... F_Collection_Page ...

const F_Product_Card: React.FC<Product_Card_Props> = ({ p_product, p_navigate, p_on_download, p_on_refresh }) => {
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

    const F_Handle_Retry = (e: React.MouseEvent) => {
        e.stopPropagation();
        p_product.status = 'running';
        if (p_product.error_log) p_product.error_log = undefined;

        const all = F_Get_All_Products();
        const index = all.findIndex(p => p.id === p_product.id);
        if (index >= 0) {
            all[index] = p_product;
            localStorage.setItem('kabak_ai_products', JSON.stringify(all));
        }
        p_on_refresh();
    };

    const F_Request_Delete = (e: React.MouseEvent) => {
        e.stopPropagation();
        set_show_delete_confirm(true);
    };

    const F_Confirm_Delete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const all = F_Get_All_Products();
        const filtered = all.filter(p => p.id !== p_product.id);
        localStorage.setItem('kabak_ai_products', JSON.stringify(filtered));
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
                    <img
                        src={display_image}
                        alt={current_view}
                        className={`w-full h-full object-cover transition-transform duration-500 ${(is_running) ? 'scale-105 animate-breathe opacity-90 blur-[2px]' : ''} ${(is_exited) ? 'blur-sm grayscale' : ''}`}
                    />

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
                            <button
                                onClick={(e) => p_on_download(e, p_product)}
                                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Download All Photos"
                            >
                                <Download size={14} />
                            </button>

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
                                </>
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
