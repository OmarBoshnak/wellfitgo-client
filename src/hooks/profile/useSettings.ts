/**
 * useSettings Hook
 * @description Settings and preferences management with instant feedback
 */

import { useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import {
    selectSettings,
    selectNotificationSettings,
    selectPreferences,
    updateNotificationSettings,
    updatePreferences,
    setLanguage,
    setUnits,
    setTheme,
} from '@/src/shared/store/slices/profileSlice';
import { NotificationSettings, AppPreferences, DEFAULT_NOTIFICATION_SETTINGS, MealRemindersSchedule, NotificationToggleKey } from '@/src/shared/types/profile';
import { getClientProfile, updateClientProfile } from '@/src/shared/services/backend/api';

/**
 * Hook for settings and preferences management
 */
export function useSettings() {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);

    const normalizeMealRemindersSchedule = useCallback((schedule?: any): MealRemindersSchedule => {
        const fallback = DEFAULT_NOTIFICATION_SETTINGS.mealRemindersSchedule as MealRemindersSchedule;

        if (!schedule || typeof schedule !== 'object') {
            return fallback;
        }

        return {
            breakfast: {
                enabled: typeof schedule?.breakfast?.enabled === 'boolean'
                    ? schedule.breakfast.enabled
                    : fallback.breakfast.enabled,
                time: typeof schedule?.breakfast?.time === 'string'
                    ? schedule.breakfast.time
                    : fallback.breakfast.time,
            },
            snack1: {
                enabled: typeof schedule?.snack1?.enabled === 'boolean'
                    ? schedule.snack1.enabled
                    : fallback.snack1.enabled,
                time: typeof schedule?.snack1?.time === 'string'
                    ? schedule.snack1.time
                    : fallback.snack1.time,
            },
            lunch: {
                enabled: typeof schedule?.lunch?.enabled === 'boolean'
                    ? schedule.lunch.enabled
                    : fallback.lunch.enabled,
                time: typeof schedule?.lunch?.time === 'string'
                    ? schedule.lunch.time
                    : fallback.lunch.time,
            },
            snack2: {
                enabled: typeof schedule?.snack2?.enabled === 'boolean'
                    ? schedule.snack2.enabled
                    : fallback.snack2.enabled,
                time: typeof schedule?.snack2?.time === 'string'
                    ? schedule.snack2.time
                    : fallback.snack2.time,
            },
            dinner: {
                enabled: typeof schedule?.dinner?.enabled === 'boolean'
                    ? schedule.dinner.enabled
                    : fallback.dinner.enabled,
                time: typeof schedule?.dinner?.time === 'string'
                    ? schedule.dinner.time
                    : fallback.dinner.time,
            },
        };
    }, []);

    // Selectors
    const settings = useAppSelector(selectSettings);
    const notifications = useAppSelector(selectNotificationSettings);
    const preferences = useAppSelector(selectPreferences);

    const getBackendNotificationSettings = useCallback((data: any): NotificationSettings => {
        const backend = data?.notificationSettings || {};
        const mealReminders = backend.mealReminders ?? DEFAULT_NOTIFICATION_SETTINGS.mealReminders;
        const weeklyCheckin = backend.weeklyCheckin ?? DEFAULT_NOTIFICATION_SETTINGS.weeklyCheckin;
        const coachMessages = backend.coachMessages ?? DEFAULT_NOTIFICATION_SETTINGS.coachMessages;
        const mealReminderTime = typeof backend.mealReminderTime === 'string'
            ? backend.mealReminderTime
            : DEFAULT_NOTIFICATION_SETTINGS.mealReminderTime;
        const timezone = typeof backend.timezone === 'string'
            ? backend.timezone
            : DEFAULT_NOTIFICATION_SETTINGS.timezone;
        const mealRemindersSchedule = normalizeMealRemindersSchedule(backend.mealRemindersSchedule);

        return {
            pushEnabled: Boolean(mealReminders || weeklyCheckin || coachMessages),
            mealReminders,
            weeklyCheckin,
            coachMessages,
            mealReminderTime,
            timezone,
            mealRemindersSchedule,
        };
    }, [normalizeMealRemindersSchedule]);

    useEffect(() => {
        const fetchNotificationSettings = async () => {
            if (!token) return;
            try {
                const response = await getClientProfile(token);
                const normalized = (response as any)?.data && typeof (response as any).data === 'object'
                    ? (response as any).data
                    : response;
                const mapped = getBackendNotificationSettings(normalized);
                dispatch(updateNotificationSettings(mapped));
            } catch (error) {
                console.error('[Settings] Failed to load notification settings:', error);
            }
        };

        fetchNotificationSettings();
    }, [dispatch, getBackendNotificationSettings, token]);

    /**
     * Toggle a notification setting with haptic feedback
     */
    const handleToggleNotification = useCallback(
        async (key: NotificationToggleKey, value?: boolean) => {
            // Provide haptic feedback
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const nextValue = value !== undefined ? value : !notifications[key];
            let nextSettings: NotificationSettings;

            if (key === 'pushEnabled') {
                nextSettings = {
                    ...notifications,
                    pushEnabled: nextValue,
                    mealReminders: nextValue,
                    weeklyCheckin: nextValue,
                    coachMessages: nextValue,
                };
            } else {
                nextSettings = {
                    ...notifications,
                    [key]: nextValue,
                } as NotificationSettings;
                nextSettings.pushEnabled = Boolean(
                    nextSettings.mealReminders || nextSettings.weeklyCheckin || nextSettings.coachMessages
                );
            }

            dispatch(updateNotificationSettings(nextSettings));

            if (!token) return;

            try {
                // Persist notification settings to backend (MongoDB)
                await updateClientProfile({
                    notificationSettings: {
                        mealReminders: nextSettings.mealReminders,
                        weeklyCheckin: nextSettings.weeklyCheckin,
                        coachMessages: nextSettings.coachMessages,
                        mealReminderTime: nextSettings.mealReminderTime,
                        timezone: nextSettings.timezone,
                        mealRemindersSchedule: nextSettings.mealRemindersSchedule,
                    },
                }, token);
            } catch (error) {
                // Rollback local state on backend failure
                dispatch(updateNotificationSettings(notifications));
                console.error('[Settings] Failed to update notification settings:', error);
            }
        },
        [dispatch, notifications, token]
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
                weeklyCheckin: true,
                coachMessages: true,
                mealReminderTime: DEFAULT_NOTIFICATION_SETTINGS.mealReminderTime,
                timezone: DEFAULT_NOTIFICATION_SETTINGS.timezone,
                mealRemindersSchedule: DEFAULT_NOTIFICATION_SETTINGS.mealRemindersSchedule,
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
