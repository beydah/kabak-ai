import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { F_Get_All_Metrics, I_Metric, F_Subscribe_To_Updates, F_Get_Preference, F_Set_Preference } from '../../utils/storage_utils';
import { F_Get_Exchange_Rate, F_Convert_Currency } from '../../services/currency_service';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';

const MODEL_INFO: Record<string, { rpd: number; desc: string; label: string }> = {
    'gemini-2.0-flash': { rpd: 1500, desc: 'Primary SEO Model (Fast & Efficient)', label: 'Gemini 2.0 Flash' },
    'gemini-2.0-flash-exp': { rpd: 1500, desc: 'Experimental Features Fallback', label: 'Gemini 2.0 Flash Exp' },
    'imagen-3': { rpd: 1500, desc: 'High Fidelity Image Generation', label: 'Imagen 3' },
    'imagen-3-fast-001': { rpd: 1500, desc: 'Fast Image Fallback', label: 'Imagen 3 Fast' },
    'gemini-3-pro': { rpd: 50, desc: 'High Intelligence Reasoning', label: 'Gemini 3 Pro' },
    'gemini-1.5-pro': { rpd: 50, desc: 'Legacy Stable Model', label: 'Gemini 1.5 Pro' },
};

export const F_Analytics_Dashboard: React.FC = () => {
    const [metrics, set_metrics] = useState<I_Metric[]>([]);
    const [view_mode, set_view_mode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [currency, set_currency] = useState<'USD' | 'TRY'>('USD');
    const [exchange_rate, set_exchange_rate] = useState<number>(35);

    useEffect(() => {
        F_Load_Metrics();
        F_Init_Currency();
        // Subscribe to cross-tab updates
        const unsubscribe = F_Subscribe_To_Updates(F_Load_Metrics);
        return () => unsubscribe();
    }, []);

    const F_Init_Currency = async () => {
        const pref = F_Get_Preference('app_currency');
        if (pref === 'TRY') set_currency('TRY');
        const rate = await F_Get_Exchange_Rate();
        set_exchange_rate(rate);
    };

    const F_Toggle_Currency = () => {
        const new_curr = currency === 'USD' ? 'TRY' : 'USD';
        set_currency(new_curr);
        F_Set_Preference('app_currency', new_curr);
    };

    const F_Load_Metrics = async () => {
        const data = await F_Get_All_Metrics();
        set_metrics(data);
    };

    const F_Get_Filtered_Data = (metric: I_Metric) => {
        // Use local date logic to match storage_utils
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const today_str = new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

        // 1. Get Today's RPD usage (Always needed for the progress bar limit)
        const today_entry = metric.usage_history.find(h => h.date === today_str);
        const rpd_count = today_entry ? today_entry.count : 0;

        // 2. Get View Stats
        let view_count = 0;
        let view_cost = 0;

        if (view_mode === 'daily') {
            view_count = rpd_count;
            view_cost = today_entry ? today_entry.cost : 0;
        } else {
            // Aggregate
            const days = view_mode === 'weekly' ? 7 : 30;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            metric.usage_history.forEach(h => {
                if (new Date(h.date) >= cutoff) {
                    view_count += h.count;
                    view_cost += h.cost;
                }
            });
        }

        return { count: view_count, cost: view_cost, rpd_count };
    };

    const F_Get_Progress_Color = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-orange-500';
        return 'bg-gradient-to-r from-primary to-orange-400';
    };

    return (
        <div className="mt-12 pt-8 border-t border-secondary/10">
            <div className="flex items-center justify-between mb-6">
                <F_Text p_variant="h2" p_class_name="text-xl font-bold flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary rounded-full block"></span>
                    {F_Get_Text('analytics.title')}
                </F_Text>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={F_Toggle_Currency}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-bg-dark border border-secondary/20 text-primary shadow-sm hover:border-primary/50 transition-colors uppercase"
                    >
                        {currency}
                    </button>

                    <div className="w-px h-6 bg-secondary/20"></div>

                    <div className="flex bg-secondary/10 p-1 rounded-lg">
                        {['daily', 'weekly', 'monthly'].map((m) => (
                            <button
                                key={m}
                                onClick={() => set_view_mode(m as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view_mode === m
                                    ? 'bg-white dark:bg-bg-dark text-primary shadow-sm'
                                    : 'text-secondary hover:text-text-light dark:hover:text-text-dark'
                                    } capitalize`}
                            >
                                {F_Get_Text(`analytics.view_${m}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {metrics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-secondary/5 rounded-xl border border-dashed border-secondary/20">
                    <div className="p-4 bg-secondary/10 rounded-full mb-3 text-secondary">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-secondary font-medium">{F_Get_Text('analytics.empty_state')}</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m) => {
                    const info = MODEL_INFO[m.model_id] || { rpd: 1000, desc: 'Unknown Model', label: m.model_id };
                    const data = F_Get_Filtered_Data(m);

                    // RPD is always based on TODAY's count, regardless of view mode
                    const usage_percent = Math.min((data.rpd_count / info.rpd) * 100, 100);
                    const progress_color = F_Get_Progress_Color(usage_percent);

                    return (
                        <div key={m.model_id} className="bg-white dark:bg-[#0A0A0A] rounded-xl p-5 border border-secondary/20 shadow-sm hover:border-primary/30 transition-colors group">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-text-light dark:text-text-dark flex items-center gap-2">
                                        {info.label}
                                        <div className="relative group/tooltip inline-block">
                                            <Info size={14} className="text-secondary cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                                {info.desc}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></div>
                                            </div>
                                        </div>
                                    </h3>
                                    <p className="text-xs text-secondary font-mono mt-1">{m.model_id}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{data.count}</div>
                                    <div className="text-xs text-secondary uppercase tracking-wider">{F_Get_Text('analytics.total_requests')}</div>
                                </div>
                            </div>

                            {/* Progress Bar (Always Daily Limit) */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-secondary">{F_Get_Text('analytics.requests_per_day')}</span>
                                    <span className={`font-medium ${usage_percent >= 80 ? 'text-red-500' : 'text-text-light dark:text-text-dark'}`}>
                                        {usage_percent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${progress_color}`}
                                        style={{ width: `${usage_percent}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-right text-secondary mt-1">
                                    {data.rpd_count} / {info.rpd.toLocaleString()}
                                </div>
                                {usage_percent >= 100 && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 text-center animate-pulse">{F_Get_Text('analytics.limit_reached')}</p>
                                )}
                            </div>

                            {/* Cost */}
                            <div className="pt-3 border-t border-secondary/10 flex justify-between items-center">
                                <span className="text-xs text-secondary flex items-center gap-1">
                                    {F_Get_Text('analytics.estimated_cost')}
                                    <span className="text-[10px] bg-secondary/10 px-1 rounded">{currency}</span>
                                </span>
                                <span className="font-mono text-sm font-medium text-text-light dark:text-text-dark">
                                    {F_Convert_Currency(data.cost, exchange_rate, currency)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
