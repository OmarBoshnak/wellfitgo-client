/**
 * Async Storage Service
 * @description Wrapper for AsyncStorage to handle non-sensitive persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from '@/src/shared/types/auth';

// ============================================================================
// Generic Storage Operations
// ============================================================================

/**
 * Save a string value to AsyncStorage
 */
export async function setItem(key: string, value: string): Promise<boolean> {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`[AsyncStorage] Failed to save ${key}:`, error);
        return false;
    }
}

/**
 * Get a string value from AsyncStorage
 */
export async function getItem(key: string): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error(`[AsyncStorage] Failed to get ${key}:`, error);
        return null;
    }
}

/**
 * Save an object to AsyncStorage (JSON serialized)
 */
export async function setObject<T>(key: string, value: T): Promise<boolean> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`[AsyncStorage] Failed to save object ${key}:`, error);
        return false;
    }
}

/**
 * Get an object from AsyncStorage (JSON parsed)
 */
export async function getObject<T>(key: string): Promise<T | null> {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`[AsyncStorage] Failed to get object ${key}:`, error);
        return null;
    }
}

/**
 * Remove a value from AsyncStorage
 */
export async function removeItem(key: string): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`[AsyncStorage] Failed to remove ${key}:`, error);
        return false;
    }
}

/**
 * Remove multiple values from AsyncStorage
 */
export async function removeItems(keys: string[]): Promise<boolean> {
    try {
        await AsyncStorage.multiRemove(keys);
        return true;
    } catch (error) {
        console.error('[AsyncStorage] Failed to remove items:', error);
        return false;
    }
}

// ============================================================================
// Auth-specific Operations
// ============================================================================

/**
 * Check if onboarding has been completed
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
    const value = await getItem(AUTH_STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
}

/**
 * Mark onboarding as completed
 */
export async function setOnboardingCompleted(): Promise<boolean> {
    return setItem(AUTH_STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
}

/**
 * Check if health history has been completed
 */
export async function hasCompletedHealthHistory(): Promise<boolean> {
    const value = await getItem(AUTH_STORAGE_KEYS.HEALTH_HISTORY_COMPLETED);
    return value === 'true';
}

/**
 * Mark health history as completed
 */
export async function setHealthHistoryCompleted(): Promise<boolean> {
    return setItem(AUTH_STORAGE_KEYS.HEALTH_HISTORY_COMPLETED, 'true');
}

/**
 * Check if user is first time
 */
export async function isFirstTimeUser(): Promise<boolean> {
    const value = await getItem(AUTH_STORAGE_KEYS.IS_FIRST_TIME);
    // Default to true if not set
    return value !== 'false';
}

/**
 * Mark user as not first time
 */
export async function setNotFirstTimeUser(): Promise<boolean> {
    return setItem(AUTH_STORAGE_KEYS.IS_FIRST_TIME, 'false');
}

/**
 * Get stored user ID
 */
export async function getUserId(): Promise<string | null> {
    return getItem(AUTH_STORAGE_KEYS.USER_ID);
}

/**
 * Save user ID
 */
export async function setUserId(userId: string): Promise<boolean> {
    return setItem(AUTH_STORAGE_KEYS.USER_ID, userId);
}

/**
 * Get stored backend user ID
 */
export async function getBackendUserId(): Promise<string | null> {
    return getItem(AUTH_STORAGE_KEYS.BACKEND_USER_ID);
}

/**
 * Save backend user ID
 */
export async function setBackendUserId(userId: string): Promise<boolean> {
    return setItem(AUTH_STORAGE_KEYS.BACKEND_USER_ID, userId);
}

/**
 * Clear all auth-related AsyncStorage data
 */
export async function clearAuthData(): Promise<void> {
    await removeItems([
        AUTH_STORAGE_KEYS.USER_ID,
        AUTH_STORAGE_KEYS.BACKEND_USER_ID,
        // Note: We intentionally keep ONBOARDING_COMPLETED and HEALTH_HISTORY_COMPLETED
        // so returning users don't have to repeat these steps
    ]);
    console.log('[AsyncStorage] Auth data cleared');
}

/**
 * Clear ALL app data (for complete reset)
 */
export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.clear();
        console.log('[AsyncStorage] All data cleared');
    } catch (error) {
        console.error('[AsyncStorage] Failed to clear all data:', error);
    }
}
