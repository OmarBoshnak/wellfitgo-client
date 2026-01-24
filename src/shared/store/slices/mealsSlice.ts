/**
 * Meals Redux Slice
 * @description State management for MealsScreen data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    MealsState,
    MealPlan,
    Meal,
    MealCompletion,
    MealSelections,
} from '@/src/shared/types/meals';

// ============================================================================
// Initial State
// ============================================================================

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const initialState: MealsState = {
    plan: null,
    meals: [],
    selectedDate: todayStr,
    completions: [],
    selections: {},
    dayOffset: 0,
    currentMonth: now.getMonth(),
    currentYear: now.getFullYear(),
    isLoading: false,
    error: null,
    lastRefresh: null,
    showChangeRequestModal: false,
    showOptionsSheet: false,
    activeMealId: null,
};

// ============================================================================
// Slice
// ============================================================================

const mealsSlice = createSlice({
    name: 'meals',
    initialState,
    reducers: {
        /**
         * Set loading state
         */
        setMealsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        /**
         * Set error state
         */
        setMealsError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        /**
         * Set meal plan
         */
        setMealPlan: (state, action: PayloadAction<MealPlan | null>) => {
            state.plan = action.payload;
        },

        /**
         * Set meals
         */
        setMeals: (state, action: PayloadAction<Meal[]>) => {
            state.meals = action.payload;
        },

        /**
         * Set selected date
         */
        setSelectedDate: (state, action: PayloadAction<string>) => {
            state.selectedDate = action.payload;
        },

        /**
         * Set current month/year for calendar
         */
        setCalendarMonth: (state, action: PayloadAction<{ month: number; year: number }>) => {
            state.currentMonth = action.payload.month;
            state.currentYear = action.payload.year;
        },

        /**
         * Set day offset (for daily format navigation)
         */
        setDayOffset: (state, action: PayloadAction<number>) => {
            state.dayOffset = action.payload;
        },

        /**
         * Navigate day (for daily format)
         */
        navigateDay: (state, action: PayloadAction<'prev' | 'next'>) => {
            if (action.payload === 'next') {
                state.dayOffset = Math.min(state.dayOffset + 1, 6);
            } else {
                state.dayOffset = Math.max(state.dayOffset - 1, 0);
            }
        },

        /**
         * Set completions
         */
        setCompletions: (state, action: PayloadAction<MealCompletion[]>) => {
            state.completions = action.payload;
        },

        /**
         * Toggle meal completion (optimistic update)
         */
        toggleMealCompletion: (state, action: PayloadAction<{ mealId: string; date: string }>) => {
            const { mealId, date } = action.payload;
            const existingIndex = state.completions.findIndex(
                c => c.mealId === mealId && c.date === date
            );

            if (existingIndex >= 0) {
                // Remove completion
                state.completions.splice(existingIndex, 1);
            } else {
                // Add completion
                state.completions.push({
                    id: `comp_${Date.now()}`,
                    mealId,
                    date,
                    completedAt: Date.now(),
                });
            }
        },

        /**
         * Set selections
         */
        setSelections: (state, action: PayloadAction<MealSelections>) => {
            state.selections = action.payload;
        },

        /**
         * Select meal option
         */
        selectMealOption: (
            state,
            action: PayloadAction<{
                mealId: string;
                categoryId: string;
                optionId: string;
                maxSelect?: number;
            }>
        ) => {
            const { mealId, categoryId, optionId, maxSelect = 1 } = action.payload;

            // Initialize if needed
            if (!state.selections[mealId]) {
                state.selections[mealId] = {};
            }
            if (!state.selections[mealId][categoryId]) {
                state.selections[mealId][categoryId] = [];
            }

            const currentSelections = state.selections[mealId][categoryId];
            const existingIndex = currentSelections.indexOf(optionId);

            if (existingIndex >= 0) {
                // Remove selection
                currentSelections.splice(existingIndex, 1);
            } else {
                // Add selection (respecting maxSelect)
                if (currentSelections.length >= maxSelect) {
                    currentSelections.shift(); // Remove oldest
                }
                currentSelections.push(optionId);
            }
        },

        /**
         * Show/hide change request modal
         */
        setShowChangeRequestModal: (state, action: PayloadAction<boolean>) => {
            state.showChangeRequestModal = action.payload;
        },

        /**
         * Show/hide options sheet
         */
        setShowOptionsSheet: (state, action: PayloadAction<boolean>) => {
            state.showOptionsSheet = action.payload;
            if (!action.payload) {
                state.activeMealId = null;
            }
        },

        /**
         * Set active meal for options sheet
         */
        setActiveMeal: (state, action: PayloadAction<string | null>) => {
            state.activeMealId = action.payload;
            state.showOptionsSheet = action.payload !== null;
        },

        /**
         * Set all meals data at once
         */
        setMealsData: (
            state,
            action: PayloadAction<{
                plan: MealPlan;
                meals: Meal[];
                completions: MealCompletion[];
            }>
        ) => {
            state.plan = action.payload.plan;
            state.meals = action.payload.meals;
            state.completions = action.payload.completions;
            state.isLoading = false;
            state.error = null;
            state.lastRefresh = Date.now();
        },

        /**
         * Reset meals state
         */
        resetMeals: () => initialState,
    },
});

