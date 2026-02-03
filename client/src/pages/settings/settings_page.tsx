import React from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Theme_Toggle } from '../../components/molecules/theme_toggle';
import { F_Get_Text, F_Get_Language, F_Set_Language } from '../../utils/i18n_utils';

export const F_Settings_Page: React.FC = () => {
    const current_lang = F_Get_Language();

    const F_Handle_Language_Change = (p_lang: 'tr' | 'en') => {
        F_Set_Language(p_lang);
        window.location.reload();
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-xl mx-auto">
                <F_Text p_variant="h1" p_class_name="mb-8">
                    {F_Get_Text('settings.title')}
                </F_Text>

                <div className="space-y-6">
                    {/* Language Setting */}
                    <div className="p-4 bg-secondary/10 rounded-lg">
                        <F_Text p_variant="h3" p_class_name="mb-4">
                            {F_Get_Text('settings.language')}
                        </F_Text>
                        <div className="flex gap-2">
                            <F_Button
                                p_label="English"
                                p_variant={current_lang === 'en' ? 'primary' : 'secondary'}
                                p_on_click={() => F_Handle_Language_Change('en')}
                            />
                            <F_Button
                                p_label="Türkçe"
                                p_variant={current_lang === 'tr' ? 'primary' : 'secondary'}
                                p_on_click={() => F_Handle_Language_Change('tr')}
                            />
                        </div>
                    </div>

                    {/* Theme Setting */}
                    <div className="p-4 bg-secondary/10 rounded-lg">
                        <F_Text p_variant="h3" p_class_name="mb-4">
                            {F_Get_Text('settings.theme')}
                        </F_Text>
                        <div className="flex items-center gap-4">
                            <F_Text p_variant="body">{F_Get_Text('settings.theme_light')}</F_Text>
                            <F_Theme_Toggle />
                            <F_Text p_variant="body">{F_Get_Text('settings.theme_dark')}</F_Text>
                        </div>
                    </div>
                </div>
            </div>
        </F_Main_Template>
    );
};
