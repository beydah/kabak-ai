import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { F_Get_All_Metrics, I_Metric, F_Subscribe_To_Updates } from '../../utils/storage_utils';
import { F_Text } from '../atoms/text';

const MODEL_INFO: Record<string, { rpd: number; desc: string; label: string }> = {
    'gemini-2.0-flash': { rpd: 1500, desc: 'Primary SEO Model (Fast & Efficient)', label: 'Gemini 2.0 Flash' },
    'gemini-2.0-flash-exp': { rpd: 1500, desc: 'Experimental Features Fallback', label: 'Gemini 2.0 Flash Exp' },
    'gemini-3-flash': { rpd: 1500, desc: 'High Throughput Fallback', label: 'Gemini 3 Flash' },
    'gemini-3-pro': { rpd: 50, desc: 'High Intelligence Reasoning', label: 'Gemini 3 Pro' },
    'gemini-1.5-pro': { rpd: 50, desc: 'Legacy Stable Model', label: 'Gemini 1.5 Pro' },
};

export const F_Analytics_Dashboard: React.FC = () => {
    const [metrics, set_metrics] = useState<I_Metric[]>([]);
    const [view_mode, set_view_mode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    useEffect(() => {
        F_Load_Metrics();
        // Subscribe to cross-tab updates
        const unsubscribe = F_Subscribe_To_Updates(F_Load_Metrics);
        return () => unsubscribe();
    }, []);

    const F_Load_Metrics = async () => {
        const data = await F_Get_All_Metrics();
        set_metrics(data);
    };

    const F_Get_Filtered_Data = (metric: I_Metric) => {
        const today = new Date().toISOString().split('T')[0];

        if (view_mode === 'daily') {
            const entry = metric.usage_history.find(h => h.date === today);
            return entry ? { count: entry.count, cost: entry.cost } : { count: 0, cost: 0 };
        }
        // Simplified total for other views (Since backend filtering isn't implemented deeply)
        return { count: metric.total_requests, cost: metric.total_cost };
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
                    Usage & Analytics
                </F_Text>

                {/* Filters */}
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
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {metrics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-secondary/5 rounded-xl border border-dashed border-secondary/20">
                    <div className="p-4 bg-secondary/10 rounded-full mb-3 text-secondary">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-secondary font-medium">No usage data available yet.</p>
                    <p className="text-secondary/60 text-sm mt-1">Start creating products to see analytics!</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m) => {
                    const info = MODEL_INFO[m.model_id] || { rpd: 1000, desc: 'Unknown Model', label: m.model_id };
                    const data = F_Get_Filtered_Data(m);
                    const usage_percent = Math.min((data.count / info.rpd) * 100, 100);
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
                                    <div className="text-xs text-secondary uppercase tracking-wider">Requests</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-secondary">Daily Limit Usage</span>
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
                                    {data.count} / {info.rpd.toLocaleString()} RPD
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="pt-3 border-t border-secondary/10 flex justify-between items-center">
                                <span className="text-xs text-secondary flex items-center gap-1">
                                    Est. Cost
                                    <span className="text-[10px] bg-secondary/10 px-1 rounded">USD</span>
                                </span>
                                <span className="font-mono text-sm font-medium text-text-light dark:text-text-dark">
                                    ${data.cost.toFixed(6)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