// ============================================================================
// Selectors
// ============================================================================

type MealsStateRoot = { meals: MealsState };

export const selectMealPlan = (state: MealsStateRoot) => state.meals.plan;
export const selectMeals = (state: MealsStateRoot) => state.meals.meals;
export const selectSelectedDate = (state: MealsStateRoot) => state.meals.selectedDate;
export const selectCompletions = (state: MealsStateRoot) => state.meals.completions;
export const selectSelections = (state: MealsStateRoot) => state.meals.selections;
export const selectDayOffset = (state: MealsStateRoot) => state.meals.dayOffset;
export const selectCurrentMonth = (state: MealsStateRoot) => state.meals.currentMonth;
export const selectCurrentYear = (state: MealsStateRoot) => state.meals.currentYear;
export const selectMealsLoading = (state: MealsStateRoot) => state.meals.isLoading;
export const selectMealsError = (state: MealsStateRoot) => state.meals.error;
export const selectShowChangeRequestModal = (state: MealsStateRoot) => state.meals.showChangeRequestModal;
export const selectShowOptionsSheet = (state: MealsStateRoot) => state.meals.showOptionsSheet;
export const selectActiveMealId = (state: MealsStateRoot) => state.meals.activeMealId;

// Computed selectors
export const selectMealPlanFormat = (state: MealsStateRoot) => state.meals.plan?.format || 'general';

export const selectMealsForSelectedDate = (state: MealsStateRoot) => {
    const { plan, meals, selectedDate, dayOffset } = state.meals;

    if (plan?.format === 'daily') {
        // For daily format, get meals for current day index
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setDate(selectedDateObj.getDate() + dayOffset);
        const dayIndex = selectedDateObj.getDay();
        return meals.filter(m => m.dayIndex === dayIndex);
    }

    // For general format, return all meals
    return meals;
};

export const selectCompletionsForDate = (state: MealsStateRoot) => {
    const { completions, selectedDate, dayOffset, plan } = state.meals;

    if (plan?.format === 'daily') {
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setDate(selectedDateObj.getDate() + dayOffset);
        const dateStr = selectedDateObj.toISOString().split('T')[0];
        return completions.filter(c => c.date === dateStr);
    }

    return completions.filter(c => c.date === selectedDate);
};

export const selectCompletionProgress = (state: MealsStateRoot) => {
    const meals = selectMealsForSelectedDate(state);
    const completions = selectCompletionsForDate(state);

    const completed = completions.length;
    const total = meals.length;

    return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
};

export const selectIsMealCompleted = (mealId: string, date: string) => (state: MealsStateRoot) => {
    return state.meals.completions.some(c => c.mealId === mealId && c.date === date);
};

export const selectMealSelections = (mealId: string) => (state: MealsStateRoot) => {
    return state.meals.selections[mealId] || {};
};

export const selectActiveMeal = (state: MealsStateRoot) => {
    const { activeMealId, meals } = state.meals;
    if (!activeMealId) return null;
    return meals.find(m => m.id === activeMealId) || null;
};

// ============================================================================
// Exports
// ============================================================================

export const {
    setMealsLoading,
    setMealsError,
    setMealPlan,
    setMeals,
    setSelectedDate,
    setCalendarMonth,
    setDayOffset,
    navigateDay,
    setCompletions,
    toggleMealCompletion,
    setSelections,
    selectMealOption,
    setShowChangeRequestModal,
    setShowOptionsSheet,
    setActiveMeal,
    setMealsData,
    resetMeals,
} = mealsSlice.actions;

export default mealsSlice.reducer;
