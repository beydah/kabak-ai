import React from 'react';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { useNavigate } from 'react-router-dom';

export const F_Collection_Page: React.FC = () => {
    const navigate = useNavigate();

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <F_Text p_variant="h1">
                        {F_Get_Text('collection.title')}
                    </F_Text>
                    <F_Button
                        p_label={F_Get_Text('collection.create_new')}
                        p_on_click={() => navigate('/new-product')}
                    />
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-lg">
                    <F_Text p_variant="body" p_class_name="text-secondary">
                        {F_Get_Text('collection.empty_state')}
                    </F_Text>
                </div>
            </div>
        </F_Main_Template>
    );
};
