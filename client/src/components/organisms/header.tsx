import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { F_Theme_Toggle } from '../molecules/theme_toggle';
import { F_Get_Text, F_Get_Language, F_Set_Language } from '../../utils/i18n_utils';

interface Header_Props {
    p_is_authenticated?: boolean;
    p_is_landing?: boolean;
}

export const F_Header: React.FC<Header_Props> = ({
    p_is_authenticated = false,
    p_is_landing = false,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [current_lang, set_current_lang] = React.useState(F_Get_Language());
    const [is_menu_open, set_is_menu_open] = React.useState(false);
    const [is_scrolled, set_is_scrolled] = React.useState(false);

    React.useEffect(() => {
        const F_Handle_Scroll = () => {
            set_is_scrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', F_Handle_Scroll);
        return () => window.removeEventListener('scroll', F_Handle_Scroll);
    }, []);

    const F_Handle_Language_Toggle = () => {
        const new_lang = current_lang === 'en' ? 'tr' : 'en';
        F_Set_Language(new_lang);
        set_current_lang(new_lang);
        window.location.reload();
    };

    const F_Handle_Logout = () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/');
    };

    const F_Scroll_To_Section = (p_section_id: string) => {
        set_is_menu_open(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(p_section_id);
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(p_section_id);
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const landing_nav_items = [
        { id: 'home', label: F_Get_Text('nav.home'), is_anchor: true },
        { id: 'about', label: F_Get_Text('nav.about'), is_anchor: true },
        { id: 'ai-models', label: F_Get_Text('nav.ai_models'), is_anchor: true },
        { id: 'open-source', label: F_Get_Text('nav.open_source'), is_anchor: true },
        { id: 'contact', label: F_Get_Text('nav.contact'), is_anchor: true },
    ];

    /* 
      Collection Page Header Structure:
      - Collection
      - New Product
      - Logout
      - Language
      - Theme
    */
    const app_nav_items = [
        { path: '/collection', label: F_Get_Text('nav.collection') },
        { path: '/new-product', label: F_Get_Text('nav.new_product') },
    ];

    // Logic: Logo click goes to Collection if authenticated, else / (Landing)
    const logo_target = p_is_authenticated ? '/collection' : '/';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${is_scrolled || p_is_authenticated
                ? 'bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-md shadow-md'
                : 'bg-transparent'
            }`}>
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to={logo_target} className="text-xl font-bold text-primary">
                    {F_Get_Text('app_name')}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {p_is_authenticated ? (
                        // App navigation
                        <>
                            {app_nav_items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm font-medium transition-colors ${location.pathname === item.path
                                            ? 'text-primary'
                                            : 'text-text-light dark:text-text-dark hover:text-primary'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={F_Handle_Logout}
                                className="text-sm font-medium text-text-light dark:text-text-dark hover:text-red-500 transition-colors"
                            >
                                {F_Get_Text('nav.logout')}
                            </button>
                        </>
                    ) : (
                        // Landing navigation
                        <>
                            {landing_nav_items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => F_Scroll_To_Section(item.id)}
                                    className="text-sm font-medium text-text-light dark:text-text-dark hover:text-primary transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                {F_Get_Text('nav.login')}
                            </Link>
                        </>
                    )}

                    {/* Language Toggle */}
                    <button
                        onClick={F_Handle_Language_Toggle}
                        className="px-2 py-1 text-sm font-medium text-text-light dark:text-text-dark hover:text-primary transition-colors border border-secondary/30 rounded"
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
                    <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={is_menu_open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {is_menu_open && (
                <nav className="md:hidden px-4 py-4 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-md border-t border-secondary/30">
                    {p_is_authenticated ? (
                        <>
                            {app_nav_items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="block py-3 text-text-light dark:text-text-dark hover:text-primary"
                                    onClick={() => set_is_menu_open(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => { F_Handle_Logout(); set_is_menu_open(false); }}
                                className="block w-full text-left py-3 text-red-500 hover:text-red-600"
                            >
                                {F_Get_Text('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            {landing_nav_items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => F_Scroll_To_Section(item.id)}
                                    className="block w-full text-left py-3 text-text-light dark:text-text-dark hover:text-primary"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <Link
                                to="/login"
                                className="block py-3 text-primary font-medium"
                                onClick={() => set_is_menu_open(false)}
                            >
                                {F_Get_Text('nav.login')}
                            </Link>
                        </>
                    )}
                    <div className="flex items-center gap-4 py-3 border-t border-secondary/30 mt-2">
                        <button onClick={F_Handle_Language_Toggle} className="text-sm font-medium">
                            {current_lang.toUpperCase()}
                        </button>
                        <F_Theme_Toggle />
                    </div>
                </nav>
            )}
        </header>
    );
};
