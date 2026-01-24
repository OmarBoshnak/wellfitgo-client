/**
 * Home Redux Slice
 * @description State management for HomeScreen data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    HomeState,
    User,
    WeightData,
    MealItem,
    WaterIntake,
    PlanProgress,
    DEFAULT_WATER_INTAKE,
    DEFAULT_PLAN_PROGRESS,
} from '@/src/shared/types/home';

// ============================================================================
// Initial State
// ============================================================================

const initialState: HomeState = {
    user: null,
    weightData: null,
    meals: [],
    waterIntake: { ...DEFAULT_WATER_INTAKE },
    planProgress: { ...DEFAULT_PLAN_PROGRESS },
    isLoading: false,
    error: null,
    lastRefresh: null,
};

// ============================================================================
// Slice
// ============================================================================

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        /**
         * Set loading state
         */
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        /**
         * Set error state
         */
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        /**
         * Set user data
         */
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },

        /**
         * Set weight data
         */
        setWeightData: (state, action: PayloadAction<WeightData | null>) => {
            state.weightData = action.payload;
        },

        /**
         * Set meals
         */
        setMeals: (state, action: PayloadAction<MealItem[]>) => {
            state.meals = action.payload;
        },

        /**
         * Toggle meal completion
         */
        toggleMealCompletion: (state, action: PayloadAction<string>) => {
            const meal = state.meals.find(m => m.id === action.payload);
            if (meal) {
                meal.isCompleted = !meal.isCompleted;
            }
        },

        /**
         * Set water intake
         */
        setWaterIntake: (state, action: PayloadAction<WaterIntake>) => {
            state.waterIntake = action.payload;
        },

        /**
         * Add water (one glass)
         */
        addWater: (state) => {
            const newAmount = state.waterIntake.current + state.waterIntake.glassSize;
            state.waterIntake.current = Math.min(newAmount, state.waterIntake.target * 1.5);
        },

        /**
         * Remove water (one glass)
         */
        removeWater: (state) => {
            const newAmount = state.waterIntake.current - state.waterIntake.glassSize;
            state.waterIntake.current = Math.max(newAmount, 0);
        },

        /**
         * Set plan progress
         */
        setPlanProgress: (state, action: PayloadAction<PlanProgress>) => {
            state.planProgress = action.payload;
        },

        /**
         * Set all home data at once
         */
        setHomeData: (
            state,
            action: PayloadAction<{
                user: User;
                weightData: WeightData;
                meals: MealItem[];
                waterIntake: WaterIntake;
                planProgress: PlanProgress;
            }>
        ) => {
            state.user = action.payload.user;
            state.weightData = action.payload.weightData;
            state.meals = action.payload.meals;
            state.waterIntake = action.payload.waterIntake;
            state.planProgress = action.payload.planProgress;
            state.isLoading = false;
            state.error = null;
            state.lastRefresh = Date.now();
        },

        /**
         * Reset home state
         */
        resetHome: () => initialState,
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectUser = (state: { home: HomeState }) => state.home.user;
export const selectWeightData = (state: { home: HomeState }) => state.home.weightData;
export const selectMeals = (state: { home: HomeState }) => state.home.meals;
export const selectWaterIntake = (state: { home: HomeState }) => state.home.waterIntake;
export const selectPlanProgress = (state: { home: HomeState }) => state.home.planProgress;
export const selectHomeLoading = (state: { home: HomeState }) => state.home.isLoading;
export const selectHomeError = (state: { home: HomeState }) => state.home.error;
export const selectLastRefresh = (state: { home: HomeState }) => state.home.lastRefresh;

// Computed selectors
export const selectCompletedMeals = (state: { home: HomeState }) =>
    state.home.meals.filter(m => m.isCompleted);

export const selectUpcomingMeals = (state: { home: HomeState }) =>
    state.home.meals.filter(m => !m.isCompleted);

export const selectWaterProgress = (state: { home: HomeState }) => {
    const { current, target } = state.home.waterIntake;
    return Math.min((current / target) * 100, 100);
};

export const selectPlanProgressPercent = (state: { home: HomeState }) => {
    const { completedDays, totalDays } = state.home.planProgress;
    return Math.round((completedDays / totalDays) * 100);
};

// ============================================================================
// Exports
// ============================================================================

export const {
    setLoading,
    setError,
    setUser,
    setWeightData,
    setMeals,
    toggleMealCompletion,
    setWaterIntake,
    addWater,
    removeWater,
    setPlanProgress,
    setHomeData,
    resetHome,
} = homeSlice.actions;

export default homeSlice.reducer;
