import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';

export const F_New_Product_Page: React.FC = () => {
    const navigate = useNavigate();

    // State for form
    const [formData, setFormData] = useState({
        gender: 'female',
        body_type: 'average',
        fit: 'regular',
        background: 'orange',
        accessory: 'glasses',
        age: 25,
        description: ''
    });

    const F_Handle_Change = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const F_Handle_Submit = (p_event: React.FormEvent) => {
        p_event.preventDefault();
        console.log('Creating product:', formData);
        // Mock creation and redirect
        const mockId = Math.random().toString(36).substring(7);
        navigate(`/product/${mockId}`);
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-2xl mx-auto">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/collection')}
                    className="text-primary hover:underline font-medium mb-6 flex items-center gap-2"
                >
                    {F_Get_Text('new_product.back_to_collection')}
                </button>

                {/* Title */}
                <F_Text p_variant="h1" p_class_name="mb-8 text-center text-text-light dark:text-text-dark">
                    {F_Get_Text('new_product.title')}
                </F_Text>

                {/* Form Card */}
                <div className="bg-white dark:bg-bg-dark rounded-xl shadow-lg border border-secondary/20 p-8">
                    <form onSubmit={F_Handle_Submit} className="space-y-8">

                        {/* 1. Media Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.upload.front')}
                                </label>
                                <div className="border-2 border-dashed border-secondary/40 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/5">
                                    <span className="text-secondary text-sm">
                                        {F_Get_Text('new_product.upload.select_file')}
                                    </span>
                                    <input type="file" className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.upload.back')}
                                </label>
                                <div className="border-2 border-dashed border-secondary/40 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/5">
                                    <span className="text-secondary text-sm">
                                        {F_Get_Text('new_product.upload.select_file')}
                                    </span>
                                    <input type="file" className="hidden" />
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <hr className="border-secondary/20" />

                        {/* 2. Model & Product Selections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.gender')}
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="female">{F_Get_Text('new_product.options.gender.female')}</option>
                                    <option value="male">{F_Get_Text('new_product.options.gender.male')}</option>
                                </select>
                            </div>

                            {/* Body Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.body_type')}
                                </label>
                                <select
                                    name="body_type"
                                    value={formData.body_type}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="slim">{F_Get_Text('new_product.options.body_type.slim')}</option>
                                    <option value="average">{F_Get_Text('new_product.options.body_type.average')}</option>
                                    <option value="plus_size">{F_Get_Text('new_product.options.body_type.plus_size')}</option>
                                </select>
                            </div>

                            {/* Fit */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.fit')}
                                </label>
                                <select
                                    name="fit"
                                    value={formData.fit}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="slim">{F_Get_Text('new_product.options.fit.slim')}</option>
                                    <option value="regular">{F_Get_Text('new_product.options.fit.regular')}</option>
                                    <option value="oversized">{F_Get_Text('new_product.options.fit.oversized')}</option>
                                </select>
                            </div>

                            {/* Background */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.background')}
                                </label>
                                <select
                                    name="background"
                                    value={formData.background}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="black">{F_Get_Text('new_product.options.background.black')}</option>
                                    <option value="white">{F_Get_Text('new_product.options.background.white')}</option>
                                    <option value="orange">{F_Get_Text('new_product.options.background.orange')}</option>
                                    <option value="cafe">{F_Get_Text('new_product.options.background.cafe')}</option>
                                    <option value="urban">{F_Get_Text('new_product.options.background.urban')}</option>
                                </select>
                            </div>

                            {/* Accessory */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.accessory')}
                                </label>
                                <select
                                    name="accessory"
                                    value={formData.accessory}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="none">{F_Get_Text('new_product.options.accessory.none')}</option>
                                    <option value="bag">{F_Get_Text('new_product.options.accessory.bag')}</option>
                                    <option value="glasses">{F_Get_Text('new_product.options.accessory.glasses')}</option>
                                    <option value="wallet">{F_Get_Text('new_product.options.accessory.wallet')}</option>
                                    <option value="car_key">{F_Get_Text('new_product.options.accessory.car_key')}</option>
                                </select>
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.age')}
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    min={10}
                                    max={50}
                                    value={formData.age}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* 3. Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary">
                                {F_Get_Text('new_product.labels.description')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={F_Handle_Change}
                                rows={4}
                                placeholder={F_Get_Text('new_product.placeholders.description')}
                                className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <F_Button
                                p_label={F_Get_Text('new_product.generate_button')}
                                p_type="submit"
                                p_variant="primary"
                                p_class_name="w-full py-3 text-lg"
                            />
                        </div>

                    </form>
                </div>
            </div>
        </F_Main_Template>
    );
};
