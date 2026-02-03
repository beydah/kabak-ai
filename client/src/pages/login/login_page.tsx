import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { F_Auth_Template } from '../../components/templates/auth_template';
import { F_Text } from '../../components/atoms/text';
import { F_Input } from '../../components/atoms/input';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_Login_Page: React.FC = () => {
    const navigate = useNavigate();
    const [username, set_username] = React.useState('');
    const [password, set_password] = React.useState('');
    const [error_message, set_error_message] = React.useState('');
    const [lockout_timer, set_lockout_timer] = React.useState(0);

    useEffect(() => {
        // Check for auth cookie
        const auth_token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
        if (auth_token) {
            navigate('/collection');
        }

        // Check lockout status
        const lockout_until = localStorage.getItem('login_lockout_until');
        if (lockout_until) {
            const remaining = Math.ceil((parseInt(lockout_until) - Date.now()) / 1000);
            if (remaining > 0) {
                set_lockout_timer(remaining);
            } else {
                localStorage.removeItem('login_lockout_until');
                localStorage.setItem('login_attempts', '0');
            }
        }
    }, [navigate]);

    // Timer Countdown
    useEffect(() => {
        if (lockout_timer > 0) {
            const timer = setInterval(() => {
                set_lockout_timer(prev => {
                    if (prev <= 1) {
                        localStorage.removeItem('login_lockout_until');
                        localStorage.setItem('login_attempts', '0');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [lockout_timer]);

    const F_Handle_Login = () => {
        if (lockout_timer > 0) return;

        const env_username = import.meta.env.VITE_USERNAME;
        const env_password = import.meta.env.VITE_PASSWORD;

        if (username === env_username && password === env_password) {
            // Success
            const date = new Date();
            date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
            document.cookie = "auth_token=session_key; expires=" + date.toUTCString() + "; path=/";

            // Reset attempts
            localStorage.setItem('login_attempts', '0');
            localStorage.removeItem('login_lockout_until');

            navigate('/collection');
        } else {
            // Failure
            set_error_message(F_Get_Text('login.invalid_credentials') || 'Invalid credentials');

            const current_attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
            localStorage.setItem('login_attempts', current_attempts.toString());

            if (current_attempts >= 5) {
                const lockout_end = Date.now() + (5 * 60 * 1000); // 5 minutes
                localStorage.setItem('login_lockout_until', lockout_end.toString());
                set_lockout_timer(300);
                set_error_message("Too many failed attempts. Try again in 5 minutes.");
            }
        }
    };

    return (
        <F_Auth_Template>
            <div className="flex flex-col gap-6 w-full max-w-sm relative">

                {/* Back Link Header */}
                <div className="absolute -top-16 left-0 w-full flex justify-start">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm"
                    >
                        <span>&lt; Kabak AI</span>
                    </button>
                </div>

                <F_Text p_variant="h2" p_class_name="text-center">
                    {F_Get_Text('login.title')}
                </F_Text>

                {error_message && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center border border-red-500/20">
                        {error_message}
                    </div>
                )}

                {lockout_timer > 0 && (
                    <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg text-sm text-center border border-orange-500/20 font-mono">
                        Locked out: {Math.floor(lockout_timer / 60)}:{(lockout_timer % 60).toString().padStart(2, '0')}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <F_Input
                        p_value={username}
                        p_on_change={(e) => set_username(e.target.value)}
                        p_placeholder={F_Get_Text('login.username_placeholder')}
                        p_type="text"
                        p_disabled={lockout_timer > 0}
                    />
                    <F_Input
                        p_value={password}
                        p_on_change={(e) => set_password(e.target.value)}
                        p_placeholder={F_Get_Text('login.password_placeholder')}
                        p_type="password"
                        p_disabled={lockout_timer > 0}
                    />
                </div>

                <F_Button
                    p_label={lockout_timer > 0 ? `Wait ${lockout_timer}s` : F_Get_Text('login.submit_button')}
                    p_on_click={F_Handle_Login}
                    p_variant="primary"
                    p_class_name="w-full"
                    p_disabled={lockout_timer > 0}
                />
            </div>
        </F_Auth_Template>
    );
};
