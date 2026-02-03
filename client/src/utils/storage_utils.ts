// Storage Utils helper
// Strict naming convention: snake_case file, F_ functions, p_ parameters.

export const F_Set_Storage = (p_key: string, p_value: any): void => {
    try {
        const json_value = JSON.stringify(p_value);
        localStorage.setItem(p_key, json_value);
    } catch (error) {
        console.error('Error setting storage', error);
    }
};

export const F_Get_Storage = <T>(p_key: string): T | null => {
    try {
        const value = localStorage.getItem(p_key);
        if (!value) return null;
        return JSON.parse(value) as T;
    } catch (error) {
        console.error('Error getting storage', error);
        return null;
    }
};

export const F_Remove_Storage = (p_key: string): void => {
    localStorage.removeItem(p_key);
};
