import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Modal_Props {
    p_is_open: boolean;
    p_on_close: () => void;
    p_title?: string;
    children: React.ReactNode;
}

export const F_Modal: React.FC<Modal_Props> = ({ p_is_open, p_on_close, p_title, children }) => {

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (p_is_open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [p_is_open]);

    if (!p_is_open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div
                className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary/10 sticky top-0 bg-white dark:bg-[#1E293B] z-10">
                    <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                        {p_title}
                    </h2>
                    <button
                        onClick={p_on_close}
                        className="p-1 rounded-full hover:bg-secondary/10 text-secondary transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
