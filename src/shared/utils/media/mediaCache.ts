/**
 * Media Cache Utilities
 * @description Local caching for media files using AsyncStorage
 * 
 * Note: This is a simplified implementation. The full implementation with
 * file system caching can be enabled once expo-file-system types are resolved.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export interface CacheEntry {
    uri: string;
    localPath: string;
    timestamp: number;
    size: number;
    type: 'image' | 'voice';
}

export interface CacheStats {
    totalSize: number;
    itemCount: number;
    oldestEntry: number | null;
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_KEY = 'chat_media_cache';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// Cache Entry Management
// ============================================================================

/**
 * Get all cache entries
 */
const getCacheEntries = async (): Promise<Map<string, CacheEntry>> => {
    try {
        const data = await AsyncStorage.getItem(CACHE_KEY);
        if (!data) return new Map();
        const entries = JSON.parse(data) as [string, CacheEntry][];
        return new Map(entries);
    } catch {
        return new Map();
    }
};

/**
 * Save cache entries
 */
const saveCacheEntries = async (entries: Map<string, CacheEntry>): Promise<void> => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([...entries]));
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if media is cached (metadata only)
 */
export const isMediaCached = async (remoteUri: string): Promise<boolean> => {
    const entries = await getCacheEntries();
    const entry = entries.get(remoteUri);

    if (!entry) return false;

    if (Date.now() - entry.timestamp > MAX_CACHE_AGE) {
        entries.delete(remoteUri);
        await saveCacheEntries(entries);
        return false;
    }

    return true;
};

/**
 * Get cached media URI
 * Returns the original URI since we're not doing file system caching
 */
export const getCachedMediaUri = async (remoteUri: string): Promise<string | null> => {
    const entries = await getCacheEntries();
    const entry = entries.get(remoteUri);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > MAX_CACHE_AGE) {
        return null;
    }

    // Return local path if cached, otherwise original URI
    return entry.localPath || remoteUri;
};

/**
 * Cache media file (metadata only in this simplified version)
 * Returns the original URI - actual file caching requires expo-file-system
 */
export const cacheMedia = async (
    remoteUri: string,
    type: 'image' | 'voice'
): Promise<string> => {
    const entries = await getCacheEntries();
    entries.set(remoteUri, {
        uri: remoteUri,
        localPath: remoteUri, // Using original URI for now
        timestamp: Date.now(),
        size: 0,
        type,
    });
    await saveCacheEntries(entries);

    return remoteUri;
};

/**
 * Cache local media file
 */
export const cacheLocalMedia = async (
    localUri: string,
    type: 'image' | 'voice'
): Promise<string> => {
    const entries = await getCacheEntries();
    entries.set(localUri, {
        uri: localUri,
        localPath: localUri,
        timestamp: Date.now(),
        size: 0,
        type,
    });
    await saveCacheEntries(entries);

    return localUri;
};

/**
 * Remove cached media
 */
export const removeCachedMedia = async (remoteUri: string): Promise<void> => {
    const entries = await getCacheEntries();
    entries.delete(remoteUri);
    await saveCacheEntries(entries);
};

/**
 * Clear all cached media
 */
export const clearMediaCache = async (): Promise<void> => {
    await AsyncStorage.removeItem(CACHE_KEY);
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<CacheStats> => {
    const entries = await getCacheEntries();
    let totalSize = 0;
    let oldestEntry: number | null = null;

    for (const entry of entries.values()) {
        totalSize += entry.size;
        if (oldestEntry === null || entry.timestamp < oldestEntry) {
            oldestEntry = entry.timestamp;
        }
    }

    return {
        totalSize,
        itemCount: entries.size,
        oldestEntry,
    };
};

/**
 * Format cache size for display
 */
export const formatCacheSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
