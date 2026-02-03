import React from 'react';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_Footer: React.FC = () => {
    return (
        <footer className="bg-bg-light dark:bg-bg-dark border-t border-secondary/30 py-6 transition-colors">
            <div className="container mx-auto px-4 text-center">
                <F_Text p_variant="caption">
                    {F_Get_Text('footer.copyright')}
                </F_Text>
            </div>
        </footer>
    );
};
