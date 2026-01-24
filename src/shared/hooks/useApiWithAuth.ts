/**
 * useApiWithAuth Hook
 * @description Provides API functions with automatic force logout handling
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/store';
import { logout } from '@/src/shared/store/slices/authSlice';
import backendAPI, { EnhancedSyncRequest, EnhancedSyncResponse } from '@/src/shared/services/backend/api';

export const useApiWithAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleForceLogout = useCallback(async () => {
    console.log('🔄 Handling force logout...');

    // Clear auth state
    await dispatch(logout());

    // Navigate to login screen
    router.replace('/(auth)/login' as any);
  }, [dispatch, router]);

  const apiCall = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ) => {
    try {
      const result = await backendAPI.apiCall(endpoint, options, token);

      // Handle force logout
      if (result.forceLogout) {
        await handleForceLogout();
        return null;
      }

      return result;
    } catch (error: any) {
      // Check if it's a force logout error
      if (error.message?.includes('Account deleted') || error.forceLogout) {
        await handleForceLogout();
        return null;
      }

      throw error;
    }
  }, [handleForceLogout]);

  /**
   * Enhanced Sync - main auth endpoint with intelligent routing
   */
  const enhancedSync = useCallback(async (
    request: EnhancedSyncRequest
  ): Promise<EnhancedSyncResponse | null> => {
    try {
      const result = await backendAPI.enhancedSync(request);

      // Handle force logout
      if (result.forceLogout) {
        await handleForceLogout();
        return null;
      }

      return result;
    } catch (error: any) {
      // Check if it's a force logout error
      if (error.message?.includes('Account deleted') || error.forceLogout) {
        await handleForceLogout();
        return null;
      }

      throw error;
    }
  }, [handleForceLogout]);

  /**
   * OAuth login - legacy endpoint (kept for backwards compatibility)
   */
  const oauthLogin = useCallback(async (
    email: string,
    firstName: string,
    lastName: string,
    avatar?: string,
    provider?: string,
    appwriteId?: string
  ) => {
    try {
      const result = await backendAPI.oauthLogin(
        email,
        firstName,
        lastName,
        avatar,
        provider,
        appwriteId
      );

      // Handle force logout
      if (result.forceLogout) {
        await handleForceLogout();
        return null;
      }

      return result;
    } catch (error: any) {
      // Check if it's a force logout error
      if (error.message?.includes('Account deleted') || error.forceLogout) {
        await handleForceLogout();
        return null;
      }

      throw error;
    }
  }, [handleForceLogout]);

  const getCurrentUser = useCallback(async (token: string) => {
    return apiCall('/api/auth/me', {}, token);
  }, [apiCall]);

  const getRequiredSetup = useCallback(async (token: string) => {
    return apiCall('/api/auth/required-setup', {}, token);
  }, [apiCall]);

  const completeSetup = useCallback(async (
    stepId: string,
    data: Record<string, unknown> | undefined,
    token: string
  ) => {
    return apiCall('/api/auth/complete-setup', {
      method: 'POST',
      body: JSON.stringify({ stepId, data }),
    }, token);
  }, [apiCall]);

  const updateUserRole = useCallback(async (
    userId: string,
    role: string,
    token: string
  ) => {
    return apiCall(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }, token);
  }, [apiCall]);

  const deleteAccount = useCallback(async (
    appwriteUserId: string,
    token: string
  ) => {
    return apiCall('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ appwriteUserId }),
    }, token);
  }, [apiCall]);

  return {
    apiCall,
    enhancedSync,
    oauthLogin,
    getCurrentUser,
    getRequiredSetup,
    completeSetup,
    updateUserRole,
    deleteAccount,
  };
};

export default useApiWithAuth;

