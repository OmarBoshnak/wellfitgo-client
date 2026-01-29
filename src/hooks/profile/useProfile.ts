/**
 * useProfile Hook
 * @description Profile data management with optimistic updates
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectToken, selectUser } from '@/src/shared/store/selectors/auth.selectors';
import {
    selectProfile,
    selectProfileLoading,
    selectProfileUpdating,
    selectProfileError,
    selectCoachPlan,
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
import {
    CoachPlan,
    Profile,
    ProfileUpdate,
    Subscription,
    SubscriptionStatus,
    WeightProgress,
} from '@/src/shared/types/profile';
import {
    calculateWeightProgress,
    validateProfileUpdate,
} from '@/src/shared/utils/profileData';
import {
    ClientProfileResponse,
    MealPlanSummaryResponse,
    getClientProfile,
    getMealPlanSummary,
    updateClientProfile,
} from '@/src/shared/services/backend/api';

/**
 * Main hook for profile data management
 */
export function useProfile() {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const authUser = useAppSelector(selectUser);

    // Selectors
    const profile = useAppSelector(selectProfile);
    const isLoading = useAppSelector(selectProfileLoading);
    const isUpdating = useAppSelector(selectProfileUpdating);
    const error = useAppSelector(selectProfileError);
    const coachPlan = useAppSelector(selectCoachPlan);
    const bmi = useAppSelector(selectBMI);
    const fullName = useAppSelector(selectFullName);
    const initials = useAppSelector(selectInitials);

    const normalizeProfileResponse = useCallback(
        (response?: ClientProfileResponse | null) => {
            if (!response) return null;
            const normalizedProfile = (response as any)?.data && typeof (response as any).data === 'object'
                ? (response as any).data
                : response;
            return normalizedProfile ?? null;
        },
        []
    );

    const mapProfileResponse = useCallback(
        (response?: ClientProfileResponse | null): Profile | null => {
            const normalizedProfile = normalizeProfileResponse(response);
            if (!normalizedProfile) return null;

            const rawHistory = Array.isArray(normalizedProfile.weightHistory)
                ? normalizedProfile.weightHistory
                : [];
            const weightHistory = rawHistory
                .map((entry: any) => {
                    const weight = typeof entry?.weight === 'number'
                        ? entry.weight
                        : Number(entry?.weight);
                    if (Number.isNaN(weight)) return null;

                    const timestamp = typeof entry?.timestamp === 'number'
                        ? entry.timestamp
                        : new Date(entry?.date ?? Date.now()).getTime();

                    return {
                        date: typeof entry?.date === 'string'
                            ? entry.date
                            : new Date(timestamp).toISOString().split('T')[0],
                        weight,
                        timestamp,
                    };
                })
                .filter(Boolean) as Profile['weightHistory'];

            const currentWeight = typeof normalizedProfile.currentWeight === 'number'
                ? normalizedProfile.currentWeight
                : weightHistory?.[weightHistory.length - 1]?.weight ?? 0;
            const startWeight = typeof normalizedProfile.startingWeight === 'number'
                ? normalizedProfile.startingWeight
                : weightHistory?.[0]?.weight ?? currentWeight;
            const targetWeight = typeof normalizedProfile.targetWeight === 'number'
                ? normalizedProfile.targetWeight
                : startWeight ?? currentWeight;

            return {
                id: normalizedProfile._id
                    ?? normalizedProfile.id
                    ?? authUser?._id
                    ?? 'unknown',
                firstName: normalizedProfile.firstName ?? authUser?.firstName ?? '',
                lastName: normalizedProfile.lastName ?? authUser?.lastName ?? '',
                email: normalizedProfile.email ?? authUser?.email,
                phone: normalizedProfile.phone ?? authUser?.phone,
                avatarUrl: normalizedProfile.avatarUrl ?? authUser?.avatarUrl,
                gender: normalizedProfile.gender === 'female' ? 'female' : 'male',
                age: typeof normalizedProfile.age === 'number' ? normalizedProfile.age : 0,
                height: typeof normalizedProfile.height === 'number' ? normalizedProfile.height : 0,
                startWeight: typeof startWeight === 'number' ? startWeight : 0,
                currentWeight: typeof currentWeight === 'number' ? currentWeight : 0,
                targetWeight: typeof targetWeight === 'number' ? targetWeight : 0,
                weightHistory,
                subscriptionStatus: normalizedProfile.subscriptionStatus,
                dateOfBirth: normalizedProfile.dateOfBirth,
                createdAt: normalizedProfile.createdAt
                    ? new Date(normalizedProfile.createdAt).getTime()
                    : Date.now(),
                updatedAt: normalizedProfile.updatedAt
                    ? new Date(normalizedProfile.updatedAt).getTime()
                    : undefined,
            };
        },
        [authUser, normalizeProfileResponse]
    );

    const mapSubscriptionStatus = useCallback((status?: string): SubscriptionStatus => {
        const normalized = typeof status === 'string' ? status.toLowerCase() : 'inactive';
        switch (normalized) {
            case 'active':
                return 'active';
            case 'trial':
                return 'trial';
            case 'cancelled':
                return 'cancelled';
            case 'paused':
            case 'none':
            default:
                return 'inactive';
        }
    }, []);

    const mapSubscription = useCallback(
        (normalizedProfile: Record<string, any> | null): Subscription | null => {
            if (!normalizedProfile) return null;

            const rawStatus = normalizedProfile.subscriptionStatus;
            if (!rawStatus || rawStatus === 'none') return null;

            const status = mapSubscriptionStatus(rawStatus);
            const now = new Date();
            const startDate = normalizedProfile.subscriptionStartDate
                ? new Date(normalizedProfile.subscriptionStartDate).toISOString()
                : now.toISOString();
            const endDate = normalizedProfile.subscriptionEndDate
                ? new Date(normalizedProfile.subscriptionEndDate).toISOString()
                : undefined;
            const nextBillingDate = endDate
                ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

            return {
                id: normalizedProfile.subscriptionId
                    ?? normalizedProfile._id
                    ?? 'subscription',
                planName: normalizedProfile.planName ?? 'Plan',
                planNameAr: normalizedProfile.planNameAr ?? 'الخطة',
                status,
                startDate,
                nextBillingDate,
                endDate,
                price: typeof normalizedProfile.subscriptionPrice === 'number'
                    ? normalizedProfile.subscriptionPrice
                    : 0,
                currency: normalizedProfile.subscriptionCurrency ?? 'EGP',
                cancelAtPeriodEnd: Boolean(normalizedProfile.subscriptionCancelAtPeriodEnd),
                trialDaysRemaining: typeof normalizedProfile.trialDaysRemaining === 'number'
                    ? normalizedProfile.trialDaysRemaining
                    : undefined,
            };
        },
        [mapSubscriptionStatus]
    );

    const mapCoachPlan = useCallback(
        (
            normalizedProfile: Record<string, any> | null,
            summary?: MealPlanSummaryResponse | null
        ): CoachPlan | null => {
            const planProgress = normalizedProfile?.planProgress;
            const summaryData = summary?.data;

            const completedDays = typeof planProgress?.completedDays === 'number'
                ? planProgress.completedDays
                : typeof summaryData?.planMealsCompleted === 'number'
                    ? summaryData.planMealsCompleted
                    : typeof summaryData?.mealsCompleted === 'number'
                        ? summaryData.mealsCompleted
                        : 0;

            const durationDays = typeof planProgress?.totalDays === 'number'
                ? planProgress.totalDays
                : typeof summaryData?.planTotalMeals === 'number'
                    ? summaryData.planTotalMeals
                    : typeof summaryData?.totalMeals === 'number'
                        ? summaryData.totalMeals
                        : 0;

            const currentDay = typeof planProgress?.currentDay === 'number'
                ? planProgress.currentDay
                : Math.max(completedDays, 1);

            if (!summaryData?.doctor && durationDays === 0 && completedDays === 0) {
                return null;
            }

            const coachName = summaryData?.doctor?.name ?? 'Coach';
            const coachNameAr = summaryData?.doctor?.nameAr ?? 'الدكتور';

            const safeDurationDays = durationDays > 0 ? durationDays : Math.max(completedDays, 1);
            const safeCurrentDay = Math.min(Math.max(currentDay, 1), safeDurationDays);
            const startDate = normalizedProfile?.planStartDate
                ? new Date(normalizedProfile.planStartDate).toISOString()
                : new Date(Date.now() - (safeCurrentDay - 1) * 24 * 60 * 60 * 1000).toISOString();

            return {
                id: normalizedProfile?.planId ?? summaryData?.doctor?.id ?? 'plan',
                name: normalizedProfile?.planName ?? 'Meal Plan',
                nameAr: normalizedProfile?.planNameAr ?? 'خطة الوجبات',
                coach: {
                    id: summaryData?.doctor?.id ?? 'coach',
                    name: coachName,
                    nameAr: coachNameAr,
                    avatarUrl: summaryData?.doctor?.avatarUrl,
                },
                startDate,
                durationDays: safeDurationDays,
                currentDay: safeCurrentDay,
                completedDays: completedDays > 0 ? completedDays : 0,
            };
        },
        []
    );

    // Compute weight progress with history
    const weightProgress = useMemo((): WeightProgress | null => {
        if (!profile) return null;
        return calculateWeightProgress(profile);
    }, [profile]);

    /**
     * Fetch profile data from backend API
     */
    const fetchProfile = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            if (!token) {
                dispatch(setError('يرجى تسجيل الدخول لإكمال الملف الشخصي'));
                return;
            }

            const [profileResult, summaryResult] = await Promise.allSettled([
                getClientProfile(token),
                getMealPlanSummary(token),
            ]);

            if (profileResult.status !== 'fulfilled') {
                throw profileResult.reason;
            }

            const response = profileResult.value;
            const mappedProfile = mapProfileResponse(response);
            const normalizedProfile = normalizeProfileResponse(response);
            const mealSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
            const subscription = mapSubscription(normalizedProfile);
            const mappedCoachPlan = mapCoachPlan(normalizedProfile, mealSummary);

            if (!mappedProfile) {
                dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
                return;
            }

            dispatch(
                setProfileData({
                    profile: mappedProfile,
                    subscription,
                    coachPlan: mappedCoachPlan,
                })
            );
        } catch (err) {
            dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
            console.error('Error fetching profile:', err);
        }
    }, [
        dispatch,
        token,
        mapProfileResponse,
        mapSubscription,
        mapCoachPlan,
        normalizeProfileResponse,
    ]);

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
                if (!token) {
                    throw new Error('Missing auth token');
                }

                const { startWeight, ...restUpdates } = updates;
                const payload = {
                    ...restUpdates,
                    ...(startWeight !== undefined ? { startingWeight: startWeight } : {}),
                };

                const response = await updateClientProfile(payload, token);
                const mappedProfile = mapProfileResponse(response as ClientProfileResponse);

                if (mappedProfile) {
                    dispatch(setProfile(mappedProfile));
                } else {
                    const refreshed = await getClientProfile(token);
                    const refreshedProfile = mapProfileResponse(refreshed);
                    if (refreshedProfile) {
                        dispatch(setProfile(refreshedProfile));
                    }
                }

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
        [dispatch, profile, token, mapProfileResponse]
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
        if (!profile && token) {
            fetchProfile();
        }
    }, [profile, token, fetchProfile]);

    return {
        // Data
        profile,
        coachPlan,
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
