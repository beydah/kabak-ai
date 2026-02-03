import React, { useEffect, useState } from 'react';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_Get_Models, F_Increment_Usage, F_Check_Daily_Reset, I_Model_Config } from '../../utils/model_utils';
import { RefreshCw, Zap, Shield, ArrowRight, RotateCcw } from 'lucide-react';

export const F_AI_Models_Section: React.FC = () => {
    const [models, set_models] = useState<I_Model_Config[]>([]);
    const [grouped_models, set_grouped_models] = useState<Record<string, I_Model_Config[]>>({});

    // Pricing Simulator State
    const [token_count, set_token_count] = useState(1000); // Default 1K tokens
    const [base_rate, set_base_rate] = useState(0.0002); // Mock base rate per token

    useEffect(() => {
        F_Load_Data();
    }, []);

    const F_Load_Data = () => {
        const data = F_Get_Models();
        set_models(data);

        const groups: Record<string, I_Model_Config[]> = {};
        data.forEach(m => {
            if (!groups[m.category]) groups[m.category] = [];
            groups[m.category].push(m);
        });
        set_grouped_models(groups);
    };

    const F_Simulate_Usage = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        F_Increment_Usage(id);
        F_Load_Data();
    };

    const F_Reset_Usage = () => {
        F_Check_Daily_Reset(true); // Force reset
        F_Load_Data();
    };

    const F_Handle_Token_Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        set_token_count(parseInt(e.target.value));
    };

    return (
        <section id="ai-models" className="py-20 bg-secondary/5">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <F_Text p_variant="h1" p_class_name="mb-4">
                        {F_Get_Text('ai_models.title')}
                    </F_Text>
                    <p className="text-secondary text-lg max-w-3xl mx-auto">
                        {F_Get_Text('ai_models.subtitle')}
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 gap-8 mb-16">
                    {Object.entries(grouped_models).map(([category, categoryModels]) => (
                        <div key={category} className="bg-white dark:bg-bg-dark rounded-2xl shadow-sm border border-secondary/20 overflow-hidden">
                            {/* Category Header */}
                            <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                                    {category === 'Text Generation' && <span className="text-2xl">📝</span>}
                                    {category === 'Image' && <span className="text-2xl">🖼️</span>}
                                    {category === 'Video' && <span className="text-2xl">🎥</span>}
                                    {category}
                                </h3>
                                <span className="text-xs font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
                                    {categoryModels.length} Models
                                </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">

                                {/* Fallback Arrow Visual (Desktop only) */}
                                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-bg-light dark:bg-bg-dark border border-secondary/20 p-2 rounded-full text-secondary">
                                    <ArrowRight size={20} />
                                </div>

                                {categoryModels.map((model) => {
                                    // Use 'is_primary' logic from new config if available, fallback to index
                                    const isPrimary = model.is_primary;
                                    const usagePercent = Math.min(100, (model.current_usage_today / model.daily_limit_rpd) * 100);

                                    return (
                                        <div
                                            key={model.model_id}
                                            className={`relative rounded-xl border-2 transition-all p-5 hover:bg-secondary/5 cursor-pointer group ${isPrimary
                                                    ? 'border-primary/50 bg-primary/5'
                                                    : 'border-secondary/20 bg-transparent'
                                                }`}
                                            onClick={(e) => F_Simulate_Usage(model.model_id, e)}
                                            title="Click to simulate usage"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-lg text-text-light dark:text-text-dark">
                                                            {model.model_id}
                                                        </span>
                                                        {isPrimary ? (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                <Zap size={10} /> Primary
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                                                <Shield size={10} /> Fallback
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-4 text-xs text-secondary font-mono">
                                                        <span>RPM: <b className="text-text-light dark:text-text-dark">{model.minute_limit_rpm}</b></span>
                                                        <span>RPD: <b className="text-text-light dark:text-text-dark">{model.daily_limit_rpd / 1000}k</b></span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Usage Bar */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-secondary">Daily Usage</span>
                                                    <span className={`${usagePercent > 90 ? 'text-red-500' : 'text-primary'}`}>
                                                        {model.current_usage_today} / {model.daily_limit_rpd}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                                        style={{ width: `${usagePercent}%` }}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* PRICING SIMULATOR */}
                <div className="bg-white dark:bg-bg-dark rounded-2xl p-8 border border-secondary/20 shadow-sm max-w-2xl mx-auto text-center">
                    <h3 className="text-xl font-bold mb-6 text-text-light dark:text-text-dark">Dynamic Pricing Simulation</h3>

                    <div className="mb-8">
                        <label className="block text-secondary text-sm mb-2">Estimated Tokens / Month</label>
                        <input
                            type="range"
                            min="1000"
                            max="1000000"
                            step="1000"
                            value={token_count}
                            onChange={F_Handle_Token_Change}
                            className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-2 font-mono text-sm text-primary font-bold">
                            <span>1K</span>
                            <span className="text-lg">{token_count.toLocaleString()} Tokens</span>
                            <span>1M</span>
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 mb-6">
                        <span className="block text-secondary text-sm mb-1">Estimated Cost</span>
                        <span className="text-4xl font-black text-text-light dark:text-text-dark">
                            ${(token_count * base_rate).toFixed(2)}
                        </span>
                        <span className="text-xs text-secondary mt-1">based on avg. usage</span>
                    </div>
                </div>

                {/* API Info & RESET */}
                <div className="mt-12 text-center">
                    <button
                        onClick={F_Reset_Usage}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-sm text-secondary transition-colors cursor-pointer"
                        title="Use this to reset simulation limits"
                    >
                        <RotateCcw size={14} />
                        <span>Resets Daily (Click to Reset Now)</span>
                    </button>
                </div>
            </div>
        </section>
    );
};
