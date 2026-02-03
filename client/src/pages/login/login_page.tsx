import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { F_Auth_Template } from '../../components/templates/auth_template';
import { F_Text } from '../../components/atoms/text';
import { F_Input } from '../../components/atoms/input';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_Login_Page: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check for auth cookie
        const auth_token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
        if (auth_token) {
            navigate('/collection');
        }
    }, [navigate]);

    const F_Handle_Login = () => {
        // Set a mock cookie
        const date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = "auth_token=mock_session_key; expires=" + date.toUTCString() + "; path=/";

        navigate('/collection');
    };

    return (
        <F_Auth_Template>
            <div className="flex flex-col gap-6 w-full max-w-sm">
                <F_Text p_variant="h2" p_class_name="text-center">
                    {F_Get_Text('login.title')}
                </F_Text>

                <div className="flex flex-col gap-4">
                    <F_Input
                        p_placeholder={F_Get_Text('login.username_placeholder')}
                        p_type="text"
                    />
                    <F_Input
                        p_placeholder={F_Get_Text('login.password_placeholder')}
                        p_type="password"
                    />
                </div>

                <F_Button
                    p_label={F_Get_Text('login.submit_button')}
                    p_on_click={F_Handle_Login}
                    p_variant="primary"
                    p_class_name="w-full"
                />

                {/* Forgot Password Removed */}
            </div>
        </F_Auth_Template>
    );
};
