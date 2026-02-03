export const F_File_To_Base64 = (p_file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(p_file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const F_Validate_Image_File = (p_file: File): boolean => {
    const valid_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/tiff'];
    return valid_types.includes(p_file.type);
};
