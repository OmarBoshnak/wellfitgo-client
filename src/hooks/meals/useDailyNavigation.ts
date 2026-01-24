/**
 * useDailyNavigation Hook
 * @description Manages day navigation for daily meal format
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectDayOffset,
    selectSelectedDate,
    selectMealPlan,
    navigateDay,
    setDayOffset,
} from '@/src/shared/store/slices/mealsSlice';
import { getWeekdayName } from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { formatDayNavigator, getRelativeDayLabel } from '@/src/shared/utils/dateTime/mealDateFormatting';

/**
 * Hook for daily format navigation
 */
export function useDailyNavigation() {
    const dispatch = useAppDispatch();

    // Selectors
    const dayOffset = useAppSelector(selectDayOffset);
    const selectedDate = useAppSelector(selectSelectedDate);
    const plan = useAppSelector(selectMealPlan);

    // Calculate current date
    const currentDate = useMemo(() => {
        const baseDate = new Date(selectedDate);
        baseDate.setDate(baseDate.getDate() + dayOffset);
        return baseDate;
    }, [selectedDate, dayOffset]);

    // Day index (0 = Sunday, 6 = Saturday)
    const dayIndex = useMemo(() => {
        return currentDate.getDay();
    }, [currentDate]);

    // Day name
    const dayName = useMemo(() => {
        return getWeekdayName(dayIndex, true); // Arabic
    }, [dayIndex]);

    // Day name in English
    const dayNameEn = useMemo(() => {
        return getWeekdayName(dayIndex, false);
    }, [dayIndex]);

    // Formatted display text
    const displayText = useMemo(() => {
        return formatDayNavigator(currentDate, true); // Arabic
    }, [currentDate]);

    // Relative label (Today, Tomorrow, etc.)
    const relativeLabel = useMemo(() => {
        return getRelativeDayLabel(currentDate, true);
    }, [currentDate]);

    // Navigation handlers
    const goToPrev = useCallback(() => {
        if (dayOffset > 0) {
            dispatch(navigateDay('prev'));
        }
    }, [dispatch, dayOffset]);

    const goToNext = useCallback(() => {
        if (dayOffset < 6) {
            dispatch(navigateDay('next'));
        }
    }, [dispatch, dayOffset]);

    const goToDay = useCallback((offset: number) => {
        dispatch(setDayOffset(Math.max(0, Math.min(6, offset))));
    }, [dispatch]);

    // Reset to today
    const goToToday = useCallback(() => {
        dispatch(setDayOffset(0));
    }, [dispatch]);

    // Can navigate
    const canGoPrev = dayOffset > 0;
    const canGoNext = dayOffset < 6;

    // Is today
    const isToday = dayOffset === 0;

    return {
        // State
        dayOffset,
        currentDate,
        dayIndex,
        // Display
        dayName,
        dayNameEn,
        displayText,
        relativeLabel,
        // Navigation
        goToPrev,
        goToNext,
        goToDay,
        goToToday,
        canGoPrev,
        canGoNext,
        isToday,
    };
}

export default useDailyNavigation;
