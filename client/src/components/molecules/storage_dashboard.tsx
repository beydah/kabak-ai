import React, { useEffect, useState } from 'react';
import { DB_Service } from '../../services/storage_service';
import { F_Button } from '../../components/atoms/button';
// import { F_Format_Bytes } from '../../utils/format_utils'; // Assuming this utility exists or I'll implement simple one

const F_Storage_Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        products: 0,
        logs: 0,
        metrics: 0,
        drafts: 0,
        localStoragesize: 0
    });
    const [loading, setLoading] = useState(false);

    const refreshStats = async () => {
        setLoading(true);
        try {
            const products = await DB_Service.getAllProducts();
            const logs = await DB_Service.getAllLogs();
            const metrics = await DB_Service.getAllMetrics();

            // Calc LS size approx
            let lsSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    lsSize += (localStorage[key].length + key.length) * 2;
                }
            }

            setStats({
                products: products.length,
                logs: logs.length,
                metrics: metrics.length,
                drafts: 0, // Need method in service
                localStoragesize: lsSize
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStats();
    }, []);

    const F_Clear_DB = async (store: 'products' | 'logs' | 'metrics') => {
        if (!confirm(`Are you sure you want to clear ${store}? This cannot be undone.`)) return;

        if (store === 'products') {
            const items = await DB_Service.getAllProducts();
            for (const i of items) await DB_Service.deleteProduct(i.product_id);
        } else if (store === 'logs') {
            await DB_Service.clearLogs();
        }
        // Metrics...

        await refreshStats();
    };

    const F_Clear_LS = () => {
        if (!confirm("Clear Local Settings?")) return;
        localStorage.clear();
        refreshStats();
        window.location.reload();
    };

    const F_Clear_Drafts = async () => {
        if (!confirm("Clear saved drafts?")) return;
        await DB_Service.clearDrafts();
        refreshStats();
    };

    const fmt = (b: number) => {
        if (b === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB'][i];
    };

    return (
        <div className="p-4 bg-bg-light dark:bg-bg-dark rounded-xl border border-secondary/20 space-y-4">
            <h3 className="font-bold text-lg">Storage Management</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/5 rounded-lg">
                    <div className="text-secondary text-xs uppercase">IndexedDB (High-Res)</div>
                    <div className="text-2xl font-mono">{stats.products} <span className="text-sm text-secondary">Products</span></div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => F_Clear_DB('products')} className="text-xs text-red-500 hover:underline">Clear Products</button>
                        <button onClick={F_Clear_Drafts} className="text-xs text-orange-500 hover:underline">Clear Drafts</button>
                    </div>
                </div>

                <div className="p-3 bg-secondary/5 rounded-lg">
                    <div className="text-secondary text-xs uppercase">LocalStorage (Settings)</div>
                    <div className="text-2xl font-mono">{fmt(stats.localStoragesize)}</div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={F_Clear_LS} className="text-xs text-red-500 hover:underline">Reset App</button>
                    </div>
                </div>
            </div>

            <div className="text-xs text-secondary/60 text-center">
                IndexedDB is used for images. LocalStorage for settings.
                <button onClick={refreshStats} className="ml-2 text-primary hover:underline">Refresh</button>
            </div>
        </div>
    );
};

export default F_Storage_Dashboard;
