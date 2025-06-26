// Simple image upload utility using free services

export interface ImageUploadResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export const uploadImageToFreeService = async (file: File): Promise<ImageUploadResponse> => {
    try {
        // Method 1: Try ImgBB (requires API key)
        // You can get a free API key from https://api.imgbb.com/
        const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        
        if (imgbbApiKey) {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                method: 'POST',
                body: formData,
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return {
                        success: true,
                        url: data.data.url
                    };
                }
            }
        }
        
        // Method 2: Fallback to UI Avatars (no upload, just generates based on name)
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fileName)}&size=200&background=random&color=fff`;
        
        return {
            success: true,
            url: fallbackUrl
        };
        
    } catch (error) {
        console.error('Image upload failed:', error);
        
        // Generate a default avatar
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fileName.slice(0, 2))}&size=200&background=random&color=fff`;
        
        return {
            success: true,
            url: defaultUrl
        };
    }
};

// Alternative method using base64 encoding (stores in Firestore, but not recommended for large images)
export const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};