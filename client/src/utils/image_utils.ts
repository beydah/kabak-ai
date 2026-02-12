/**
 * Optimizes an image for Gemini 2.0/Imagen 4.0 API compliance.
 * Specs: 1024x1024, JPEG, 0.7 quality.
 * Returns both a Clean Base64 (no header) and the full Data URL for preview if needed.
 */
export const F_Prepare_Image_For_Gemini = (file: File): Promise<{ clean_base64: string, mime_type: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error("Canvas context failed"));
                    return;
                }

                // Fill white background (JPEG doesn't support transparency)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, 1024, 1024);

                // Calculate Aspect Ratio to "Contain" or "Cover"
                // For product transfer, "Contain" preserves whole item? 
                // "Cover" fills square? 
                // Let's use "Contain" to ensure the whole product is visible on the 1024x1024 canvas.
                // Center the image.
                const scale = Math.min(1024 / img.width, 1024 / img.height);
                const x = (1024 / 2) - (img.width / 2) * scale;
                const y = (1024 / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Export as JPEG 0.7
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                const clean_base64 = dataUrl.split(',')[1];

                resolve({ clean_base64, mime_type: 'image/jpeg' });
            };
            img.onerror = (err) => reject(new Error("Image load failed"));
        };
        reader.onerror = (err) => reject(new Error("File read failed"));
    });
};

// Deprecated alias for compatibility
export const F_Optimize_Image_For_Imagen = F_Prepare_Image_For_Gemini;

/**
 * Helper to optimize base64 string directly if File object not available
 */
export const F_Prepare_Base64_For_Gemini = (base64: string): Promise<{ clean_base64: string, mime_type: string }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Canvas context failed"));
                return;
            }

            // Fill white background (no alpha)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 1024, 1024);

            const scale = Math.min(1024 / img.width, 1024 / img.height);
            const x = (1024 / 2) - (img.width / 2) * scale;
            const y = (1024 / 2) - (img.height / 2) * scale;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            const clean_base64 = dataUrl.split(',')[1];

            resolve({ clean_base64, mime_type: 'image/jpeg' });
        };
        img.onerror = (err) => reject(new Error("Image load failed"));
    });
};

export const F_Optimize_Base64_For_Imagen = F_Prepare_Base64_For_Gemini;

export const F_File_To_Base64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
