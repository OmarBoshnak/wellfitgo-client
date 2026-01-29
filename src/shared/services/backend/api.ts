/**
 * Backend API Service
 * @description Handles communication with the Node.js backend
 */

import { MealIngredient, WaterIntake, PlanProgress } from '@/src/shared/types/home';
import { DayMealStatus } from '@/src/shared/types/meals';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wellfitgo-backend-97b72a680866.herokuapp.com';

export interface BackendResponse {
  success?: boolean;
  message?: string;
  forceLogout?: boolean;
  redirectTo?: string;
  data?: any;
  error?: string;
}

export interface WaterIntakeResponse {
  waterIntake?: WaterIntake;
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
  waterIntake?: WaterIntake;
  planProgress?: PlanProgress;
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

export interface AssignedMealApiItem {
  id: string;
  name: string;
  nameAr?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string;
  isCompleted: boolean;
  notes?: string;
  items?: MealIngredient[];
}

export interface AssignedMealsResponse extends BackendResponse {
  data?: AssignedMealApiItem[];
}

export interface MealPlanSummaryResponse extends BackendResponse {
  data?: {
    doctor?: {
      id?: string;
      name?: string;
      nameAr?: string;
      avatarUrl?: string;
    } | null;
    mealsCompleted?: number;
    totalMeals?: number;
    planMealsCompleted?: number;
    planTotalMeals?: number;
  };
}

export interface MealHistoryResponse extends BackendResponse {
  data?: DayMealStatus[];
}

export interface MealCompletionApiItem {
  id?: string;
  mealId?: string;
  date?: string;
  completedAt?: number | null;
  selectedOptions?: Record<string, string[]>;
}

export interface MealCompletionsResponse extends BackendResponse {
  data?: {
    completions?: MealCompletionApiItem[];
    selections?: Record<string, Record<string, string[]>>;
  };
}

export interface UpsertMealCompletionResponse extends BackendResponse {
  data?: MealCompletionApiItem;
}

export interface ChatConversationResponse extends BackendResponse {
  data?: {
    id?: string;
    doctorId?: string;
    clientId?: string;
    name?: string;
    avatar?: string | null;
    isOnline?: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount?: number;
  };
}

export interface SendChatMessageResponse extends BackendResponse {
  data?: {
    _id?: string;
    conversationId?: string;
    senderId?: string;
    senderRole?: 'doctor' | 'client';
    content?: string;
    messageType?: 'text' | 'voice' | 'image' | 'document';
    mediaUrl?: string;
    mediaDuration?: number;
    meteringValues?: number[];
    createdAt?: string;
  };
}

export interface ChatMessageApiItem {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'doctor' | 'client';
  content: string;
  messageType: 'text' | 'voice' | 'image' | 'document';
  mediaUrl?: string;
  mediaDuration?: number;
  meteringValues?: number[];
  replyToId?: string;
  isDeleted: boolean;
  isEdited: boolean;
  isReadByDoctor: boolean;
  isReadByClient: boolean;
  createdAt: string;
}

export interface ChatMessagesResponse extends BackendResponse {
  data?: ChatMessageApiItem[];
  nextCursor?: string | null;
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
 * Get or create a chat conversation with a doctor
 */
export const getOrCreateConversation = async (
  doctorId: string,
  token?: string
): Promise<ChatConversationResponse> => {
  return apiCall('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ doctorId }),
  }, token) as Promise<ChatConversationResponse>;
};

/**
 * Send a chat message in a conversation
 */
export const sendChatMessage = async (
  conversationId: string,
  data: {
    content: string;
    messageType?: 'text' | 'voice' | 'image' | 'document';
    mediaUrl?: string;
    mediaDuration?: number;
    meteringValues?: number[];
    voiceMessage?: any; // Added for voice message details
    replyToId?: string;
  },
  token?: string
): Promise<SendChatMessageResponse> => {
  return apiCall(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, token) as Promise<SendChatMessageResponse>;
};

/**
 * Upload voice message to backend
 */
export const uploadVoiceMessage = async (
  uri: string,
  duration: number,
  token?: string
): Promise<{ success: boolean; url?: string; voiceMessage?: any; error?: string }> => {
  try {
    const formData = new FormData();
    // @ts-ignore
    formData.append('audio', {
      uri,
      name: 'voice_message.m4a',
      type: 'audio/m4a',
    });
    formData.append('duration', duration.toString());

    const url = `${BACKEND_URL}/api/chat/audio/upload-voice`;

    console.log('[Backend API] Uploading voice message to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        // 'Content-Type': 'multipart/form-data', // Let fetch set boundary automatically
      },
      body: formData,
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse upload response:', responseText);
      return { success: false, error: 'Invalid server response' };
    }

    if (!response.ok) {
      return { success: false, error: data.error || data.message || 'Upload failed' };
    }

    return {
      success: true,
      url: data.url,
      voiceMessage: data.voiceMessage
    };

  } catch (error) {
    console.error('Error uploading voice message:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get chat messages for a conversation (paginated)
 */
export const getChatMessages = async (
  conversationId: string,
  token?: string,
  cursor?: string,
  limit: number = 50
): Promise<ChatMessagesResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  params.append('limit', limit.toString());
  const query = params.toString();
  return apiCall(`/api/chat/conversations/${conversationId}/messages${query ? `?${query}` : ''}`, {}, token) as Promise<ChatMessagesResponse>;
};

/**
 * Mark all messages in a conversation as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  token?: string
): Promise<BackendResponse> => {
  return apiCall(`/api/chat/conversations/${conversationId}/read`, {
    method: 'PUT',
  }, token);
};

/**
 * Delete a message from a conversation
 */
export const deleteChatMessage = async (
  conversationId: string,
  messageId: string,
  token?: string
): Promise<BackendResponse> => {
  return apiCall(`/api/chat/messages/${messageId}`, {
    method: 'DELETE',
  }, token);
};

/**
 * Edit a message in a conversation
 */
export const editChatMessage = async (
  conversationId: string,
  messageId: string,
  data: {
    content: string;
  },
  token?: string
): Promise<BackendResponse> => {
  return apiCall(`/api/chat/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
 * Get water intake for current client
 */
export const getWaterIntake = async (
  token?: string
): Promise<WaterIntakeResponse> => {
  return apiCall('/api/clients/water-intake', {}, token) as Promise<WaterIntakeResponse>;
};

/**
 * Update water intake for current client
 */
export const updateWaterIntake = async (
  data: {
    delta?: number;
    current?: number;
    target?: number;
    glassSize?: number;
  },
  token?: string
): Promise<WaterIntakeResponse> => {
  return apiCall('/api/clients/water-intake', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token) as Promise<WaterIntakeResponse>;
};

/**
 * Get assigned meals for current client
 */
export const getAssignedMeals = async (
  token?: string,
  date?: string
): Promise<AssignedMealsResponse> => {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiCall(`/api/patient/meals/assigned${query}`, {}, token) as Promise<AssignedMealsResponse>;
};

/**
 * Get meal history for current client
 */
export const getMealHistory = async (
  token?: string,
  start?: string,
  end?: string
): Promise<MealHistoryResponse> => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  const query = params.toString();
  return apiCall(`/api/patient/meals/history${query ? `?${query}` : ''}`, {}, token) as Promise<MealHistoryResponse>;
};

/**
 * Get meal plan summary for current client
 */
export const getMealPlanSummary = async (
  token?: string,
  date?: string
): Promise<MealPlanSummaryResponse> => {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiCall(`/api/patient/meals/summary${query}`, {}, token) as Promise<MealPlanSummaryResponse>;
};

/**
 * Get meal completions + selections for a date
 */
export const getMealCompletions = async (
  token?: string,
  date?: string
): Promise<MealCompletionsResponse> => {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiCall(`/api/patient/meals/completions${query}`, {}, token) as Promise<MealCompletionsResponse>;
};

/**
 * Upsert meal completion or selections
 */
export const upsertMealCompletion = async (
  data: {
    mealId: string;
    date: string;
    mealType?: string;
    completed?: boolean;
    completedAt?: number;
    selectedOptions?: Record<string, string[]>;
  },
  token?: string
): Promise<UpsertMealCompletionResponse> => {
  return apiCall('/api/patient/meals/completions', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token) as Promise<UpsertMealCompletionResponse>;
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

/**
 * Get plan progress for current client
 */
export const getPlanProgress = async (
  token?: string
): Promise<{ planProgress?: PlanProgress }> => {
  return apiCall('/api/clients/plan-progress', {}, token) as Promise<{ planProgress?: PlanProgress }>;
};

/**
 * Update plan progress for current client
 */
export const updatePlanProgress = async (
  data: {
    completedDays?: number;
    totalDays?: number;
    currentDay?: number;
  },
  token?: string
): Promise<{ planProgress?: PlanProgress }> => {
  return apiCall('/api/clients/plan-progress', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token) as Promise<{ planProgress?: PlanProgress }>;
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
  getIdealWeight,
  getWaterIntake,
  updateWaterIntake,
  getAssignedMeals,
  getMealHistory,
  getMealPlanSummary,
  getMealCompletions,
  upsertMealCompletion,
  getOrCreateConversation,
  sendChatMessage,
  getChatMessages,
  markMessagesAsRead,
  deleteChatMessage,
  editChatMessage,
  uploadVoiceMessage,
};


