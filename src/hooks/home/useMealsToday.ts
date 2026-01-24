/**
 * useMealsToday Hook
 * @description Handles meal data processing and nutrition calculations
 */

import { useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/src/shared/store';
import { selectMeals, toggleMealCompletion } from '@/src/shared/store/slices/homeSlice';
import { MealItem, DailyNutrition, MealType } from '@/src/shared/types/home';
import { getMealTypeNameAr } from '@/src/shared/utils/homeData';

/**
 * Hook for meal data and nutrition calculations
 */
export function useMealsToday() {
    const dispatch = useAppDispatch();
    const meals = useAppSelector(selectMeals);

    // Group meals by type
    const mealsByType = useMemo(() => {
        const grouped: Record<MealType, MealItem[]> = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        };

        meals.forEach(meal => {
            grouped[meal.type].push(meal);
        });

        return grouped;
    }, [meals]);

    // Get completed meals
    const completedMeals = useMemo(() =>
        meals.filter(m => m.isCompleted),
        [meals]);

    // Get upcoming meals
    const upcomingMeals = useMemo(() =>
        meals.filter(m => !m.isCompleted),
        [meals]);

    // Get next meal (first uncompleted)
    const nextMeal = useMemo(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const upcoming = meals
            .filter(m => !m.isCompleted)
            .sort((a, b) => a.time.localeCompare(b.time));

        // Find the next meal based on current time
        const nextByTime = upcoming.find(m => m.time >= currentTime);
        return nextByTime || upcoming[0] || null;
    }, [meals]);

    // Calculate daily nutrition from completed meals
    const nutrition = useMemo((): DailyNutrition => {
        const completed = completedMeals;
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
    }, [completedMeals]);

    // Calculate total planned nutrition
    const plannedNutrition = useMemo(() => ({
        calories: meals.reduce((sum, m) => sum + m.calories, 0),
        protein: meals.reduce((sum, m) => sum + m.protein, 0),
        carbs: meals.reduce((sum, m) => sum + m.carbs, 0),
        fat: meals.reduce((sum, m) => sum + m.fat, 0),
    }), [meals]);

    // Completion percentage
    const completionPercentage = useMemo(() => {
        if (meals.length === 0) return 0;
        return Math.round((completedMeals.length / meals.length) * 100);
    }, [meals, completedMeals]);

    // Toggle meal completion
    const handleToggleMeal = useCallback((mealId: string) => {
        dispatch(toggleMealCompletion(mealId));
    }, [dispatch]);

    // Get formatted meal time
    const formatMealTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'م' : 'ص';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    // Get meal type label
    const getMealTypeLabel = (type: MealType): string => {
        return getMealTypeNameAr(type);
    };

    return {
        meals,
        mealsByType,
        completedMeals,
        upcomingMeals,
        nextMeal,
        nutrition,
        plannedNutrition,
        completionPercentage,
        handleToggleMeal,
        formatMealTime,
        getMealTypeLabel,
    };
}

export default useMealsToday;
