/**
 * useMealSelections Hook
 * @description Manages meal option selections
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectSelections,
    selectMeals,
    selectMealOption,
} from '@/src/shared/store/slices/mealsSlice';
import { MealCategory, MealOption } from '@/src/shared/types/meals';

/**
 * Hook for managing meal option selections
 */
export function useMealSelections() {
    const dispatch = useAppDispatch();

    // Selectors
    const selections = useAppSelector(selectSelections);
    const meals = useAppSelector(selectMeals);

    // Get selections for a specific meal
    const getSelectionsForMeal = useCallback((mealId: string): Record<string, string[]> => {
        return selections[mealId] || {};
    }, [selections]);

    // Get selected options for a category
    const getSelectedOptions = useCallback((mealId: string, categoryId: string): string[] => {
        return selections[mealId]?.[categoryId] || [];
    }, [selections]);

    // Check if an option is selected
    const isOptionSelected = useCallback((mealId: string, categoryId: string, optionId: string): boolean => {
        const categorySelections = selections[mealId]?.[categoryId] || [];
        return categorySelections.includes(optionId);
    }, [selections]);

    // Select an option
    const selectOption = useCallback((
        mealId: string,
        categoryId: string,
        optionId: string,
        maxSelect?: number
    ) => {
        dispatch(selectMealOption({ mealId, categoryId, optionId, maxSelect }));
    }, [dispatch]);

    // Get all selected options for a meal (flattened)
    const getAllSelectedOptionsForMeal = useCallback((mealId: string): MealOption[] => {
        const meal = meals.find(m => m.id === mealId);
        if (!meal?.categories) return [];

        const mealSelections = selections[mealId] || {};
        const selectedOptions: MealOption[] = [];

        meal.categories.forEach(category => {
            const categorySelections = mealSelections[category.id] || [];
            category.options.forEach(option => {
                if (categorySelections.includes(option.id)) {
                    selectedOptions.push(option);
                }
            });
        });

        return selectedOptions;
    }, [meals, selections]);

    // Calculate total calories for selected options
    const getCaloriesForMeal = useCallback((mealId: string): number => {
        const selectedOptions = getAllSelectedOptionsForMeal(mealId);
        return selectedOptions.reduce((sum, opt) => sum + (opt.calories || 0), 0);
    }, [getAllSelectedOptionsForMeal]);

    // Check if category requirements are met
    const isCategoryComplete = useCallback((
        mealId: string,
        category: MealCategory
    ): boolean => {
        const selectedCount = getSelectedOptions(mealId, category.id).length;
        const minSelect = category.minSelect || 0;
        return selectedCount >= minSelect;
    }, [getSelectedOptions]);

    // Check if all categories in meal are complete
    const isMealComplete = useCallback((mealId: string): boolean => {
        const meal = meals.find(m => m.id === mealId);
        if (!meal?.categories) return true;

        return meal.categories.every(category => isCategoryComplete(mealId, category));
    }, [meals, isCategoryComplete]);

    // Get selection status summary for a meal
    const getSelectionStatus = useCallback((mealId: string) => {
        const meal = meals.find(m => m.id === mealId);
        if (!meal?.categories) {
            return { total: 0, complete: 0, isComplete: true };
        }

        let complete = 0;
        meal.categories.forEach(category => {
            if (isCategoryComplete(mealId, category)) {
                complete++;
            }
        });

        return {
            total: meal.categories.length,
            complete,
            isComplete: complete === meal.categories.length,
        };
    }, [meals, isCategoryComplete]);

    return {
        // State
        selections,
        // Actions
        selectOption,
        // Getters
        getSelectionsForMeal,
        getSelectedOptions,
        isOptionSelected,
        getAllSelectedOptionsForMeal,
        getCaloriesForMeal,
        isCategoryComplete,
        isMealComplete,
        getSelectionStatus,
    };
}

export default useMealSelections;
