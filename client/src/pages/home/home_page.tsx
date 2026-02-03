import React from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { useNavigate } from 'react-router-dom';

export const F_Home_Page: React.FC = () => {
    const navigate = useNavigate();

    return (
        <F_Main_Template>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <F_Text p_variant="h1" p_class_name="mb-4">
                    {F_Get_Text('home.title')}
                </F_Text>
                <F_Text p_variant="body" p_class_name="mb-8 max-w-xl text-secondary">
                    {F_Get_Text('home.subtitle')}
                </F_Text>
                <F_Button
                    p_label={F_Get_Text('home.cta_button')}
                    p_on_click={() => navigate('/login')}
                    p_variant="primary"
                />
            </div>
        </F_Main_Template>
    );
};
