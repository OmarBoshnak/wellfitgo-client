/**
 * Image Cache Utilities
 * @description Local avatar caching for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export interface CachedImage {
    uri: string;
    cachedAt: number;
    expiresAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_PREFIX = '@image_cache:';
const DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// Cache Functions
// ============================================================================

/**
 * Get cache key for an image
 */
const getCacheKey = (imageId: string): string => {
    return `${CACHE_PREFIX}${imageId}`;
};

/**
 * Cache an image URI
 */
export const cacheImage = async (
    imageId: string,
    uri: string,
    expiryMs: number = DEFAULT_EXPIRY
): Promise<boolean> => {
    try {
        const now = Date.now();
        const cached: CachedImage = {
            uri,
            cachedAt: now,
            expiresAt: now + expiryMs,
        };

        await AsyncStorage.setItem(getCacheKey(imageId), JSON.stringify(cached));
        return true;
    } catch (error) {
        console.error('Error caching image:', error);
        return false;
    }
};

/**
 * Get cached image
 */
export const getCachedImage = async (imageId: string): Promise<string | null> => {
    try {
        const cached = await AsyncStorage.getItem(getCacheKey(imageId));
        if (!cached) return null;

        const parsed: CachedImage = JSON.parse(cached);

        // Check if expired
        if (Date.now() > parsed.expiresAt) {
            await removeCachedImage(imageId);
            return null;
        }

        return parsed.uri;
    } catch (error) {
        console.error('Error getting cached image:', error);
        return null;
    }
};

/**
 * Remove cached image
 */
export const removeCachedImage = async (imageId: string): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(getCacheKey(imageId));
        return true;
    } catch (error) {
        console.error('Error removing cached image:', error);
        return false;
    }
};

/**
 * Clear all cached images
 */
export const clearImageCache = async (): Promise<boolean> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

        if (cacheKeys.length > 0) {
            await AsyncStorage.multiRemove(cacheKeys);
        }

        return true;
    } catch (error) {
        console.error('Error clearing image cache:', error);
        return false;
    }
};

/**
 * Get cache size (number of cached images)
 */
export const getCacheSize = async (): Promise<number> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        return keys.filter((key) => key.startsWith(CACHE_PREFIX)).length;
    } catch (error) {
        console.error('Error getting cache size:', error);
        return 0;
    }
};

/**
 * Remove expired images from cache
 */
export const pruneExpiredCache = async (): Promise<number> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

        let removedCount = 0;
        const now = Date.now();

        for (const key of cacheKeys) {
            const cached = await AsyncStorage.getItem(key);
            if (cached) {
                const parsed: CachedImage = JSON.parse(cached);
                if (now > parsed.expiresAt) {
                    await AsyncStorage.removeItem(key);
                    removedCount++;
                }
            }
        }

        return removedCount;
    } catch (error) {
        console.error('Error pruning cache:', error);
        return 0;
    }
};

/**
 * Cache avatar specifically
 */
export const cacheAvatar = async (userId: string, uri: string): Promise<boolean> => {
    return cacheImage(`avatar_${userId}`, uri);
};

/**
 * Get cached avatar
 */
export const getCachedAvatar = async (userId: string): Promise<string | null> => {
    return getCachedImage(`avatar_${userId}`);
};

/**
 * Remove cached avatar
 */
export const removeCachedAvatar = async (userId: string): Promise<boolean> => {
    return removeCachedImage(`avatar_${userId}`);
};
