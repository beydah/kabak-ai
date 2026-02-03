import React from 'react';
import { F_Text } from '../atoms/text';
import { F_Get_Text } from '../../utils/i18n_utils';

const MODELS_DATA = ['text', 'image_analysis', 'image_gen', 'video'];

export const F_AI_Models_Section: React.FC = () => {
    return (
        <section id="ai-models" className="py-20 bg-secondary/5">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <F_Text p_variant="h1" p_class_name="mb-4">
                        {F_Get_Text('ai_models.title')}
                    </F_Text>
                    <p className="text-secondary text-lg max-w-3xl mx-auto">
                        {F_Get_Text('ai_models.subtitle')}
                    </p>
                </div>

                {/* Models Table */}
                <div className="overflow-x-auto mb-12">
                    <div className="min-w-full inline-block align-middle">
                        <div className="border border-secondary/20 rounded-2xl overflow-hidden bg-bg-light dark:bg-bg-dark shadow-sm">
                            <table className="min-w-full divide-y divide-secondary/20">
                                <thead className="bg-primary/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-light dark:text-text-dark">
                                            {F_Get_Text('ai_models.table.use_case')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                                            {F_Get_Text('ai_models.table.primary')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-light dark:text-text-dark">
                                            {F_Get_Text('ai_models.table.fallback')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-light dark:text-text-dark">
                                            {F_Get_Text('ai_models.table.cost')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-light dark:text-text-dark">
                                            {F_Get_Text('ai_models.table.description')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/20 bg-bg-light dark:bg-bg-dark">
                                    {MODELS_DATA.map((key) => (
                                        <tr key={key} className="hover:bg-secondary/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">
                                                {F_Get_Text(`ai_models.items.${key}.use_case`)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                                {F_Get_Text(`ai_models.items.${key}.primary`)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                                {F_Get_Text(`ai_models.items.${key}.fallback`)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">
                                                {F_Get_Text(`ai_models.items.${key}.cost`)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary max-w-xs">
                                                {F_Get_Text(`ai_models.items.${key}.description`)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pricing Note */}
                <div className="max-w-4xl mx-auto p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                    <p className="text-sm text-secondary">
                        ℹ️ {F_Get_Text('ai_models.pricing_note')}
                    </p>
                </div>
            </div>
        </section>
    );
};
