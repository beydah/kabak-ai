import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { F_Main_Template } from '../../components/templates/main_template';
import { F_Text } from '../../components/atoms/text';
import { F_Button } from '../../components/atoms/button';
import { F_Get_Text } from '../../utils/i18n_utils';
import { F_File_Upload } from '../../components/molecules/file_upload';
import { F_Save_Product, F_Get_Product_By_Id, I_Product_Data } from '../../utils/storage_utils';
import { F_File_To_Base64 } from '../../utils/file_utils';

// Helper to convert base64 to file (if needed for preview, though we can use base64 directly in img src)
// For simplicity in this mock, we'll just use the base64 string for preview if no new file is selected.

export const F_New_Product_Page: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Check if in edit mode
    const is_edit_mode = !!id;

    // State for files (New uploads)
    const [front_file, set_front_file] = useState<File | null>(null);
    const [back_file, set_back_file] = useState<File | null>(null);

    // State for existing images (Edit mode)
    const [existing_front_image, set_existing_front_image] = useState<string | null>(null);
    const [existing_back_image, set_existing_back_image] = useState<string | null>(null);

    // State for form data
    const [form_data, set_form_data] = useState({
        gender: 'female',
        body_type: 'average',
        fit: 'regular',
        background: 'orange',
        accessory: 'glasses',
        age: 30,
        description: ''
    });

    // Load data if in edit mode
    useEffect(() => {
        if (is_edit_mode && id) {
            const product = F_Get_Product_By_Id(id);
            if (product) {
                set_form_data({
                    gender: product.gender,
                    body_type: product.body_type,
                    fit: product.fit,
                    background: product.background,
                    accessory: product.accessory,
                    age: product.age,
                    description: product.description
                });
                set_existing_front_image(product.front_image);
                set_existing_back_image(product.back_image);
            } else {
                alert("Product not found");
                navigate('/collection');
            }
        }
    }, [is_edit_mode, id, navigate]);

    const F_Handle_Change = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        set_form_data(prev => ({ ...prev, [name]: value }));
    };

    const F_Handle_Submit = async (p_event: React.FormEvent) => {
        p_event.preventDefault();

        // Validation: Must have at least one front image (new or existing)
        if (!front_file && !existing_front_image) {
            alert("Please upload a front photo.");
            return;
        }

        try {
            // Convert new images to Base64 if uploaded, else use existing
            let front_b64 = existing_front_image || '';
            if (front_file) {
                front_b64 = await F_File_To_Base64(front_file);
            }

            let back_b64 = existing_back_image || '';
            if (back_file) {
                back_b64 = await F_File_To_Base64(back_file);
            }

            const product_data: I_Product_Data = {
                id: is_edit_mode && id ? id : uuidv4(), // Keep ID if editing, else new UUID
                created_at: is_edit_mode ? (F_Get_Product_By_Id(id!)?.created_at || Date.now()) : Date.now(),
                front_image: front_b64,
                back_image: back_b64,
                ...form_data
            };

            // F_Save_Product handles updating if ID exists (we might need to tweak F_Save_Product to update correctly, 
            // currently it unshifts. Let's assume for now we need to handle update logic in storage_utils or here.
            // Since F_Save_Product just unshifts, let's just re-save. 
            // Ideally storage_utils should have F_Update_Product. 
            // For now, let's remove old and add new if editing to keep it simple, or update F_Save_Product logic.
            // Actually, let's update F_Save_Product to handle overwrite if ID exists? 
            // The user didn't ask to change storage logic explicitly but "Editing should feel identical".
            // Let's do a quick filter-remove then save to ensure no duplicates.

            if (is_edit_mode && id) {
                // Remove existing to replace
                // We will need to implement a cleaner update in a real app, but for this local storage mock:
                const all = JSON.parse(localStorage.getItem('kabak_ai_products') || '[]');
                const filtered = all.filter((p: any) => p.id !== id);
                filtered.unshift(product_data);
                localStorage.setItem('kabak_ai_products', JSON.stringify(filtered));
            } else {
                F_Save_Product(product_data);
            }

            navigate('/collection');

        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
        }
    };

    return (
        <F_Main_Template p_is_authenticated={true}>
            <div className="max-w-4xl mx-auto">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/collection')}
                    className="text-primary hover:underline font-medium mb-6 flex items-center gap-2"
                >
                    {F_Get_Text('new_product.back_to_collection')}
                </button>

                {/* Title */}
                <F_Text p_variant="h1" p_class_name="mb-8 text-center text-text-light dark:text-text-dark">
                    {is_edit_mode ? "Edit Product" : F_Get_Text('new_product.title')}
                    {/* Note: "Edit Product" string hardcoded for now, ideal to add to lang.json */}
                </F_Text>

                {/* Form Card */}
                <div className="bg-white dark:bg-bg-dark rounded-xl shadow-lg border border-secondary/20 p-6 md:p-8">
                    <form onSubmit={F_Handle_Submit} className="space-y-8">

                        {/* 1. Media Uploads (Side-by-Side) */}
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            {/* We need to handle File Upload component to show existing image if no new file is selected */}
                            {/* The current component takes a File object. We might need to pass a preview URL prop or similar. */}
                            {/* Let's modify usage or the component slightly? 
                                Actually, F_File_Upload expects a File. 
                                We can pass `p_initial_preview` prop? 
                                Or we can construct a File object from base64 (complex).
                                Let's pass `p_preview_url` to F_File_Upload. I'll need to update F_File_Upload prop interface.*/}

                            <F_File_Upload
                                p_label={F_Get_Text('new_product.upload.front')}
                                p_file={front_file}
                                p_on_change={set_front_file}
                                p_preview_url={existing_front_image || undefined}
                            />
                            <F_File_Upload
                                p_label={F_Get_Text('new_product.upload.back')}
                                p_file={back_file}
                                p_on_change={set_back_file}
                                p_preview_url={existing_back_image || undefined}
                            />
                        </div>

                        {/* Separator */}
                        <hr className="border-secondary/20" />

                        {/* 2. Model & Product Selections (Grid Layout) */}
                        <div className="grid grid-cols-2 gap-4 md:gap-6 gap-y-6">

                            {/* Row 1: Gender <-> Age */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.gender')}
                                </label>
                                <select
                                    name="gender"
                                    value={form_data.gender}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="female">{F_Get_Text('new_product.options.gender.female')}</option>
                                    <option value="male">{F_Get_Text('new_product.options.gender.male')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.age')}
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    min={10}
                                    max={50}
                                    value={form_data.age}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Row 2: Body Type <-> Fit */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.body_type')}
                                </label>
                                <select
                                    name="body_type"
                                    value={form_data.body_type}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="slim">{F_Get_Text('new_product.options.body_type.slim')}</option>
                                    <option value="average">{F_Get_Text('new_product.options.body_type.average')}</option>
                                    <option value="plus_size">{F_Get_Text('new_product.options.body_type.plus_size')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.fit')}
                                </label>
                                <select
                                    name="fit"
                                    value={form_data.fit}
                                    onChange={F_Handle_Change}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="slim">{F_Get_Text('new_product.options.fit.slim')}</option>
                                    <option value="regular">{F_Get_Text('new_product.options.fit.regular')}</option>
                                    <option value="oversized">{F_Get_Text('new_product.options.fit.oversized')}</option>
                                </select>
                            </div>

                            {/* Row 3: Background <-> Accessory */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.background')}
                                </label>
                                <select
                                    name="background"
                                    value={form_data.background}
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

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondary">
                                    {F_Get_Text('new_product.labels.accessory')}
                                </label>
                                <select
                                    name="accessory"
                                    value={form_data.accessory}
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
                        </div>

                        {/* 3. Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-secondary">
                                {F_Get_Text('new_product.labels.description')}
                            </label>
                            <textarea
                                name="description"
                                value={form_data.description}
                                onChange={F_Handle_Change}
                                rows={4}
                                placeholder={F_Get_Text('new_product.placeholders.description')}
                                className="w-full px-4 py-2 rounded-lg border border-secondary/40 bg-bg-light dark:bg-bg-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <F_Button
                                p_label={is_edit_mode ? "Update Product" : F_Get_Text('new_product.generate_button')}
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
