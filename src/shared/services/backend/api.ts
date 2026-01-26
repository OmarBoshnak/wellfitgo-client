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

export interface ClientProfileResponse {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: string;
  age?: number;
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  startingWeight?: number;
  weightHistory?: {
    date: string;
    weight: number;
    timestamp: number;
  }[];
  goal?: string;
  activityLevel?: string;
  onboardingCompleted?: boolean;
  healthProfileCompleted?: boolean;
  subscriptionStatus?: string;
}

export interface IdealWeightResponse {
  idealWeightKg?: number;
  healthyWeightRangeKg?: {
    min: number;
    max: number;
  };
  message?: string;
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

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('[Backend API] Received HTML instead of JSON:', text.substring(0, 200));
      throw new Error(`Server returned HTML error page (status: ${response.status})`);
    }

    // Handle empty response
    const responseText = await response.text();
    if (!responseText) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return {};
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Backend API] JSON parse error:', parseError);
      console.error('[Backend API] Response text:', responseText.substring(0, 200));
      throw new Error(`Invalid JSON response from server: ${(parseError as Error).message}`);
    }

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

    // Handle other 401 errors (token expired, invalid, etc.)
    if (response.status === 401) {
      console.error('[Backend API] Authentication failed (401):', data);
      throw new Error(data.message || data.error || 'Authentication failed - please log in again');
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

/**
 * Save user health profile
 */
export const saveHealthProfile = async (
  data: Record<string, any>,
  token?: string
): Promise<BackendResponse> => {
  return apiCall('/api/auth/health-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
};

// ============================================================================
// Doctor & Booking APIs
// ============================================================================

/**
 * Get available doctors
 */
export const getAvailableDoctors = async (token?: string): Promise<BackendResponse> => {
  return apiCall('/api/patient/doctors', {}, token);
};

/**
 * Book a consultation call
 */
export const bookConsultationCall = async (
  data: {
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  },
  token?: string
): Promise<BackendResponse> => {
  return apiCall('/api/patient/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
};

/**
 * Assign a doctor to a client for chat
 */
export const assignChatDoctor = async (
  clientId: string,
  doctorId: string,
  token?: string
): Promise<BackendResponse> => {
  return apiCall('/api/patient/assign-doctor', {
    method: 'POST',
    body: JSON.stringify({ clientId, doctorId }),
  }, token);
};

/**
 * Update client profile (self)
 */
export const updateClientProfile = async (
  data: Record<string, any>,
  token?: string
): Promise<BackendResponse> => {
  return apiCall('/api/clients/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
};

/**
 * Get client profile (self)
 */
export const getClientProfile = async (
  token?: string
): Promise<ClientProfileResponse> => {
  return apiCall('/api/clients/profile', {}, token) as Promise<ClientProfileResponse>;
};

/**
 * Get ideal weight for current client (based on height)
 */
export const getIdealWeight = async (
  token?: string
): Promise<IdealWeightResponse> => {
  return apiCall('/api/clients/ideal-weight', {}, token) as Promise<IdealWeightResponse>;
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  data: Record<string, any>,
  token?: string
): Promise<BackendResponse> => {
  return apiCall(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
  saveHealthProfile,
  getAvailableDoctors,
  bookConsultationCall,
  assignChatDoctor,
  updateUser,
  updateClientProfile,
  getClientProfile,
};


