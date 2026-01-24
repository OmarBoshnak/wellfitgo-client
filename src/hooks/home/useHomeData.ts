/**
 * useHomeData Hook
 * @description Aggregates all home data with loading/error states
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectUser,
    selectWeightData,
    selectMeals,
    selectWaterIntake,
    selectPlanProgress,
    selectHomeLoading,
    selectHomeError,
    setHomeData,
    setLoading,
    setError,
    toggleMealCompletion,
    addWater,
    removeWater,
} from '@/src/shared/store/slices/homeSlice';
import { fetchMockHomeData, getGreeting } from '@/src/shared/utils/homeData';
import { WeightProgress, DailyNutrition } from '@/src/shared/types/home';

/**
 * Main hook for HomeScreen data management
 */
export function useHomeData() {
    const dispatch = useAppDispatch();

    // Selectors
    const user = useAppSelector(selectUser);
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

    // Fetch data
    const fetchData = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await fetchMockHomeData();
            dispatch(setHomeData(data));
        } catch (err) {
            dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
        }
    }, [dispatch]);

    // Refresh handler
    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

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
        if (!user) {
            fetchData();
        }
    }, [user, fetchData]);

    return {
        // Data
        user,
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
