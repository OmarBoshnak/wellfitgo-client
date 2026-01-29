/**
 * useMealCompletions Hook
 * @description Manages meal completion state with optimistic updates
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectCompletions,
    selectSelections,
    selectSelectedDate,
    selectDayOffset,
    selectMealPlan,
    selectMealsForSelectedDate,
    selectCompletionProgress,
    setCompletions,
    setSelections,
    toggleMealCompletion,
} from '@/src/shared/store/slices/mealsSlice';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { getMealCompletions, upsertMealCompletion } from '@/src/shared/services/backend/api';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';

/**
 * Hook for managing meal completions with haptics
 */
export function useMealCompletions() {
    const dispatch = useAppDispatch();

    // Selectors
    const completions = useAppSelector(selectCompletions);
    const selections = useAppSelector(selectSelections);
    const selectedDate = useAppSelector(selectSelectedDate);
    const dayOffset = useAppSelector(selectDayOffset);
    const plan = useAppSelector(selectMealPlan);
    const mealsForDate = useAppSelector(selectMealsForSelectedDate);
    const progress = useAppSelector(selectCompletionProgress);
    const token = useAppSelector(selectToken);

    // Calculate current date based on format
    const currentDate = useMemo(() => {
        if (plan?.format === 'daily') {
            const baseDate = new Date(selectedDate);
            baseDate.setDate(baseDate.getDate() + dayOffset);
            return toISODateString(baseDate);
        }
        return selectedDate;
    }, [selectedDate, dayOffset, plan?.format]);

    // Check if a specific meal is completed
    const isMealCompleted = useCallback((mealId: string): boolean => {
        return completions.some(c => c.mealId === mealId && c.date === currentDate);
    }, [completions, currentDate]);

    // Get completion for a meal
    const getCompletion = useCallback((mealId: string) => {
        return completions.find(c => c.mealId === mealId && c.date === currentDate);
    }, [completions, currentDate]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isActive = true;

        getMealCompletions(token, currentDate)
            .then((response) => {
                if (!isActive) return;
                const completionItems = Array.isArray(response?.data?.completions)
                    ? response?.data?.completions
                    : [];
                const normalizedCompletions = completionItems
                    .filter((item) => item?.mealId && item?.date && typeof item?.completedAt === 'number')
                    .map((item) => ({
                        id: item?.id || `comp_${item?.mealId}_${item?.date}`,
                        mealId: item!.mealId!,
                        date: item!.date!,
                        completedAt: item!.completedAt as number,
                        selectedOptions: item?.selectedOptions,
                    }));

                dispatch(setCompletions(normalizedCompletions));

                const selectionsMap = response?.data?.selections;
                if (selectionsMap && typeof selectionsMap === 'object') {
                    dispatch(setSelections(selectionsMap));
                }
            })
            .catch(() => {
                if (!isActive) return;
            });

        return () => {
            isActive = false;
        };
    }, [token, currentDate, dispatch]);

    // Toggle meal completion with haptic feedback
    const toggleCompletion = useCallback(async (mealId: string) => {
        const isCurrentlyCompleted = isMealCompleted(mealId);
        // Trigger haptic feedback
        if (Platform.OS !== 'web') {
            try {
                if (isCurrentlyCompleted) {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } else {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            } catch {
                // Haptics not available
            }
        }

        // Optimistic update
        dispatch(toggleMealCompletion({ mealId, date: currentDate }));

        if (!token) {
            return;
        }

        const meal = mealsForDate.find(m => m.id === mealId);
        const completed = !isCurrentlyCompleted;

        try {
            await upsertMealCompletion({
                mealId,
                date: currentDate,
                mealType: meal?.type,
                completed,
                completedAt: completed ? Date.now() : undefined,
                selectedOptions: selections[mealId],
            }, token);
        } catch {
            dispatch(toggleMealCompletion({ mealId, date: currentDate }));
        }
    }, [dispatch, currentDate, isMealCompleted, token, mealsForDate, selections]);

    // Complete all meals
    const completeAll = useCallback(async () => {
        const incompleteMeals = mealsForDate.filter(m => !isMealCompleted(m.id));

        if (Platform.OS !== 'web') {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
                // Haptics not available
            }
        }

        for (const meal of incompleteMeals) {
            dispatch(toggleMealCompletion({ mealId: meal.id, date: currentDate }));
        }

        if (token && incompleteMeals.length > 0) {
            await Promise.all(
                incompleteMeals.map((meal) => (
                    upsertMealCompletion({
                        mealId: meal.id,
                        date: currentDate,
                        mealType: meal.type,
                        completed: true,
                        completedAt: Date.now(),
                        selectedOptions: selections[meal.id],
                    }, token).catch(() => null)
                ))
            );
        }
    }, [dispatch, mealsForDate, isMealCompleted, currentDate, token, selections]);

    // Get meals with completion status
    const mealsWithStatus = useMemo(() => {
        return mealsForDate.map(meal => ({
            ...meal,
            completed: isMealCompleted(meal.id),
            completion: getCompletion(meal.id),
        }));
    }, [mealsForDate, isMealCompleted, getCompletion]);

    return {
        // State
        completions,
        currentDate,
        // Computed
        progress,
        mealsWithStatus,
        allCompleted: progress.completed === progress.total && progress.total > 0,
        noneCompleted: progress.completed === 0,
        // Actions
        isMealCompleted,
        getCompletion,
        toggleCompletion,
        completeAll,
    };
}

export default useMealCompletions;
