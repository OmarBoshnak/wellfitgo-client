/**
 * Image Picker Utilities
 * @description Image selection and compression for chat
 */

import * as ImagePicker from 'expo-image-picker';

// ============================================================================
// Types
// ============================================================================

export interface ImagePickerResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
    fileSize?: number;
}

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1
    format?: 'jpeg' | 'png';
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COMPRESSION: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'jpeg',
};

// ============================================================================
// Permission Handling
// ============================================================================

/**
 * Request camera roll permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
};

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
};

// ============================================================================
// Image Picking
// ============================================================================

/**
 * Pick image from camera roll
 */
export const pickImageFromLibrary = async (
    options?: ImagePicker.ImagePickerOptions
): Promise<ImagePickerResult | null> => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
        throw new Error('Camera roll permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        base64: asset.base64 ?? undefined,
        fileSize: asset.fileSize,
    };
};

/**
 * Take photo with camera
 */
export const takePhoto = async (
    options?: ImagePicker.ImagePickerOptions
): Promise<ImagePickerResult | null> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        base64: asset.base64 ?? undefined,
        fileSize: asset.fileSize,
    };
};

// ============================================================================
// Image Compression
// ============================================================================

/**
 * Compress image for upload
 * Uses dynamic import to avoid crashing if native module isn't available
 */
export const compressImage = async (
    uri: string,
    options: CompressionOptions = DEFAULT_COMPRESSION
): Promise<ImagePickerResult> => {
    const { maxWidth = 1200, quality = 0.8, format = 'jpeg' } = options;

    try {
        // Dynamic import to avoid crash if native module isn't linked
        const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

        const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: maxWidth } }],
            {
                compress: quality,
                format: format === 'jpeg' ? SaveFormat.JPEG : SaveFormat.PNG,
            }
        );

        return {
            uri: manipResult.uri,
            width: manipResult.width,
            height: manipResult.height,
        };
    } catch (error) {
        // If compression fails (e.g., native module not available), return original
        console.warn('Image compression failed, using original:', error);
        const dimensions = await getImageDimensions(uri);
        return {
            uri,
            width: dimensions.width,
            height: dimensions.height,
        };
    }
};

/**
 * Pick and compress image in one step
 */
export const pickAndCompressImage = async (
    pickOptions?: ImagePicker.ImagePickerOptions,
    compressionOptions?: CompressionOptions
): Promise<ImagePickerResult | null> => {
    const picked = await pickImageFromLibrary(pickOptions);
    if (!picked) return null;

    return compressImage(picked.uri, compressionOptions);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get image dimensions from URI
 */
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const { Image } = require('react-native');
        Image.getSize(
            uri,
            (width: number, height: number) => resolve({ width, height }),
            (error: Error) => reject(error)
        );
    });
};

/**
 * Calculate aspect ratio for display
 */
export const calculateDisplayDimensions = (
    imageWidth: number,
    imageHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } => {
    const aspectRatio = imageWidth / imageHeight;

    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;

    if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
