import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { F_Nav_Link } from '../molecules/nav_link';
import { F_Theme_Toggle } from '../molecules/theme_toggle';
import { F_Get_Text, F_Get_Language, F_Set_Language } from '../../utils/i18n_utils';

interface Header_Props {
    p_is_authenticated?: boolean;
}

export const F_Header: React.FC<Header_Props> = ({
    p_is_authenticated = false,
}) => {
    const location = useLocation();
    const [current_lang, set_current_lang] = React.useState(F_Get_Language());
    const [is_menu_open, set_is_menu_open] = React.useState(false);

    const F_Handle_Language_Toggle = () => {
        const new_lang = current_lang === 'en' ? 'tr' : 'en';
        F_Set_Language(new_lang);
        set_current_lang(new_lang);
        window.location.reload(); // Refresh to apply language change
    };

    const nav_items = p_is_authenticated
        ? [
            { path: '/collection', label: F_Get_Text('nav.collection') },
            { path: '/new-product', label: F_Get_Text('nav.new_product') },
            { path: '/settings', label: F_Get_Text('nav.settings') },
        ]
        : [
            { path: '/', label: F_Get_Text('nav.home') },
            { path: '/contact', label: F_Get_Text('nav.contact') },
            { path: '/login', label: F_Get_Text('nav.login') },
        ];

    return (
        <header className="sticky top-0 z-50 bg-bg-light dark:bg-bg-dark border-b border-secondary/30 transition-colors">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-primary">
                    {F_Get_Text('app_name')}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    {nav_items.map((item) => (
                        <F_Nav_Link
                            key={item.path}
                            p_to={item.path}
                            p_label={item.label}
                            p_is_active={location.pathname === item.path}
                        />
                    ))}

                    {/* Language Toggle */}
                    <button
                        onClick={F_Handle_Language_Toggle}
                        className="px-2 py-1 text-sm font-medium text-text-light dark:text-text-dark hover:text-primary transition-colors"
                    >
                        {current_lang.toUpperCase()}
                    </button>

                    {/* Theme Toggle */}
                    <F_Theme_Toggle />
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => set_is_menu_open(!is_menu_open)}
                    className="md:hidden p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={is_menu_open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {is_menu_open && (
                <nav className="md:hidden px-4 py-2 border-t border-secondary/30">
                    {nav_items.map((item) => (
                        <F_Nav_Link
                            key={item.path}
                            p_to={item.path}
                            p_label={item.label}
                            p_is_active={location.pathname === item.path}
                            p_class_name="block py-2"
                        />
                    ))}
                    <div className="flex items-center gap-4 py-2">
                        <button onClick={F_Handle_Language_Toggle} className="text-sm">
                            {current_lang.toUpperCase()}
                        </button>
                        <F_Theme_Toggle />
                    </div>
                </nav>
            )}
        </header>
    );
};
