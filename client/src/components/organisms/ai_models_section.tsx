import React, { useEffect, useState } from 'react';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_Models, F_Increment_Usage, F_Check_Daily_Reset, I_Model_Config } from '../../utils/model_utils';
import { RefreshCw, Zap, Shield, ArrowRight, RotateCcw, Plus, Minus, Package } from 'lucide-react';

export const F_AI_Models_Section: React.FC = () => {
    const [models, set_models] = useState<I_Model_Config[]>([]);
    const [grouped_models, set_grouped_models] = useState<Record<string, I_Model_Config[]>>({});

    // Bundle State
    const [bundle_count, set_bundle_count] = useState(0);

    useEffect(() => {
        F_Load_Data();
    }, []);

    const F_Load_Data = () => {
        const data = F_Get_Models();
        set_models(data);

        const groups: Record<string, I_Model_Config[]> = {};
        // Ensure Text, Image, Video order if possible, but object keys are unordered.
        // We will map over a fixed order array for rendering.
        data.forEach(m => {
            if (!groups[m.category]) groups[m.category] = [];
            groups[m.category].push(m);
        });
        set_grouped_models(groups);
    };

    const F_Reset_Usage = () => {
        F_Check_Daily_Reset(true); // Force reset
        set_bundle_count(0);
        F_Load_Data();
    };

    // --- BUNDLING LOGIC ---
    // 1 Bundle = 1 Text, 4 Image, 1 Video

    const F_Handle_Bundle_Change = (change: number) => {
        if (change > 0) {
            // Cap at 20 Bundles
            if (bundle_count >= 20) return;

            // Add Bundle
            set_bundle_count(prev => prev + 1);
            F_Increment_Category_Usage('Text Generation', 1);
            F_Increment_Category_Usage('Image', 4);
            F_Increment_Category_Usage('Video', 1);
        } else {
            // Remove Bundle (only if > 0)
            if (bundle_count > 0) {
                set_bundle_count(prev => prev - 1);
                F_Decrement_Category_Usage('Text Generation', 1);
                F_Decrement_Category_Usage('Image', 4);
                F_Decrement_Category_Usage('Video', 1);
            }
        }
        F_Load_Data(); // Refresh UI
    };

    const F_Increment_Category_Usage = (category: string, amount: number) => {
        // Find Primary and Fallback models for this category
        const data = F_Get_Models(); // Get fresh data
        const catModels = data.filter(m => m.category === category);
        const primary = catModels.find(m => m.is_primary);
        const fallback = catModels.find(m => !m.is_primary);

        if (!primary) return;

        let remaining = amount;

        // Fill Primary first
        const primaryAvailable = Math.max(0, primary.daily_limit_rpd - primary.current_usage_today);
        const toPrimary = Math.min(remaining, primaryAvailable);

        if (toPrimary > 0) {
            // Loop for simulator effect (expensive in loop but fine for small demo numbers)
            // Ideally we'd have a bulk update method, but we have F_Increment_Usage
            for (let i = 0; i < toPrimary; i++) F_Increment_Usage(primary.model_id);
            remaining -= toPrimary;
        }

        // Fill Fallback with remaining
        if (remaining > 0 && fallback) {
            for (let i = 0; i < remaining; i++) F_Increment_Usage(fallback.model_id);
        }
    };

    const F_Decrement_Category_Usage = (category: string, amount: number) => {
        // Reverse logic: Remove from Fallback first (LIFOish logic for cost simulation consistency)
        // Actually, we just want to reduce the usage.
        // Simulating "undo" is tricky without history, but we can assume:
        // If Usage > 0, remove.
        // If Fallback has usage, remove from there first. Then Primary.

        // CUSTOM DECREMENT LOGIC NEEDED in Model Utils? 
        // Current utils only support Increment. 
        // I will implement a local 'Decrement' helper by manually modifying storage here for simplicity 
        // or just accept that "Simulate" usually implies forward. 
        // User requested: "decrement (-) logic must follow the same path in reverse".

        // We will read current usage, modify, save.
        const storedUsage = JSON.parse(localStorage.getItem('kabak_ai_model_usage') || '{}');

        const data = F_Get_Models();
        const catModels = data.filter(m => m.category === category);
        const primary = catModels.find(m => m.is_primary);
        const fallback = catModels.find(m => !m.is_primary);

        if (!primary) return;

        let remainingToRemove = amount;

        // Remove from Fallback first
        if (fallback) {
            const fallbackUsage = storedUsage[fallback.model_id] || 0;
            const removeFallback = Math.min(remainingToRemove, fallbackUsage);
            if (removeFallback > 0) {
                storedUsage[fallback.model_id] = fallbackUsage - removeFallback;
                remainingToRemove -= removeFallback;
            }
        }

        // Remove from Primary next
        const primaryUsage = storedUsage[primary.model_id] || 0;
        const removePrimary = Math.min(remainingToRemove, primaryUsage);
        if (removePrimary > 0) {
            storedUsage[primary.model_id] = primaryUsage - removePrimary;
        }

        localStorage.setItem('kabak_ai_model_usage', JSON.stringify(storedUsage));
    };


    // Total Cost
    const totalCost = models.reduce((total, m) => total + (m.current_usage_today * (m.cost_per_request || 0)), 0);

    return (
        <section id="ai-models" className="py-20 bg-secondary/5">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <F_Text p_variant="h1" p_class_name="mb-4">
                        {F_Get_Text('ai_models.title')}
                    </F_Text>
                    <p className="text-secondary text-lg max-w-3xl mx-auto">
                        {F_Get_Text('ai_models.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Controls & Pricing) - Span 4 */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* BUNDLE CARD */}
                        <div className="bg-white dark:bg-bg-dark rounded-2xl p-6 border border-secondary/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Package size={100} className="text-primary" />
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-text-light dark:text-text-dark flex items-center gap-2">
                                <Package className="text-primary" />
                                {F_Get_Text('pricing.product_bundle')}
                            </h3>
                            <p className="text-sm text-secondary mb-6">
                                {F_Get_Text('pricing.bundle_desc')}
                            </p>

                            <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                                <button
                                    onClick={() => F_Handle_Bundle_Change(-1)}
                                    disabled={bundle_count === 0}
                                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-bg-dark border border-secondary/20 text-secondary hover:text-primary hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Minus size={20} />
                                </button>

                                <div className="text-center">
                                    <span className="block text-3xl font-black text-text-light dark:text-text-dark">
                                        {bundle_count}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                                        {F_Get_Text('pricing.bundles_subtext')}
                                    </span>
                                </div>

                                <button
                                    onClick={() => F_Handle_Bundle_Change(1)}
                                    disabled={bundle_count >= 20}
                                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* PRICING CARD */}
                        <div className="bg-white dark:bg-bg-dark rounded-2xl p-6 border border-secondary/20 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">
                                {F_Get_Text('pricing.estimated_cost')}
                            </h3>

                            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 mb-4 text-center">
                                <span className="text-4xl font-black text-text-light dark:text-text-dark">
                                    ${totalCost.toFixed(4)}
                                </span>
                            </div>

                            <button
                                onClick={F_Reset_Usage}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-sm font-medium text-secondary transition-colors"
                            >
                                <RotateCcw size={16} />
                                <span>{F_Get_Text('pricing.reset')}</span>
                            </button>
                        </div>

                    </div>


                    {/* RIGHT COLUMN (Model List) - Span 8 */}
                    <div className="lg:col-span-8 space-y-6">
                        {['Text Generation', 'Image', 'Video'].map((category) => {
                            const categoryModels = grouped_models[category] || [];
                            if (categoryModels.length === 0) return null;

                            return (
                                <div key={category} className="bg-white dark:bg-bg-dark rounded-2xl shadow-sm border border-secondary/20 overflow-hidden">
                                    {/* Category Header */}
                                    <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                        <h3 className="font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                                            {category === 'Text Generation' && <span className="">📝 Text Models</span>}
                                            {category === 'Image' && <span className="">🖼️ Image Models</span>}
                                            {category === 'Video' && <span className="">🎥 Video Models</span>}
                                        </h3>
                                    </div>

                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {categoryModels.map((model) => {
                                            const isPrimary = model.is_primary;
                                            const usagePercent = Math.min(100, (model.current_usage_today / model.daily_limit_rpd) * 100);

                                            return (
                                                <div
                                                    key={model.model_id}
                                                    className={`relative rounded-xl border p-4 transition-all ${isPrimary
                                                        ? 'border-primary/30 bg-primary/5'
                                                        : 'border-secondary/20 bg-transparent'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-text-light dark:text-text-dark">
                                                                    {model.model_id}
                                                                </span>
                                                                {isPrimary ? (
                                                                    <span className="text-[9px] font-bold uppercase text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Primary</span>
                                                                ) : (
                                                                    <span className="text-[9px] font-bold uppercase text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Fallback</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-xs font-mono font-bold text-text-light dark:text-text-dark">
                                                                {model.current_usage_today.toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-secondary">
                                                                / {model.daily_limit_rpd.toLocaleString()} RPD
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Warning if switching to fallback */}
                                                    {!isPrimary && model.current_usage_today > 0 && (
                                                        <div className="absolute top-2 right-2 flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                        </div>
                                                    )}

                                                    <div className="h-1.5 w-full bg-secondary/10 rounded-full overflow-hidden mt-2">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
