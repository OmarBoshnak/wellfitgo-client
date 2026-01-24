/**
 * Image Uploader Utilities
 * @description Upload handling with progress tracking
 */

// ============================================================================
// Types
// ============================================================================

export interface UploadOptions {
    /** Maximum file size in bytes (default: 5MB) */
    maxFileSize?: number;
    /** Allowed MIME types */
    allowedTypes?: string[];
    /** Upload endpoint URL */
    endpoint?: string;
    /** Additional headers */
    headers?: Record<string, string>;
    /** Progress callback */
    onProgress?: (progress: number) => void;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    fileId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============================================================================
// Utilities
// ============================================================================

/**
 * Validate file before upload
 */
export const validateFile = (
    fileSize: number,
    options: UploadOptions = {}
): { isValid: boolean; error?: string } => {
    const maxSize = options.maxFileSize || DEFAULT_MAX_FILE_SIZE;

    if (fileSize > maxSize) {
        const maxMB = maxSize / (1024 * 1024);
        return {
            isValid: false,
            error: `حجم الملف يتجاوز الحد المسموح (${maxMB}MB)`,
        };
    }

    return { isValid: true };
};

/**
 * Get file info from URI
 */
export const getFileInfo = async (
    uri: string
): Promise<{ size: number; name: string; type: string } | null> => {
    try {
        const { getInfoAsync } = await import('expo-file-system');
        const info = await getInfoAsync(uri);

        if (!info.exists) {
            return null;
        }

        // Extract filename from URI
        const name = uri.split('/').pop() || 'image.jpg';

        // Determine type from extension
        const extension = name.split('.').pop()?.toLowerCase();
        const typeMap: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
        };

        return {
            size: info.size || 0,
            name,
            type: typeMap[extension || ''] || 'image/jpeg',
        };
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
};

/**
 * Create form data for upload
 */
export const createFormData = (
    uri: string,
    fieldName: string = 'file',
    additionalData?: Record<string, string>
): FormData => {
    const formData = new FormData();

    // Extract filename
    const filename = uri.split('/').pop() || 'image.jpg';
    const extension = filename.split('.').pop()?.toLowerCase();
    const type = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Append file
    formData.append(fieldName, {
        uri,
        name: filename,
        type,
    } as unknown as Blob);

    // Append additional data
    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    return formData;
};

/**
 * Upload file with progress tracking
 * Uses XMLHttpRequest for progress support
 */
export const uploadFile = (
    uri: string,
    endpoint: string,
    options: UploadOptions = {}
): Promise<UploadResult> => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        const formData = createFormData(uri, 'avatar');

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && options.onProgress) {
                const progress = (event.loaded / event.total) * 100;
                options.onProgress(progress);
            }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        success: true,
                        url: response.url || response.data?.url,
                        fileId: response.id || response.data?.id,
                    });
                } catch {
                    resolve({
                        success: true,
                        url: xhr.responseText,
                    });
                }
            } else {
                resolve({
                    success: false,
                    error: `Upload failed with status ${xhr.status}`,
                });
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            resolve({
                success: false,
                error: 'Network error during upload',
            });
        });

        xhr.addEventListener('abort', () => {
            resolve({
                success: false,
                error: 'Upload cancelled',
            });
        });

        // Open and send
        xhr.open('POST', endpoint);

        // Add headers
        if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.send(formData);
    });
};

/**
 * Upload avatar with progress (mock implementation)
 * Replace with actual API call when backend is ready
 */
export const uploadAvatar = async (
    uri: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult> => {
    // Validate file
    const fileInfo = await getFileInfo(uri);
    if (fileInfo) {
        const validation = validateFile(fileInfo.size);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }
    }

    // Simulate upload with progress
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                clearInterval(interval);
                onProgress?.(100);

                // Return the local URI as mock response
                resolve({
                    success: true,
                    url: uri,
                    fileId: `avatar-${Date.now()}`,
                });
            } else {
                onProgress?.(Math.min(progress, 95));
            }
        }, 150);
    });
};

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = async (fileId: string): Promise<boolean> => {
    try {
        // API call will go here
        // await api.delete(`/files/${fileId}`);
        console.log('File deleted:', fileId);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
