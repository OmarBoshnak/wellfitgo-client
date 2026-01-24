/**
 * Backend API Service
 * @description Handles communication with the Node.js backend
 */

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wellfitgo-backend-97b72a680866.herokuapp.com';

export interface BackendResponse {
  success?: boolean;
  message?: string;
  forceLogout?: boolean;
  redirectTo?: string;
  data?: any;
  error?: string;
}

// ============================================================================
// Enhanced Auth Types
// ============================================================================

export interface RoutingDecision {
  destination: string;
  reason: string;
  requiresAction: boolean;
}

export interface EnhancedSyncRequest {
  appwriteId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  provider?: 'phone' | 'google' | 'facebook' | 'apple' | 'appwrite';
}

export interface EnhancedSyncResponse extends BackendResponse {
  data?: {
    user: {
      id: string;
      role: 'client' | 'doctor' | 'admin';
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
      onboardingCompleted: boolean;
      healthProfileCompleted: boolean;
      subscriptionStatus?: string;
      isFirstLogin: boolean;
    };
    token: string;
    routing: RoutingDecision;
  };
}

// ============================================================================
// Generic API Call
// ============================================================================

/**
 * Generic API call with force logout handling
 */
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<BackendResponse> => {
  try {
    const url = `${BACKEND_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization token if provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[Backend API] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle force logout scenario
    if (response.status === 401 && data.forceLogout) {
      console.log('⚠️ Account deleted from Appwrite, forcing logout');

      // Import here to avoid circular dependencies
      const { clearAuthData } = await import('@/src/shared/services/storage/asyncStorage');
      const { clearSession } = await import('@/src/shared/services/storage/secureStorage');

      // Clear all auth data
      await clearAuthData();
      await clearSession();

      // Return special response to trigger navigation
      return {
        ...data,
        forceLogout: true,
        redirectTo: 'login'
      };
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[Backend API] Error:', error);
    throw error;
  }
};

// ============================================================================
// Authentication Endpoints
// ============================================================================

/**
 * Enhanced Sync - main auth endpoint with intelligent routing
 */
export const enhancedSync = async (
  request: EnhancedSyncRequest
): Promise<EnhancedSyncResponse> => {
  return apiCall('/api/auth/enhanced-sync', {
    method: 'POST',
    body: JSON.stringify(request),
  }) as Promise<EnhancedSyncResponse>;
};

/**
 * OAuth login - legacy endpoint (kept for backwards compatibility)
 */
export const oauthLogin = async (
  email: string,
  firstName: string,
  lastName: string,
  avatar?: string,
  provider: string = 'google',
  appwriteId?: string
): Promise<BackendResponse> => {
  return apiCall('/api/auth/oauth', {
    method: 'POST',
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      avatar,
      provider,
      appwriteId,
    }),
  });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (token: string): Promise<BackendResponse> => {
  return apiCall('/api/auth/me', {}, token);
};

/**
 * Get required setup steps for current user
 */
export const getRequiredSetup = async (token: string): Promise<BackendResponse> => {
  return apiCall('/api/auth/required-setup', {}, token);
};

/**
 * Mark a setup step as complete
 */
export const completeSetup = async (
  stepId: string,
  data: Record<string, unknown> | undefined,
  token: string
): Promise<BackendResponse> => {
  return apiCall('/api/auth/complete-setup', {
    method: 'POST',
    body: JSON.stringify({ stepId, data }),
  }, token);
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  role: string,
  token: string
): Promise<BackendResponse> => {
  return apiCall(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }, token);
};

/**
 * Delete user account
 */
export const deleteAccount = async (
  appwriteUserId: string,
  token: string
): Promise<BackendResponse> => {
  return apiCall('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ appwriteUserId }),
  }, token);
};

export default {
  apiCall,
  enhancedSync,
  oauthLogin,
  getCurrentUser,
  getRequiredSetup,
  completeSetup,
  updateUserRole,
  deleteAccount,
};

