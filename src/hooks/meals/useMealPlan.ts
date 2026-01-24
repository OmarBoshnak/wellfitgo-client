/**
 * useMealPlan Hook
 * @description Manages active meal plan data
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectMealPlan,
    selectMealsLoading,
    selectMealsError,
    setMealsData,
    setMealsLoading,
    setMealsError,
} from '@/src/shared/store/slices/mealsSlice';
import { fetchMockMealsData } from '@/src/shared/utils/mealsData';
import { MealPlanFormat } from '@/src/shared/types/meals';

/**
 * Hook for managing active meal plan
 */
export function useMealPlan() {
    const dispatch = useAppDispatch();

    // Selectors
    const plan = useAppSelector(selectMealPlan);
    const isLoading = useAppSelector(selectMealsLoading);
    const error = useAppSelector(selectMealsError);

    // Fetch meal plan data
    const fetchPlan = useCallback(async (format: MealPlanFormat = 'general') => {
        dispatch(setMealsLoading(true));
        try {
            const data = await fetchMockMealsData(format);
            dispatch(setMealsData(data));
        } catch (err) {
            dispatch(setMealsError('حدث خطأ أثناء تحميل الخطة الغذائية'));
        }
    }, [dispatch]);

    // Refresh handler
    const refresh = useCallback(async () => {
        if (plan) {
            await fetchPlan(plan.format);
        } else {
            await fetchPlan();
        }
    }, [fetchPlan, plan]);

    // Initial fetch
    useEffect(() => {
        if (!plan) {
            fetchPlan();
        }
    }, [plan, fetchPlan]);

    return {
        plan,
        isLoading,
        error,
        fetchPlan,
        refresh,
        // Computed
        format: plan?.format || 'general',
        isDaily: plan?.format === 'daily',
        isGeneral: plan?.format === 'general',
        planName: plan?.nameAr || plan?.name || '',
        planEmoji: plan?.emoji || '🍽️',
    };
}

export default useMealPlan;
