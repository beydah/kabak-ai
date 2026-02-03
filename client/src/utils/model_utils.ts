import modelsConfig from '../config/models.json';

export interface I_Model_Config {
    model_id: string;
    category: string;
    daily_limit_rpd: number;
    minute_limit_rpm: number;
    current_usage_today: number;
    is_primary: boolean;
    cost_per_request?: number;
}

const STORAGE_KEY_USAGE = 'kabak_ai_model_usage';
const STORAGE_KEY_LAST_RESET = 'kabak_ai_last_reset';

// Get base config combined with local usage data
export const F_Get_Models = (): I_Model_Config[] => {
    F_Check_Daily_Reset();
    const storedUsage = JSON.parse(localStorage.getItem(STORAGE_KEY_USAGE) || '{}');

    return modelsConfig.models.map(model => ({
        ...model,
        current_usage_today: storedUsage[model.model_id] || 0
    }));
};

// Check if 24h passed
export const F_Check_Daily_Reset = (force: boolean = false) => {
    const lastReset = localStorage.getItem(STORAGE_KEY_LAST_RESET);
    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;

    if (force || lastReset !== todayStr) {
        // Reset Usage
        localStorage.setItem(STORAGE_KEY_USAGE, '{}');
        localStorage.setItem(STORAGE_KEY_LAST_RESET, todayStr);
    }
};

// Simulate usage increment
export const F_Increment_Usage = (p_model_id: string) => {
    F_Check_Daily_Reset();
    const storedUsage = JSON.parse(localStorage.getItem(STORAGE_KEY_USAGE) || '{}');
    const current = storedUsage[p_model_id] || 0;

    storedUsage[p_model_id] = current + 1;
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(storedUsage));
};
