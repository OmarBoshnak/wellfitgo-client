/**
 * useMealPlan Hook
 * @description Manages active meal plan data
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectMealPlan,
    selectMealsLoading,
    selectMealsError,
    selectSelectedDate,
    selectDayOffset,
    setMealsData,
    setMealsLoading,
    setMealsError,
} from '@/src/shared/store/slices/mealsSlice';
import { fetchMockMealsData } from '@/src/shared/utils/mealsData';
import { MealPlanFormat } from '@/src/shared/types/meals';
import { getMealPlanSummary } from '@/src/shared/services/backend/api';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';

/**
 * Hook for managing active meal plan
 */
export function useMealPlan() {
    const dispatch = useAppDispatch();

    // Selectors
    const plan = useAppSelector(selectMealPlan);
    const isLoading = useAppSelector(selectMealsLoading);
    const error = useAppSelector(selectMealsError);
    const token = useAppSelector(selectToken);
    const selectedDate = useAppSelector(selectSelectedDate);
    const dayOffset = useAppSelector(selectDayOffset);

    const [summary, setSummary] = useState<
        | {
            doctor?: {
                id?: string;
                name?: string;
                nameAr?: string;
                avatarUrl?: string;
            } | null;
            mealsCompleted?: number;
            totalMeals?: number;
            planMealsCompleted?: number;
            planTotalMeals?: number;
        }
        | null
    >(null);

    const resolveSummaryDate = useCallback((format: MealPlanFormat) => {
        const baseDate = new Date(selectedDate);
        if (format === 'daily') {
            baseDate.setDate(baseDate.getDate() + dayOffset);
        }
        return toISODateString(baseDate);
    }, [selectedDate, dayOffset]);

    // Fetch meal plan data
    const fetchPlan = useCallback(async (format: MealPlanFormat = 'general') => {
        dispatch(setMealsLoading(true));
        try {
            const data = await fetchMockMealsData(format);
            let summaryData: typeof summary = null;

            if (token) {
                try {
                    const response = await getMealPlanSummary(token, resolveSummaryDate(format));
                    summaryData = response?.data ?? null;
                } catch {
                    summaryData = null;
                }
            }

            setSummary(summaryData);

            const updatedPlan = summaryData?.doctor
                ? {
                    ...data.plan,
                    doctorName: summaryData.doctor?.name || data.plan.doctorName,
                    doctorNameAr: summaryData.doctor?.nameAr || data.plan.doctorNameAr,
                }
                : data.plan;

            dispatch(setMealsData({
                ...data,
                plan: updatedPlan,
            }));
        } catch (err) {
            dispatch(setMealsError('حدث خطأ أثناء تحميل الخطة الغذائية'));
        }
    }, [dispatch, token, resolveSummaryDate]);

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
        summary,
        // Computed
        format: plan?.format || 'general',
        isDaily: plan?.format === 'daily',
        isGeneral: plan?.format === 'general',
        planName: plan?.nameAr || plan?.name || '',
        planEmoji: plan?.emoji || '🍽️',
    };
}

export default useMealPlan;
