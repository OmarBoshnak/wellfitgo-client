/**
 * useSettings Hook
 * @description Settings and preferences management with instant feedback
 */

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectSettings,
    selectNotificationSettings,
    selectPreferences,
    updateNotificationSettings,
    toggleNotification,
    updatePreferences,
    setLanguage,
    setUnits,
    setTheme,
} from '@/src/shared/store/slices/profileSlice';
import { NotificationSettings, AppPreferences } from '@/src/shared/types/profile';

/**
 * Hook for settings and preferences management
 */
export function useSettings() {
    const dispatch = useAppDispatch();

    // Selectors
    const settings = useAppSelector(selectSettings);
    const notifications = useAppSelector(selectNotificationSettings);
    const preferences = useAppSelector(selectPreferences);

    /**
     * Toggle a notification setting with haptic feedback
     */
    const handleToggleNotification = useCallback(
        async (key: keyof NotificationSettings, value?: boolean) => {
            // Provide haptic feedback
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            if (value !== undefined) {
                dispatch(updateNotificationSettings({ [key]: value }));
            } else {
                dispatch(toggleNotification(key));
            }

            // API sync will go here
            console.log('Notification setting updated:', key);
        },
        [dispatch]
    );

    /**
     * Update language preference
     */
    const handleSetLanguage = useCallback(
        async (language: 'ar' | 'en') => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dispatch(setLanguage(language));

            // TODO: Trigger app reload or RTL switch
            console.log('Language set to:', language);
        },
        [dispatch]
    );

    /**
     * Update units preference
     */
    const handleSetUnits = useCallback(
        async (units: 'metric' | 'imperial') => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dispatch(setUnits(units));

            console.log('Units set to:', units);
        },
        [dispatch]
    );

    /**
     * Update theme preference
     */
    const handleSetTheme = useCallback(
        async (theme: 'light' | 'dark' | 'system') => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dispatch(setTheme(theme));

            console.log('Theme set to:', theme);
        },
        [dispatch]
    );

    /**
     * Update multiple preferences at once
     */
    const handleUpdatePreferences = useCallback(
        async (updates: Partial<AppPreferences>) => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dispatch(updatePreferences(updates));

            console.log('Preferences updated:', updates);
        },
        [dispatch]
    );

    /**
     * Reset all settings to defaults
     */
    const resetToDefaults = useCallback(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        dispatch(
            updateNotificationSettings({
                pushEnabled: true,
                mealReminders: true,
                dailySummary: true,
                weeklyReport: false,
                coachMessages: true,
            })
        );

        dispatch(
            updatePreferences({
                language: 'ar',
                units: 'metric',
                theme: 'light',
            })
        );

        console.log('Settings reset to defaults');
    }, [dispatch]);

    return {
        // Data
        settings,
        notifications,
        preferences,
        // Notification actions
        toggleNotification: handleToggleNotification,
        // Preference actions
        setLanguage: handleSetLanguage,
        setUnits: handleSetUnits,
        setTheme: handleSetTheme,
        updatePreferences: handleUpdatePreferences,
        // Other actions
        resetToDefaults,
    };
}

export default useSettings;
