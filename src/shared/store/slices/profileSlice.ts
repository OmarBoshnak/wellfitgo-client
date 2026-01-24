/**
 * Profile Redux Slice
 * @description State management for ProfileScreen data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    ProfileState,
    Profile,
    Subscription,
    CoachPlan,
    ProfileSettings,
    NotificationSettings,
    AppPreferences,
    ProfileUpdate,
    DEFAULT_PROFILE_SETTINGS,
} from '@/src/shared/types/profile';

// ============================================================================
// Initial State
// ============================================================================

const initialState: ProfileState = {
    profile: null,
    subscription: null,
    coachPlan: null,
    settings: { ...DEFAULT_PROFILE_SETTINGS },
    isLoading: false,
    isUpdating: false,
    error: null,
    lastSync: null,
};

// ============================================================================
// Slice
// ============================================================================

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        /**
         * Set loading state
         */
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        /**
         * Set updating state (for optimistic updates)
         */
        setUpdating: (state, action: PayloadAction<boolean>) => {
            state.isUpdating = action.payload;
        },

        /**
         * Set error state
         */
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
            state.isUpdating = false;
        },

        /**
         * Set profile data
         */
        setProfile: (state, action: PayloadAction<Profile | null>) => {
            state.profile = action.payload;
            state.isLoading = false;
            state.error = null;
        },

        /**
         * Update profile with partial data (optimistic update)
         */
        updateProfile: (state, action: PayloadAction<ProfileUpdate>) => {
            if (state.profile) {
                state.profile = {
                    ...state.profile,
                    ...action.payload,
                    updatedAt: Date.now(),
                };
            }
        },

        /**
         * Update avatar URL
         */
        setAvatarUrl: (state, action: PayloadAction<string | undefined>) => {
            if (state.profile) {
                state.profile.avatarUrl = action.payload;
                state.profile.updatedAt = Date.now();
            }
        },

        /**
         * Set subscription data
         */
        setSubscription: (state, action: PayloadAction<Subscription | null>) => {
            state.subscription = action.payload;
        },

        /**
         * Set coach plan data
         */
        setCoachPlan: (state, action: PayloadAction<CoachPlan | null>) => {
            state.coachPlan = action.payload;
        },

        /**
         * Set all settings
         */
        setSettings: (state, action: PayloadAction<ProfileSettings>) => {
            state.settings = action.payload;
        },

        /**
         * Update notification settings
         */
        updateNotificationSettings: (
            state,
            action: PayloadAction<Partial<NotificationSettings>>
        ) => {
            state.settings.notifications = {
                ...state.settings.notifications,
                ...action.payload,
            };
        },

        /**
         * Toggle single notification setting
         */
        toggleNotification: (
            state,
            action: PayloadAction<keyof NotificationSettings>
        ) => {
            const key = action.payload;
            state.settings.notifications[key] = !state.settings.notifications[key];
        },

        /**
         * Update app preferences
         */
        updatePreferences: (
            state,
            action: PayloadAction<Partial<AppPreferences>>
        ) => {
            state.settings.preferences = {
                ...state.settings.preferences,
                ...action.payload,
            };
        },

        /**
         * Set language preference
         */
        setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
            state.settings.preferences.language = action.payload;
        },

        /**
         * Set units preference
         */
        setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
            state.settings.preferences.units = action.payload;
        },

        /**
         * Set theme preference
         */
        setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.settings.preferences.theme = action.payload;
        },

        /**
         * Set all profile data at once
         */
        setProfileData: (
            state,
            action: PayloadAction<{
                profile: Profile;
                subscription: Subscription | null;
                coachPlan: CoachPlan | null;
                settings?: ProfileSettings;
            }>
        ) => {
            state.profile = action.payload.profile;
            state.subscription = action.payload.subscription;
            state.coachPlan = action.payload.coachPlan;
            if (action.payload.settings) {
                state.settings = action.payload.settings;
            }
            state.isLoading = false;
            state.error = null;
            state.lastSync = Date.now();
        },

        /**
         * Update last sync timestamp
         */
        setLastSync: (state, action: PayloadAction<number | null>) => {
            state.lastSync = action.payload;
        },

        /**
         * Clear profile on logout
         */
        clearProfile: () => initialState,
    },
});

