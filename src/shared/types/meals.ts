/**
 * Meals Types
 * @description TypeScript interfaces for MealsScreen data
 */

import React from 'react';

// ============================================================================
// Core Meal Plan Types
// ============================================================================

export type MealPlanFormat = 'daily' | 'general';

export interface MealPlan {
    id: string;
    name: string;
    nameAr: string;
    format: MealPlanFormat;
    startDate: string; // ISO date string
    endDate?: string; // ISO date string
    emoji?: string;
    tags?: string[];
    tagsAr?: string[];
    description?: string;
    descriptionAr?: string;
    doctorId?: string;
    doctorName?: string;
    doctorNameAr?: string;
}

// ============================================================================
// Meal Category & Options Types
// ============================================================================

export interface MealOption {
    id: string;
    text: string;
    textAr?: string;
    selected?: boolean;
    calories?: number;
    serving?: string;
    servingAr?: string;
}

export interface MealCategory {
    id: string;
    name: string;
    nameAr?: string;
    emoji?: string;
    minSelect?: number; // Minimum options to select
    maxSelect?: number; // Maximum options to select
    options: MealOption[];
}

// ============================================================================
// Meal Types
// ============================================================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface Meal {
    id: string;
    name: string;
    nameAr?: string;
    type?: MealType;
    emoji?: string;
    time?: string; // HH:mm format
    description?: string;
    descriptionAr?: string;
    categories?: MealCategory[];
    completed?: boolean;
    completionId?: string;
    completedAt?: number; // timestamp
    dayIndex?: number; // For daily format (0 = Sunday, 6 = Saturday)
}

// ============================================================================
// Completion & History Types
// ============================================================================

export interface MealCompletion {
    id: string;
    mealId: string;
    date: string; // ISO date string (YYYY-MM-DD)
    completedAt: number;
    selectedOptions?: Record<string, string[]>; // categoryId -> optionIds
}

export interface DayMealStatus {
    date: string; // ISO date string
    completed: number;
    total: number;
    percentage: number;
}

export interface MealHistory {
    [date: string]: DayMealStatus; // date key is YYYY-MM-DD
}

// ============================================================================
// Selection Types
// ============================================================================

export interface MealSelection {
    mealId: string;
    categoryId: string;
    optionIds: string[];
}

export type MealSelections = Record<string, Record<string, string[]>>; // mealId -> categoryId -> optionIds

// ============================================================================
// Calendar Types
// ============================================================================

export interface MealCalendarDay {
    date: Date;
    dateString: string; // YYYY-MM-DD
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    isFuture: boolean;
    status?: DayMealStatus;
}

// ============================================================================
// Redux State Types
// ============================================================================

export interface MealsState {
    plan: MealPlan | null;
    meals: Meal[];
    selectedDate: string; // ISO date string (YYYY-MM-DD)
    completions: MealCompletion[];
    selections: MealSelections;
    dayOffset: number; // For daily format navigation
    currentMonth: number; // 0-11
    currentYear: number;
    isLoading: boolean;
    error: string | null;
    lastRefresh: number | null;
    // UI state
    showChangeRequestModal: boolean;
    showOptionsSheet: boolean;
    activeMealId: string | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface MealsHeaderProps {
    title: string;
    onHelpPress?: () => void;
    onReceiptPress?: () => void;
}

export interface DietPlanCardProps {
    plan: MealPlan;
    onChangeRequest?: () => void;
    isLoading?: boolean;
}

export interface MealCalendarProps {
    currentMonth: number;
    currentYear: number;
    selectedDate: string;
    mealHistory: MealHistory;
    onMonthChange: (month: number, year: number) => void;
    onDaySelect: (date: string) => void;
}

export interface DayNavigatorProps {
    currentDate: string;
    dayOffset: number;
    maxOffset?: number;
    minOffset?: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export interface MealListProps {
    meals: Meal[];
    format: MealPlanFormat;
    onMealToggle: (mealId: string) => void;
    onMealOptions: (mealId: string) => void;
    isLoading?: boolean;
}

export interface DailyMealCardProps {
    meal: Meal;
    onToggle: () => void;
    onOptionsPress?: () => void;
}

export interface GeneralMealCardProps {
    meal: Meal;
    selections: Record<string, string[]>; // categoryId -> optionIds
    onToggle: () => void;
    onSelectOption: (categoryId: string, optionId: string) => void;
    onOptionsPress?: () => void;
}

export interface MealOptionsSheetProps {
    visible: boolean;
    meal: Meal | null;
    selections: Record<string, string[]>;
    onClose: () => void;
    onSelectOption: (mealId: string, categoryId: string, optionId: string) => void;
    onConfirm: () => void;
}

export interface ChangeRequestModalProps {
    visible: boolean;
    planName: string;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export interface MealsErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onRetry?: () => void;
    sectionName?: string;
}

export interface MealsLoadingSkeletonProps {
    format?: MealPlanFormat;
}

// ============================================================================
// API Response Types (for future backend integration)
// ============================================================================

export interface MealsDataResponse {
    plan: MealPlan;
    meals: Meal[];
    completions: MealCompletion[];
}

export interface MealCompletionRequest {
    mealId: string;
    date: string;
    selectedOptions?: Record<string, string[]>;
}

export interface MealCompletionResponse {
    completion: MealCompletion;
    success: boolean;
}

export interface ChangeRequestPayload {
    planId: string;
    reason: string;
    requestedAt: number;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_MEALS_STATE: Omit<MealsState, 'selectedDate' | 'currentMonth' | 'currentYear'> = {
    plan: null,
    meals: [],
    completions: [],
    selections: {},
    dayOffset: 0,
    isLoading: false,
    error: null,
    lastRefresh: null,
    showChangeRequestModal: false,
    showOptionsSheet: false,
    activeMealId: null,
};

// ============================================================================
// Utility Types
// ============================================================================

export type MealsByDay = Record<number, Meal[]>; // dayIndex -> meals (for daily format)
export type MealsByDate = Record<string, Meal[]>; // date string -> meals
