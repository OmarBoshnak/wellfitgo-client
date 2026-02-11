/**
 * useMealCalendar Hook
 * @description Manages calendar state and navigation for meals
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectCurrentMonth,
    selectCurrentYear,
    selectSelectedDate,
    selectCompletions,
    selectMeals,
    selectMealPlan,
    setCalendarMonth,
    setSelectedDate,
} from '@/src/shared/store/slices/mealsSlice';
import {
    generateMonthDays,
    navigateMonth,
    canNavigateToPrevMonth,
    canNavigateToNextMonth,
    groupDaysIntoWeeks,
    getWeekdayHeaders,
    toISODateString,
} from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { formatCalendarHeader } from '@/src/shared/utils/dateTime/mealDateFormatting';
import { MealHistory, DayMealStatus } from '@/src/shared/types/meals';
import { getMealHistory } from '@/src/shared/services/backend/api';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';

/**
 * Hook for calendar navigation and history
 */
export function useMealCalendar() {
    const dispatch = useAppDispatch();

    // Selectors
    const currentMonth = useAppSelector(selectCurrentMonth);
    const currentYear = useAppSelector(selectCurrentYear);
    const selectedDate = useAppSelector(selectSelectedDate);
    const completions = useAppSelector(selectCompletions);
    const meals = useAppSelector(selectMeals);
    const plan = useAppSelector(selectMealPlan);
    const token = useAppSelector(selectToken);

    const [remoteMealHistory, setRemoteMealHistory] = useState<MealHistory | null>(null);

    // Calculate meal history from local completions (for real-time updates)
    const localMealHistory = useMemo((): MealHistory => {
        const history: MealHistory = {};
        const totalMealsPerDay = meals.length;

        if (totalMealsPerDay === 0) {
            return history;
        }

        // Group completions by date
        completions.forEach(comp => {
            if (!history[comp.date]) {
                history[comp.date] = {
                    date: comp.date,
                    completed: 0,
                    total: totalMealsPerDay,
                    percentage: 0,
                };
            }
            history[comp.date].completed += 1;
            history[comp.date].percentage = Math.round(
                (history[comp.date].completed / totalMealsPerDay) * 100
            );
        });

        return history;
    }, [completions, meals]);

    // Merge remote and local history - local takes precedence for real-time updates
    const mealHistory = useMemo((): MealHistory => {
        const merged: MealHistory = { ...remoteMealHistory };

        // Merge local completions on top of remote data
        Object.entries(localMealHistory).forEach(([date, localStatus]) => {
            if (!merged[date]) {
                // Date only exists locally
                merged[date] = localStatus;
            } else {
                // Use higher completion count (allows optimistic updates)
                if (localStatus.completed > merged[date].completed) {
                    merged[date] = localStatus;
                }
            }
        });

        return merged;
    }, [remoteMealHistory, localMealHistory]);

    const mapHistoryResponse = useCallback((items?: DayMealStatus[]): MealHistory => {
        const history: MealHistory = {};
        if (!Array.isArray(items)) {
            return history;
        }

        items.forEach((day) => {
            history[day.date] = day;
        });

        return history;
    }, []);

    useEffect(() => {
        if (!token) {
            setRemoteMealHistory(null);
            return;
        }

        let isActive = true;
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const start = toISODateString(startDate);
        const end = toISODateString(endDate);

        getMealHistory(token, start, end)
            .then((response) => {
                if (!isActive) return;
                setRemoteMealHistory(mapHistoryResponse(response?.data));
            })
            .catch(() => {
                if (!isActive) return;
                setRemoteMealHistory(null);
            });

        return () => {
            isActive = false;
        };
    }, [token, currentMonth, currentYear, mapHistoryResponse]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        return generateMonthDays(currentMonth, currentYear, mealHistory);
    }, [currentMonth, currentYear, mealHistory]);

    // Group days into weeks
    const weeks = useMemo(() => {
        return groupDaysIntoWeeks(calendarDays);
    }, [calendarDays]);

    // Weekday headers
    const weekdayHeaders = useMemo(() => {
        return getWeekdayHeaders(true); // Arabic by default
    }, []);

    // Calendar header text
    const headerText = useMemo(() => {
        return formatCalendarHeader(currentMonth, currentYear, true); // Arabic
    }, [currentMonth, currentYear]);

    // Navigation handlers
    const goToPrevMonth = useCallback(() => {
        if (!canNavigateToPrevMonth(currentMonth, currentYear, plan?.startDate)) {
            return;
        }
        const { month, year } = navigateMonth(currentMonth, currentYear, 'prev');
        dispatch(setCalendarMonth({ month, year }));
    }, [dispatch, currentMonth, currentYear, plan?.startDate]);

    const goToNextMonth = useCallback(() => {
        if (!canNavigateToNextMonth(currentMonth, currentYear)) {
            return;
        }
        const { month, year } = navigateMonth(currentMonth, currentYear, 'next');
        dispatch(setCalendarMonth({ month, year }));
    }, [dispatch, currentMonth, currentYear]);

    const goToMonth = useCallback((month: number, year: number) => {
        dispatch(setCalendarMonth({ month, year }));
    }, [dispatch]);

    const selectDay = useCallback((dateString: string) => {
        dispatch(setSelectedDate(dateString));
    }, [dispatch]);

    // Get status for a specific date
    const getStatusForDate = useCallback((dateString: string): DayMealStatus | undefined => {
        return mealHistory[dateString];
    }, [mealHistory]);

    // Check if can navigate
    const canGoPrev = useMemo(() => {
        return canNavigateToPrevMonth(currentMonth, currentYear, plan?.startDate);
    }, [currentMonth, currentYear, plan?.startDate]);

    const canGoNext = useMemo(() => {
        return canNavigateToNextMonth(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    // Refresh history from backend
    const refreshHistory = useCallback(async () => {
        if (!token) return;

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const start = toISODateString(startDate);
        const end = toISODateString(endDate);

        try {
            const response = await getMealHistory(token, start, end);
            setRemoteMealHistory(mapHistoryResponse(response?.data));
        } catch {
            // Keep existing data on error
        }
    }, [token, currentMonth, currentYear, mapHistoryResponse]);

    return {
        // State
        currentMonth,
        currentYear,
        selectedDate,
        // Computed
        calendarDays,
        weeks,
        weekdayHeaders,
        headerText,
        mealHistory,
        canGoPrev,
        canGoNext,
        // Actions
        goToPrevMonth,
        goToNextMonth,
        goToMonth,
        selectDay,
        getStatusForDate,
        refreshHistory,
    };
}

export default useMealCalendar;
