import React, { useState } from 'react';
import { F_Auth_Template } from '../../components/templates/auth_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Form_Field } from '../../components/molecules/form_field';
import { F_Theme_Toggle } from '../../components/molecules/theme_toggle';
import { F_Get_Text } from '../../utils/i18n_utils';
import { useNavigate } from 'react-router-dom';

export const F_Login_Page: React.FC = () => {
    const navigate = useNavigate();
    const [username, set_username] = useState('');
    const [password, set_password] = useState('');

    const F_Handle_Submit = (p_event: React.FormEvent) => {
        p_event.preventDefault();
        // TODO: Implement actual login logic
        console.log('Login attempt:', { username, password });
        navigate('/collection');
    };

    return (
        <F_Auth_Template>
            <div className="absolute top-4 right-4">
                <F_Theme_Toggle />
            </div>

            <F_Text p_variant="h2" p_class_name="text-center mb-6">
                {F_Get_Text('login.title')}
            </F_Text>

            <form onSubmit={F_Handle_Submit} className="space-y-4">
                <F_Form_Field
                    p_label={F_Get_Text('login.username_placeholder')}
                    p_type="text"
                    p_value={username}
                    p_on_change={set_username}
                    p_name="username"
                />
                <F_Form_Field
                    p_label={F_Get_Text('login.password_placeholder')}
                    p_type="password"
                    p_value={password}
                    p_on_change={set_password}
                    p_name="password"
                />
                <F_Button
                    p_label={F_Get_Text('login.submit_button')}
                    p_type="submit"
                    p_variant="primary"
                    p_class_name="w-full mt-4"
                />
            </form>

            <div className="text-center mt-4">
                <a href="#" className="text-sm text-primary hover:underline">
                    {F_Get_Text('login.forgot_password')}
                </a>
            </div>
        </F_Auth_Template>
    );
};
