export interface I_Product_Data {
    id: string;
    created_at: number;
    front_image: string;
    back_image: string;
    gender: string;
    age: number;
    body_type: string;
    fit: string;
    background: string;
    accessory: string;
    description: string;
}

const STORAGE_KEY_PRODUCTS = 'kabak_ai_products';
const STORAGE_KEY_THEME = 'kabak_ai_theme';
const STORAGE_KEY_LANG = 'kabak_ai_lang';

export const F_Save_Product = (p_product: I_Product_Data) => {
    const products = F_Get_All_Products();
    products.unshift(p_product); // Add to beginning
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
};

export const F_Get_All_Products = (): I_Product_Data[] => {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return data ? JSON.parse(data) : [];
};

export const F_Get_Product_By_Id = (p_id: string): I_Product_Data | undefined => {
    const products = F_Get_All_Products();
    return products.find(p => p.id === p_id);
};

// Preference Utils using Cookies (as requested) + LocalStorage backup
export const F_Set_Preference = (p_key: 'theme' | 'lang', p_value: string) => {
    // Set Cookie
    document.cookie = `${p_key}=${p_value}; path=/; max-age=31536000`; // 1 year
    // Set LocalStorage (redundancy)
    localStorage.setItem(p_key === 'theme' ? STORAGE_KEY_THEME : STORAGE_KEY_LANG, p_value);
};

export const F_Get_Preference = (p_key: 'theme' | 'lang'): string | null => {
    const match = document.cookie.split('; ').find(row => row.startsWith(`${p_key}=`));
    if (match) return match.split('=')[1];
    return localStorage.getItem(p_key === 'theme' ? STORAGE_KEY_THEME : STORAGE_KEY_LANG);
};
