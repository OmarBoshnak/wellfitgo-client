/**
 * useHomeData Hook
 * @description Aggregates all home data with loading/error states
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectWeightData,
    selectMeals,
    selectWaterIntake,
    selectPlanProgress,
    selectHomeLoading,
    selectHomeError,
    setWeightData,
    setMeals,
    setWaterIntake,
    setPlanProgress,
    setLoading,
    setError,
    toggleMealCompletion,
    addWater,
    removeWater,
} from '@/src/shared/store/slices/homeSlice';
import { refreshAuthUser } from '@/src/shared/store/slices/authSlice';
import {
    selectUser as selectAuthUser,
    selectToken,
} from '@/src/shared/store/selectors/auth.selectors';
import { getGreeting } from '@/src/shared/utils/homeData';
import { getClientProfile, getIdealWeight, ClientProfileResponse, IdealWeightResponse } from '@/src/shared/services/backend/api';
import {
    WeightProgress,
    DailyNutrition,
    WeightData,
    DEFAULT_PLAN_PROGRESS,
    DEFAULT_WATER_INTAKE,
} from '@/src/shared/types/home';

/**
 * Main hook for HomeScreen data management
 */
export function useHomeData() {
    const dispatch = useAppDispatch();

    // Selectors
    const user = useAppSelector(selectAuthUser);
    const token = useAppSelector(selectToken);
    const weightData = useAppSelector(selectWeightData);
    const meals = useAppSelector(selectMeals);
    const waterIntake = useAppSelector(selectWaterIntake);
    const planProgress = useAppSelector(selectPlanProgress);
    const isLoading = useAppSelector(selectHomeLoading);
    const error = useAppSelector(selectHomeError);

    // Computed greeting
    const greeting = useMemo(() => getGreeting(), []);

    // Weight progress computation
    const weightProgress = useMemo((): WeightProgress | null => {
        if (!weightData) return null;

        const { currentWeight, targetWeight, startWeight, history } = weightData;
        const totalToLose = startWeight - targetWeight;
        const actuallyLost = startWeight - currentWeight;
        const progressPercentage = totalToLose > 0
            ? Math.min(Math.round((actuallyLost / totalToLose) * 100), 100)
            : 0;

        // Calculate trend from last 3 entries
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (history.length >= 2) {
            const last = history[history.length - 1].weight;
            const prev = history[history.length - 2].weight;
            if (last < prev - 0.1) trend = 'down';
            else if (last > prev + 0.1) trend = 'up';
        }

        return {
            currentWeight,
            targetWeight,
            startWeight,
            progressPercentage,
            totalLost: Math.max(actuallyLost, 0),
            remainingToGoal: Math.max(currentWeight - targetWeight, 0),
            weeklyData: history.slice(-7),
            trend,
        };
    }, [weightData]);

    // Nutrition computation
    const nutrition = useMemo((): DailyNutrition => {
        const completed = meals.filter(m => m.isCompleted);
        return {
            calories: completed.reduce((sum, m) => sum + m.calories, 0),
            protein: completed.reduce((sum, m) => sum + m.protein, 0),
            carbs: completed.reduce((sum, m) => sum + m.carbs, 0),
            fat: completed.reduce((sum, m) => sum + m.fat, 0),
            targetCalories: 1400,
            targetProtein: 100,
            targetCarbs: 112,
            targetFat: 53,
        };
    }, [meals]);

    const buildWeightData = useCallback((
        profile?: ClientProfileResponse | null,
        idealWeight?: IdealWeightResponse | null
    ): WeightData | null => {
        if (!profile) return null;

        const normalizedProfile = (profile as any)?.data && typeof (profile as any).data === 'object'
            ? (profile as any).data
            : profile;

        const history = Array.isArray(normalizedProfile.weightHistory)
            ? normalizedProfile.weightHistory
            : [];
        const currentWeight = typeof normalizedProfile.currentWeight === 'number'
            ? normalizedProfile.currentWeight
            : history[history.length - 1]?.weight;
        const startWeight = typeof normalizedProfile.startingWeight === 'number'
            ? normalizedProfile.startingWeight
            : history[0]?.weight ?? currentWeight;
        const idealTargetWeight = typeof idealWeight?.idealWeightKg === 'number'
            ? idealWeight.idealWeightKg
            : undefined;
        const targetWeight = typeof normalizedProfile.targetWeight === 'number'
            ? normalizedProfile.targetWeight
            : startWeight ?? currentWeight;

        if (currentWeight === undefined || currentWeight === null
            || startWeight === undefined || startWeight === null
            || targetWeight === undefined || targetWeight === null) {
            return null;
        }

        return {
            currentWeight,
            targetWeight: idealTargetWeight ?? targetWeight,
            startWeight,
            unit: 'kg',
            history,
        };
    }, []);

    // State for user profile data
    const [userProfile, setUserProfile] = useState<ClientProfileResponse | null>(null);

    // Fetch data
    const fetchData = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            console.log('[useHomeData] Token check:', token ? 'Token exists' : 'No token');
            console.log('[useHomeData] Token value:', token ? `${token.substring(0, 20)}...` : 'null');
            
            if (!token) {
                console.log('[useHomeData] No token available, skipping API calls');
                dispatch(setWeightData(null));
                dispatch(setLoading(false));
                return;
            }

            console.log('[useHomeData] Making API calls...');
            const [profile, idealWeight] = await Promise.all([
                getClientProfile(token),
                getIdealWeight(token),
            ]);

            console.log('[useHomeData] API responses received:', { profile, idealWeight });

            // Store user profile data
            setUserProfile(profile);

            const mappedWeightData = buildWeightData(profile, idealWeight);
            dispatch(setWeightData(mappedWeightData));
            dispatch(setMeals([]));
            dispatch(setWaterIntake({ ...DEFAULT_WATER_INTAKE }));
            dispatch(setPlanProgress({ ...DEFAULT_PLAN_PROGRESS }));
            dispatch(setLoading(false));
        } catch (err) {
            console.error('[useHomeData] Error fetching data:', err);
            dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
        }
    }, [dispatch, token, buildWeightData]);

    // Refresh handler
    const refresh = useCallback(async () => {
        await Promise.all([
            fetchData(),
            dispatch(refreshAuthUser())
        ]);
    }, [fetchData, dispatch]);

    // Toggle meal handler
    const handleMealToggle = useCallback((mealId: string) => {
        dispatch(toggleMealCompletion(mealId));
    }, [dispatch]);

    // Water handlers
    const handleAddWater = useCallback(() => {
        dispatch(addWater());
    }, [dispatch]);

    const handleRemoveWater = useCallback(() => {
        dispatch(removeWater());
    }, [dispatch]);

    // Initial fetch
    useEffect(() => {
        if (user && token) {
            fetchData();
        }
    }, [user, token, fetchData]);

    return {
        // Data
        user: userProfile,
        weightProgress,
        meals,
        nutrition,
        waterIntake,
        planProgress,
        greeting,
        // State
        isLoading,
        error,
        // Actions
        refresh,
        handleMealToggle,
        handleAddWater,
        handleRemoveWater,
    };
}

export default useHomeData;