// ============================================================================
// Selectors
// ============================================================================

// Basic selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;
export const selectSubscription = (state: { profile: ProfileState }) => state.profile.subscription;
export const selectCoachPlan = (state: { profile: ProfileState }) => state.profile.coachPlan;
export const selectSettings = (state: { profile: ProfileState }) => state.profile.settings;
export const selectNotificationSettings = (state: { profile: ProfileState }) =>
    state.profile.settings.notifications;
export const selectPreferences = (state: { profile: ProfileState }) =>
    state.profile.settings.preferences;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.isLoading;
export const selectProfileUpdating = (state: { profile: ProfileState }) => state.profile.isUpdating;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;
export const selectLastSync = (state: { profile: ProfileState }) => state.profile.lastSync;

// Computed selectors
export const selectFullName = (state: { profile: ProfileState }) => {
    const profile = state.profile.profile;
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`;
};

export const selectInitials = (state: { profile: ProfileState }) => {
    const profile = state.profile.profile;
    if (!profile) return '';
    return `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();
};

export const selectWeightProgress = (state: { profile: ProfileState }) => {
    const profile = state.profile.profile;
    if (!profile) return null;

    const { startWeight, currentWeight, targetWeight } = profile;
    const totalToLose = startWeight - targetWeight;
    const totalLost = startWeight - currentWeight;
    const remainingToGoal = Math.max(currentWeight - targetWeight, 0);
    const progressPercentage =
        totalToLose > 0 ? Math.min(Math.round((totalLost / totalToLose) * 100), 100) : 0;

    return {
        startWeight,
        currentWeight,
        targetWeight,
        totalToLose: Math.max(totalToLose, 0),
        totalLost: Math.max(totalLost, 0),
        remainingToGoal,
        progressPercentage: Math.max(progressPercentage, 0),
        trend: 'stable' as const,
        history: [],
    };
};

export const selectBMI = (state: { profile: ProfileState }) => {
    const profile = state.profile.profile;
    if (!profile) return null;

    const heightInMeters = profile.height / 100;
    const bmi = profile.currentWeight / (heightInMeters * heightInMeters);

    let category: 'underweight' | 'normal' | 'overweight' | 'obese';
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else category = 'obese';

    return {
        value: Math.round(bmi * 10) / 10,
        category,
    };
};

export const selectIsSubscriptionActive = (state: { profile: ProfileState }) => {
    const subscription = state.profile.subscription;
    return subscription?.status === 'active' || subscription?.status === 'trial';
};

export const selectSubscriptionDaysRemaining = (state: { profile: ProfileState }) => {
    const subscription = state.profile.subscription;
    if (!subscription) return 0;

    const endDate = new Date(subscription.nextBillingDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
};

export const selectPlanDaysRemaining = (state: { profile: ProfileState }) => {
    const plan = state.profile.coachPlan;
    if (!plan) return 0;
    return plan.durationDays - plan.currentDay;
};

export const selectPlanProgress = (state: { profile: ProfileState }) => {
    const plan = state.profile.coachPlan;
    if (!plan) return 0;
    return Math.round((plan.completedDays / plan.durationDays) * 100);
};

// ============================================================================
// Exports
// ============================================================================

export const {
    setLoading,
    setUpdating,
    setError,
    setProfile,
    updateProfile,
    setAvatarUrl,
    setSubscription,
    setCoachPlan,
    setSettings,
    updateNotificationSettings,
    toggleNotification,
    updatePreferences,
    setLanguage,
    setUnits,
    setTheme,
    setProfileData,
    setLastSync,
    clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
