import React from 'react';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_About_Section: React.FC = () => {
    const stats = [
        { key: 'cost_reduction', icon: '💰' },
        { key: 'time_saved', icon: '⚡' },
        { key: 'quality', icon: '✨' },
    ];

    return (
        <section id="about" className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div>
                        <F_Text p_variant="h1" p_class_name="mb-4">
                            {F_Get_Text('about.title')}
                        </F_Text>
                        <p className="text-primary text-lg mb-4">
                            {F_Get_Text('about.subtitle')}
                        </p>
                        <p className="text-secondary leading-relaxed mb-8">
                            {F_Get_Text('about.description')}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.key} className="text-center p-4 bg-secondary/10 rounded-lg">
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <p className="text-sm font-medium text-text-light dark:text-text-dark">
                                        {F_Get_Text(`about.stats.${stat.key}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                            <div className="text-8xl">👗</div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/30 rounded-2xl blur-2xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};
