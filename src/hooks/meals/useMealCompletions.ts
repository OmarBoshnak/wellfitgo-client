/**
 * useMealCompletions Hook
 * @description Manages meal completion state with optimistic updates
 */

import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectCompletions,
    selectSelectedDate,
    selectDayOffset,
    selectMealPlan,
    selectMealsForSelectedDate,
    selectCompletionProgress,
    toggleMealCompletion,
} from '@/src/shared/store/slices/mealsSlice';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';

/**
 * Hook for managing meal completions with haptics
 */
export function useMealCompletions() {
    const dispatch = useAppDispatch();

    // Selectors
    const completions = useAppSelector(selectCompletions);
    const selectedDate = useAppSelector(selectSelectedDate);
    const dayOffset = useAppSelector(selectDayOffset);
    const plan = useAppSelector(selectMealPlan);
    const mealsForDate = useAppSelector(selectMealsForSelectedDate);
    const progress = useAppSelector(selectCompletionProgress);

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

    // Toggle meal completion with haptic feedback
    const toggleCompletion = useCallback(async (mealId: string) => {
        // Trigger haptic feedback
        if (Platform.OS !== 'web') {
            try {
                const isCurrentlyCompleted = isMealCompleted(mealId);
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
    }, [dispatch, currentDate, isMealCompleted]);

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
    }, [dispatch, mealsForDate, isMealCompleted, currentDate]);

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
