/**
 * Image Resizer Utilities
 * @description Avatar resizing and optimization
 */

// ============================================================================
// Types
// ============================================================================

export interface ResizeOptions {
    width: number;
    height?: number;
    quality?: number; // 0-1
    format?: 'jpeg' | 'png';
    maintainAspectRatio?: boolean;
}

export interface ResizeResult {
    uri: string;
    width: number;
    height: number;
    fileSize?: number;
}

// ============================================================================
// Constants
// ============================================================================

const AVATAR_SIZES = {
    thumbnail: 50,
    small: 100,
    medium: 200,
    large: 400,
    original: 800,
};

const DEFAULT_QUALITY = 0.8;

// ============================================================================
// Resize Functions
// ============================================================================

/**
 * Resize image to specific dimensions
 */
export const resizeImage = async (
    uri: string,
    options: ResizeOptions
): Promise<ResizeResult> => {
    const { width, quality = DEFAULT_QUALITY, format = 'jpeg' } = options;

    try {
        // Dynamic import to avoid crash if native module isn't linked
        const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

        const result = await manipulateAsync(
            uri,
            [{ resize: { width } }],
            {
                compress: quality,
                format: format === 'jpeg' ? SaveFormat.JPEG : SaveFormat.PNG,
            }
        );

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.warn('Image resize failed, returning original:', error);
        return {
            uri,
            width: options.width,
            height: options.height || options.width,
        };
    }
};

/**
 * Resize image for avatar use
 */
export const resizeForAvatar = async (
    uri: string,
    size: keyof typeof AVATAR_SIZES = 'large'
): Promise<ResizeResult> => {
    const targetSize = AVATAR_SIZES[size];

    return resizeImage(uri, {
        width: targetSize,
        height: targetSize,
        quality: 0.85,
        format: 'jpeg',
    });
};

/**
 * Create multiple sizes for responsive display
 */
export const createResponsiveSizes = async (
    uri: string
): Promise<Record<keyof typeof AVATAR_SIZES, ResizeResult>> => {
    const results: Record<string, ResizeResult> = {};

    for (const [sizeName, dimension] of Object.entries(AVATAR_SIZES)) {
        try {
            results[sizeName] = await resizeImage(uri, {
                width: dimension,
                quality: 0.8,
                format: 'jpeg',
            });
        } catch (error) {
            console.warn(`Failed to create ${sizeName} size:`, error);
        }
    }

    return results as Record<keyof typeof AVATAR_SIZES, ResizeResult>;
};

/**
 * Crop image to square (for avatar)
 */
export const cropToSquare = async (
    uri: string,
    size?: number
): Promise<ResizeResult> => {
    try {
        const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
        const { Image } = require('react-native');

        // Get original dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            Image.getSize(
                uri,
                (width: number, height: number) => resolve({ width, height }),
                (error: Error) => reject(error)
            );
        });

        const minDimension = Math.min(dimensions.width, dimensions.height);
        const originX = (dimensions.width - minDimension) / 2;
        const originY = (dimensions.height - minDimension) / 2;

        // Crop to square
        let result = await manipulateAsync(
            uri,
            [
                {
                    crop: {
                        originX,
                        originY,
                        width: minDimension,
                        height: minDimension,
                    },
                },
            ],
            { compress: 0.9, format: SaveFormat.JPEG }
        );

        // Resize if size specified
        if (size && size < minDimension) {
            result = await manipulateAsync(
                result.uri,
                [{ resize: { width: size } }],
                { compress: 0.85, format: SaveFormat.JPEG }
            );
        }

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.warn('Crop to square failed:', error);
        return { uri, width: size || 400, height: size || 400 };
    }
};

/**
 * Calculate optimal size based on container
 */
export const getOptimalSize = (
    containerWidth: number,
    pixelRatio: number = 2
): keyof typeof AVATAR_SIZES => {
    const targetSize = containerWidth * pixelRatio;

    if (targetSize <= 50) return 'thumbnail';
    if (targetSize <= 100) return 'small';
    if (targetSize <= 200) return 'medium';
    if (targetSize <= 400) return 'large';
    return 'original';
};

/**
 * Estimate file size after compression
 */
export const estimateCompressedSize = (
    originalSize: number,
    quality: number
): number => {
    // Rough estimate - actual size depends on image content
    const compressionFactor = quality * 0.5 + 0.3;
    return Math.round(originalSize * compressionFactor);
};
