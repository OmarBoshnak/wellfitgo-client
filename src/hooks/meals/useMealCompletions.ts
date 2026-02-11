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
    selectMealsIsMealInProgress,
    setCompletions,
    setSelections,
    toggleMealCompletion,
    setMealInProgress,
    clearDailyState,
} from '@/src/shared/store/slices/mealsSlice';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { getMealCompletions, upsertMealCompletion } from '@/src/shared/services/backend/api';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';

// Helper function to get today's date string
const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

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

    // Check if we need to clear state due to date change
    const todayDate = getTodayDateString();
    const isDifferentDay = currentDate !== todayDate;

    // Auto-clear state when date changes (daily reset logic)
    useEffect(() => {
        if (isDifferentDay && (completions.length > 0 || Object.keys(selections).length > 0)) {
            console.log('🔄 [DAILY RESET] Date changed, clearing meal state:', {
                currentDate,
                todayDate,
                completionsCount: completions.length,
                selectionsCount: Object.keys(selections).length
            });
            
            // Clear the state for the new day
            dispatch(clearDailyState());
        }
    }, [currentDate, todayDate, isDifferentDay, completions.length, Object.keys(selections).length, dispatch]);

    // Check if a specific meal is completed
    const isMealCompleted = useCallback((mealId: string): boolean => {
        return completions.some(c => c.mealId === mealId && c.date === currentDate);
    }, [completions, currentDate]);

    // Get completion for a meal
    const getCompletion = useCallback((mealId: string) => {
        return completions.find(c => c.mealId === mealId && c.date === currentDate);
    }, [completions, currentDate]);

    useEffect(() => {
        console.log('🍽️ [DEBUG] Meal completions effect triggered:', { token, currentDate });

        if (!token) {
            console.log('🍽️ [DEBUG] No token - skipping meal completions load');
            return;
        }

        // Verify token format (basic check)
        if (token.length < 10) {
            console.error('🍽️ [DEBUG] Token seems too short:', token.length);
        }

        console.log('🍽️ [DEBUG] Token verification:', {
            exists: !!token,
            length: token.length,
            startsWithBearer: token.startsWith('Bearer '),
            firstChars: token.substring(0, 20) + '...',
            lastChars: '...' + token.substring(token.length - 20)
        });

        let isActive = true;

        console.log('🍽️ [DEBUG] Loading meal completions for date:', currentDate);

        getMealCompletions(token, currentDate)
            .then((response) => {
                console.log('🍽️ [DEBUG] Meal completions response:', response);

                if (!isActive) return;
                const completionItems = Array.isArray(response?.data?.completions)
                    ? response?.data?.completions
                    : [];

                console.log('🍽️ [DEBUG] Completion items found:', completionItems.length);

                const normalizedCompletions = completionItems
                    .filter((item) => item?.mealId && item?.date && typeof item?.completedAt === 'number')
                    .map((item) => ({
                        id: item?.id || `comp_${item?.mealId}_${item?.date}`,
                        mealId: item!.mealId!,
                        date: item!.date!,
                        completedAt: item!.completedAt as number,
                        selectedOptions: item?.selectedOptions,
                    }));

                console.log('🍽️ [DEBUG] Normalized completions:', normalizedCompletions);
                dispatch(setCompletions(normalizedCompletions));

                const selectionsMap = response?.data?.selections;
                console.log('🍽️ [DEBUG] Selections map:', selectionsMap);

                if (selectionsMap && typeof selectionsMap === 'object') {
                    dispatch(setSelections(selectionsMap));
                }
            })
            .catch((error) => {
                console.error('🍽️ [DEBUG] Failed to load meal completions:', error);
                console.error('🍽️ [DEBUG] Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                });
                if (!isActive) return;
            });

        return () => {
            isActive = false;
        };
    }, [token, currentDate, dispatch]);

    // Toggle meal completion with haptic feedback
    const toggleCompletion = useCallback(async (mealId: string) => {
        console.log('🍽️ [DEBUG] Toggle completion started:', { mealId, currentDate });

        const isCurrentlyCompleted = isMealCompleted(mealId);
        console.log('🍽️ [DEBUG] Current completion status:', { mealId, isCompleted: isCurrentlyCompleted });

        // Set progress state
        dispatch(setMealInProgress({ mealId, inProgress: true }));

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
        console.log('🍽️ [DEBUG] Making optimistic update...');
        dispatch(toggleMealCompletion({ mealId, date: currentDate }));

        if (!token) {
            console.error('🍽️ [DEBUG] No token available - aborting API call');
            // Clear progress state if no token
            dispatch(setMealInProgress({ mealId, inProgress: false }));
            return;
        }

        console.log('🍽️ [DEBUG] Token available, proceeding with API call');

        const meal = mealsForDate.find(m => m.id === mealId);
        const completed = !isCurrentlyCompleted;

        console.log('🍽️ [DEBUG] API call parameters:', {
            mealId,
            date: currentDate,
            mealType: meal?.type,
            completed,
            mealName: meal?.nameAr || meal?.name,
            hasSelections: !!selections[mealId],
            selections: selections[mealId]
        });

        try {
            console.log('🍽️ [DEBUG] Calling upsertMealCompletion API...');
            const response = await upsertMealCompletion({
                mealId,
                date: currentDate,
                mealType: meal?.type,
                completed,
                completedAt: completed ? Date.now() : undefined,
                selectedOptions: selections[mealId],
            }, token);

            console.log('🍽️ [DEBUG] API response:', response);

            if (!response.success) {
                console.error('🍽️ [DEBUG] API returned error:', response.message);
                // Revert optimistic update on error
                dispatch(toggleMealCompletion({ mealId, date: currentDate }));
            } else {
                console.log('🍽️ [DEBUG] API call successful - completion saved');
            }
        } catch (error) {
            console.error('🍽️ [DEBUG] API call failed:', error);
            console.error('🍽️ [DEBUG] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            // Revert optimistic update on error
            dispatch(toggleMealCompletion({ mealId, date: currentDate }));
        } finally {
            // Clear progress state
            dispatch(setMealInProgress({ mealId, inProgress: false }));
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
        isMealInProgress: selectMealsIsMealInProgress,
    };
}

export default useMealCompletions;
