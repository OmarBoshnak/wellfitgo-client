/**
 * Image Utilities Barrel Export
 * @description Centralized exports for image handling utilities
 */

// Image Uploader
export {
    validateFile,
    getFileInfo,
    createFormData,
    uploadFile,
    uploadAvatar,
    deleteUploadedFile,
} from './imageUploader';
export type { UploadOptions, UploadResult } from './imageUploader';

// Image Cache
export {
    cacheImage,
    getCachedImage,
    removeCachedImage,
    clearImageCache,
    getCacheSize,
    pruneExpiredCache,
    cacheAvatar,
    getCachedAvatar,
    removeCachedAvatar,
} from './imageCache';
export type { CachedImage } from './imageCache';

// Image Resizer
export {
    resizeImage,
    resizeForAvatar,
    createResponsiveSizes,
    cropToSquare,
    getOptimalSize,
    estimateCompressedSize,
} from './imageResizer';
export type { ResizeOptions, ResizeResult } from './imageResizer';
