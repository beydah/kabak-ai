import React, { useState, useEffect } from 'react';
import { F_Button } from '../../components/atoms/button';
import { F_File_Upload } from '../../components/molecules/file_upload';
import { I_Product_Data } from '../../utils/storage_utils';
import { F_Get_Text } from '../../utils/i18n_utils';
import { v4 as uuidv4 } from 'uuid';

interface Product_Form_Props {
    p_initial_data?: Partial<I_Product_Data>;
    p_on_submit: (data: Partial<I_Product_Data>, front: File | null, back: File | null) => Promise<void>;
    p_on_cancel: () => void;
    p_on_change?: (data: Partial<I_Product_Data>) => void;
    p_is_edit_mode?: boolean;
    p_submit_label?: string;
}

export const F_Product_Form: React.FC<Product_Form_Props> = ({
    p_initial_data,
    p_on_submit,
    p_on_cancel,
    p_on_change,
    p_is_edit_mode = false,
    p_submit_label
}) => {
    // State for files
    const [front_file, set_front_file] = useState<File | null>(null);
    const [back_file, set_back_file] = useState<File | null>(null);

    // State for form data
    const [form_data, set_form_data] = useState({
        gender: p_initial_data?.gender || 'female',
        age: p_initial_data?.age || 30,
        body_type: p_initial_data?.body_type || 'average',
        fit: p_initial_data?.fit || 'regular',
        background: p_initial_data?.background || 'orange',
        accessory: p_initial_data?.accessory || 'none',
        description: p_initial_data?.description || '',
    });

    useEffect(() => {
        if (p_initial_data) {
            set_form_data(prev => ({
                ...prev,
                gender: p_initial_data.gender || 'female',
                body_type: p_initial_data.body_type || 'average',
                fit: p_initial_data.fit || 'regular',
                background: p_initial_data.background || 'orange',
                accessory: p_initial_data.accessory || 'none',
                age: p_initial_data.age || 30,
                description: p_initial_data.description || ''
            }));
        }
    }, [p_initial_data]);

    const F_Handle_Change = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        set_form_data(prev => ({ ...prev, [name]: value }));
    };

    const F_Rename_File = (file: File, type: 'front' | 'back', productId: string): File => {
        const extension = file.name.split('.').pop();
        const newName = `${type}_raw_${productId}.${extension}`;
        return new File([file], newName, { type: file.type });
    };

    const F_Handle_Submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!front_file && !p_initial_data?.front_image) {
            alert(F_Get_Text('validation.required_images'));
            return;
        }

        if (!back_file && !p_initial_data?.back_image) {
            alert(F_Get_Text('validation.required_images'));
            return;
        }

        if (!form_data.description.trim()) {
            alert(F_Get_Text('validation.required_all'));
            return;
        }

        await p_on_submit(form_data, front_file, back_file);
    };

    return (
        <form onSubmit={F_Handle_Submit} className="space-y-6 max-w-[600px] mx-auto">

            {/* IMAGES: STRICT SIDE-BY-SIDE ON ALL SCREENS */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Front Photo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary ml-1">
                        {F_Get_Text('new_product.upload.front')} <span className="text-primary">*</span>
                    </label>
                    <div className="h-48">
                        <F_File_Upload
                            p_label="" // Handled by outer label
                            p_file={front_file}
                            p_on_change={set_front_file}
                            p_preview_url={p_initial_data?.front_image}
                        />
                    </div>
                </div>

                {/* Back Photo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary ml-1">
                        {F_Get_Text('new_product.upload.back')} <span className="text-primary">*</span>
                    </label>
                    <div className="h-48">
                        <F_File_Upload
                            p_label=""
                            p_file={back_file}
                            p_on_change={set_back_file}
                            p_preview_url={p_initial_data?.back_image}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-secondary/20" />

            {/* FORM GRID: More Compact */}
            <div className="grid grid-cols-2 gap-4">
                {/* Left Col */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.gender')}
                        </label>
                        <select
                            name="gender"
                            value={form_data.gender}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="female">{F_Get_Text('new_product.options.gender.female')}</option>
                            <option value="male">{F_Get_Text('new_product.options.gender.male')}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.body_type')}
                        </label>
                        <select
                            name="body_type"
                            value={form_data.body_type}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="slim">{F_Get_Text('new_product.options.body_type.slim')}</option>
                            <option value="average">{F_Get_Text('new_product.options.body_type.average')}</option>
                            <option value="plus_size">{F_Get_Text('new_product.options.body_type.plus_size')}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.background')}
                        </label>
                        <select
                            name="background"
                            value={form_data.background}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="black">{F_Get_Text('new_product.options.background.black')}</option>
                            <option value="white">{F_Get_Text('new_product.options.background.white')}</option>
                            <option value="orange">{F_Get_Text('new_product.options.background.orange')}</option>
                            <option value="cafe">{F_Get_Text('new_product.options.background.cafe')}</option>
                            <option value="urban">{F_Get_Text('new_product.options.background.urban')}</option>
                        </select>
                    </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.age')}
                        </label>
                        <input
                            type="number"
                            name="age"
                            min={10}
                            max={50}
                            value={form_data.age}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.fit')}
                        </label>
                        <select
                            name="fit"
                            value={form_data.fit}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="slim">{F_Get_Text('new_product.options.fit.slim')}</option>
                            <option value="regular">{F_Get_Text('new_product.options.fit.regular')}</option>
                            <option value="oversized">{F_Get_Text('new_product.options.fit.oversized')}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                            {F_Get_Text('new_product.labels.accessory')}
                        </label>
                        <select
                            name="accessory"
                            value={form_data.accessory}
                            onChange={F_Handle_Change}
                            className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="none">{F_Get_Text('new_product.options.accessory.none')}</option>
                            <option value="bag">{F_Get_Text('new_product.options.accessory.bag')}</option>
                            <option value="glasses">{F_Get_Text('new_product.options.accessory.glasses')}</option>
                            <option value="wallet">{F_Get_Text('new_product.options.accessory.wallet')}</option>
                            <option value="car_key">{F_Get_Text('new_product.options.accessory.car_key')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    {F_Get_Text('new_product.labels.description')}
                </label>
                <textarea
                    name="description"
                    value={form_data.description}
                    onChange={F_Handle_Change}
                    rows={3}
                    placeholder={F_Get_Text('new_product.placeholders.description')}
                    className="w-full px-3 py-2 rounded-lg border border-secondary/30 bg-bg-light dark:bg-bg-dark text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
                {p_is_edit_mode && (
                    <F_Button
                        p_label={F_Get_Text('product.cancel')}
                        p_type="button"
                        p_variant="secondary"
                        p_class_name="flex-1 py-2.5 text-sm"
                        p_on_click={p_on_cancel}
                    />
                )}
                <F_Button
                    p_label={p_submit_label || F_Get_Text('new_product.generate_button')}
                    p_type="submit"
                    p_variant="primary"
                    p_class_name="flex-1 py-2.5 text-sm font-medium"
                />
            </div>
        </form>
    );
};
