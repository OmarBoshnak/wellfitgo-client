/**
 * useProfileActions Hook
 * @description Profile actions: logout, delete account
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/store';
import { clearProfile } from '@/src/shared/store/slices/profileSlice';
import { resetAuth } from '@/src/shared/store/slices/authSlice';
import { profileTranslations } from '@/src/shared/core/constants/translation';
import { AppwriteAuth } from '@/src/shared/services/appwrite/auth';
import { AuthService } from '@/src/shared/services/auth/auth.service';
import { persistor } from '@/src/shared/store';

/**
 * Check if Appwrite session is still valid
 */
const checkSession = async (): Promise<boolean> => {
    try {
        const isLoggedIn = await AppwriteAuth.isLoggedIn();
        return isLoggedIn;
    } catch (error) {
        console.warn('Session check failed:', error);
        return false;
    }
};

/**
 * Hook for profile action management
 */
export function useProfileActions() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const t = profileTranslations;

    /**
     * Handle logout flow
     */
    const handleLogout = useCallback(async () => {
        return new Promise<{ success: boolean }>((resolve) => {
            Alert.alert(
                t.logout,
                t.logoutConfirm,
                [
                    {
                        text: t.cancel,
                        style: 'cancel',
                        onPress: () => resolve({ success: false }),
                    },
                    {
                        text: t.confirm,
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setIsLoggingOut(true);
                                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                // Call Appwrite logout
                                const hasValidSession = await checkSession();
                                if (hasValidSession) {
                                    try {
                                        const logoutResult = await AppwriteAuth.logout();
                                        if (!logoutResult.success) {
                                            throw new Error(logoutResult.error || 'Logout failed');
                                        }
                                    } catch (appwriteError: any) {
                                        // If Appwrite session is lost, still clear local state
                                        console.warn('Appwrite logout failed, clearing local state only:', appwriteError.message);
                                    }
                                } else {
                                    console.warn('No valid Appwrite session found, clearing local state only');
                                }

                                // Clear all auth data completely
                                await AuthService.logout();
                                
                                // Clear Redux state
                                dispatch(clearProfile());
                                dispatch(resetAuth());

                                // Clear all persisted storage
                                await persistor.purge();

                                setIsLoggingOut(false);

                                // Navigate to auth screen
                                router.replace('/(auth)/LoginScreen');

                                resolve({ success: true });
                            } catch (error) {
                                console.error('Logout error:', error);
                                setIsLoggingOut(false);
                                await Haptics.notificationAsync(
                                    Haptics.NotificationFeedbackType.Error
                                );
                                resolve({ success: false });
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        });
    }, [dispatch, router, t]);

    /**
     * Handle delete account flow
     */
    const handleDeleteAccount = useCallback(async () => {
        return new Promise<{ success: boolean }>((resolve) => {
            Alert.alert(
                t.deleteAccount,
                t.deleteAccountConfirm,
                [
                    {
                        text: t.cancel,
                        style: 'cancel',
                        onPress: () => resolve({ success: false }),
                    },
                    {
                        text: t.confirm,
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setIsDeletingAccount(true);
                                await Haptics.notificationAsync(
                                    Haptics.NotificationFeedbackType.Warning
                                );

                                // Call Appwrite delete account
                                const hasValidSession = await checkSession();
                                if (hasValidSession) {
                                    try {
                                        const deleteResult = await AppwriteAuth.deleteAccount();
                                        if (!deleteResult.success) {
                                            throw new Error(deleteResult.error || 'Account deletion failed');
                                        }
                                    } catch (appwriteError: any) {
                                        // If Appwrite session is lost, still clear local state
                                        console.warn('Appwrite delete account failed, clearing local state only:', appwriteError.message);
                                    }
                                } else {
                                    console.warn('No valid Appwrite session found, clearing local state only');
                                }

                                // Clear all state
                                dispatch(clearProfile());
                                dispatch(resetAuth()); // Clear auth state completely

                                // Clear all persisted storage
                                await persistor.purge();

                                setIsDeletingAccount(false);

                                // Navigate to auth screen
                                router.replace('/(auth)/LoginScreen');

                                await Haptics.notificationAsync(
                                    Haptics.NotificationFeedbackType.Success
                                );

                                resolve({ success: true });
                            } catch (error) {
                                console.error('Delete account error:', error);
                                setIsDeletingAccount(false);
                                await Haptics.notificationAsync(
                                    Haptics.NotificationFeedbackType.Error
                                );

                                Alert.alert(
                                    t.errorUpdating,
                                    t.tryAgain,
                                    [{ text: 'OK' }]
                                );

                                resolve({ success: false });
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        });
    }, [dispatch, router, t]);

    /**
     * Export user data (placeholder)
     */
    const exportData = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // API export will go here
            // const data = await api.exportUserData();

            console.log('Data export requested');

            Alert.alert(
                'تصدير البيانات',
                'سيتم إرسال بياناتك إلى بريدك الإلكتروني خلال 24 ساعة.',
                [{ text: 'OK' }]
            );

            return { success: true };
        } catch (error) {
            console.error('Export data error:', error);
            return { success: false };
        }
    }, []);

    return {
        // State
        isLoggingOut,
        isDeletingAccount,
        // Actions
        handleLogout,
        handleDeleteAccount,
        exportData,
    };
}

export default useProfileActions;
