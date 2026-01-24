/**
 * useProfile Hook
 * @description Profile data management with optimistic updates
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectProfile,
    selectProfileLoading,
    selectProfileUpdating,
    selectProfileError,
    selectWeightProgress,
    selectBMI,
    selectFullName,
    selectInitials,
    setLoading,
    setUpdating,
    setError,
    setProfile,
    updateProfile,
    setProfileData,
} from '@/src/shared/store/slices/profileSlice';
import { Profile, ProfileUpdate, WeightProgress } from '@/src/shared/types/profile';
import {
    fetchMockProfileData,
    calculateWeightProgress,
    validateProfileUpdate,
} from '@/src/shared/utils/profileData';

/**
 * Main hook for profile data management
 */
export function useProfile() {
    const dispatch = useAppDispatch();

    // Selectors
    const profile = useAppSelector(selectProfile);
    const isLoading = useAppSelector(selectProfileLoading);
    const isUpdating = useAppSelector(selectProfileUpdating);
    const error = useAppSelector(selectProfileError);
    const weightProgressData = useAppSelector(selectWeightProgress);
    const bmi = useAppSelector(selectBMI);
    const fullName = useAppSelector(selectFullName);
    const initials = useAppSelector(selectInitials);

    // Compute weight progress with history
    const weightProgress = useMemo((): WeightProgress | null => {
        if (!profile) return null;
        return calculateWeightProgress(profile);
    }, [profile]);

    /**
     * Fetch profile data from API (mock for now)
     */
    const fetchProfile = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await fetchMockProfileData();
            dispatch(setProfileData(data));
        } catch (err) {
            dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
            console.error('Error fetching profile:', err);
        }
    }, [dispatch]);

    /**
     * Update profile with optimistic update and rollback
     */
    const handleUpdateProfile = useCallback(
        async (updates: ProfileUpdate) => {
            // Validate update
            const validation = validateProfileUpdate(updates as Partial<Profile>);
            if (!validation.isValid) {
                dispatch(setError(validation.errors[0]));
                return { success: false, errors: validation.errors };
            }

            // Store original for rollback
            const originalProfile = profile;

            // Optimistic update
            dispatch(setUpdating(true));
            dispatch(updateProfile(updates));

            try {
                // API call will go here
                // await api.updateProfile(updates);
                console.log('Profile updated:', updates);

                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 500));

                dispatch(setUpdating(false));
                return { success: true };
            } catch (err) {
                // Rollback on error
                if (originalProfile) {
                    dispatch(setProfile(originalProfile));
                }
                dispatch(setError('حدث خطأ أثناء تحديث البيانات'));
                dispatch(setUpdating(false));
                console.error('Error updating profile:', err);
                return { success: false, errors: ['حدث خطأ أثناء تحديث البيانات'] };
            }
        },
        [dispatch, profile]
    );

    /**
     * Update single field
     */
    const updateField = useCallback(
        async (field: keyof Profile, value: string | number) => {
            return handleUpdateProfile({ [field]: value } as ProfileUpdate);
        },
        [handleUpdateProfile]
    );

    /**
     * Refresh profile data
     */
    const refresh = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    // Initial fetch
    useEffect(() => {
        if (!profile) {
            fetchProfile();
        }
    }, [profile, fetchProfile]);

    return {
        // Data
        profile,
        weightProgress,
        bmi,
        fullName,
        initials,
        // State
        isLoading,
        isUpdating,
        error,
        // Actions
        fetchProfile,
        updateProfile: handleUpdateProfile,
        updateField,
        refresh,
    };
}

export default useProfile;
