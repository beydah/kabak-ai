import React from 'react';
import { F_Button } from '../atoms/button';
import { F_Icon } from '../atoms/icon';
import { F_Toggle_Theme, F_Get_Theme } from '../../utils/theme_utils';

interface Theme_Toggle_Props {
    p_class_name?: string;
}

export const F_Theme_Toggle: React.FC<Theme_Toggle_Props> = ({
    p_class_name = '',
}) => {
    const [current_theme, set_current_theme] = React.useState(F_Get_Theme());

    const handle_toggle = () => {
        const new_theme = F_Toggle_Theme();
        set_current_theme(new_theme);
    };

    return (
        <button
            onClick={handle_toggle}
            className={`p-2 rounded-full hover:bg-secondary/20 transition-colors ${p_class_name}`}
            aria-label="Toggle theme"
        >
            <F_Icon p_name={current_theme === 'light' ? 'moon' : 'sun'} p_size={20} />
        </button>
    );
};
