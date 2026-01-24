/**
 * Secure Storage Service
 * @description Wrapper for expo-secure-store to handle sensitive data
 */

import * as SecureStore from 'expo-secure-store';

// ============================================================================
// Secure Storage Keys (sensitive data only)
// ============================================================================

const SECURE_KEYS = {
    SESSION_ID: 'session_id',
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;

type SecureKey = typeof SECURE_KEYS[keyof typeof SECURE_KEYS];

// ============================================================================
// Secure Storage Operations
// ============================================================================

/**
 * Save a value to secure storage
 */
export async function setSecureItem(key: SecureKey, value: string): Promise<boolean> {
    try {
        await SecureStore.setItemAsync(key, value);
        return true;
    } catch (error) {
        console.error(`[SecureStorage] Failed to save ${key}:`, error);
        return false;
    }
}

/**
 * Get a value from secure storage
 */
export async function getSecureItem(key: SecureKey): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`[SecureStorage] Failed to get ${key}:`, error);
        return null;
    }
}

/**
 * Delete a value from secure storage
 */
export async function deleteSecureItem(key: SecureKey): Promise<boolean> {
    try {
        await SecureStore.deleteItemAsync(key);
        return true;
    } catch (error) {
        console.error(`[SecureStorage] Failed to delete ${key}:`, error);
        return false;
    }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Save session credentials
 */
export async function saveSession(sessionId: string, authToken?: string): Promise<boolean> {
    const sessionSaved = await setSecureItem(SECURE_KEYS.SESSION_ID, sessionId);

    if (authToken) {
        await setSecureItem(SECURE_KEYS.AUTH_TOKEN, authToken);
    }

    return sessionSaved;
}

/**
 * Get stored session ID
 */
export async function getSessionId(): Promise<string | null> {
    return getSecureItem(SECURE_KEYS.SESSION_ID);
}

/**
 * Get stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
    return getSecureItem(SECURE_KEYS.AUTH_TOKEN);
}

/**
 * Clear all session data
 */
export async function clearSession(): Promise<void> {
    await Promise.all([
        deleteSecureItem(SECURE_KEYS.SESSION_ID),
        deleteSecureItem(SECURE_KEYS.AUTH_TOKEN),
        deleteSecureItem(SECURE_KEYS.REFRESH_TOKEN),
    ]);
    console.log('[SecureStorage] Session cleared');
}

// ============================================================================
// Export Keys for Reference
// ============================================================================

export { SECURE_KEYS };
