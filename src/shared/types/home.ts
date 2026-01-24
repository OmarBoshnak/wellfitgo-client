/**
 * Home Types
 * @description TypeScript interfaces for HomeScreen data
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
    id: string;
    name: string;
    nameAr: string;
    email?: string;
    avatar?: string;
    createdAt: number;
}

// ============================================================================
// Weight Types
// ============================================================================

export interface WeightEntry {
    date: string; // ISO date string
    weight: number; // in kg
    timestamp: number;
}

export interface WeightData {
    currentWeight: number;
    targetWeight: number;
    startWeight: number;
    unit: 'kg' | 'lb';
    history: WeightEntry[];
}

export interface WeightProgress {
    currentWeight: number;
    targetWeight: number;
    startWeight: number;
    progressPercentage: number;
    totalLost: number;
    remainingToGoal: number;
    weeklyData: WeightEntry[];
    trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// Meal Types
// ============================================================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
    id: string;
    name: string;
    nameAr: string;
    type: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string; // HH:mm format
    isCompleted: boolean;
    imageUrl?: string;
}

export interface DailyNutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
}

// ============================================================================
// Quick Actions Types
// ============================================================================

export interface WaterIntake {
    current: number; // in ml
    target: number; // in ml
    glassSize: number; // in ml
}

export interface PlanProgress {
    completedDays: number;
    totalDays: number;
    currentDay: number;
}

export interface QuickAction {
    id: string;
    type: 'water' | 'plan' | 'activity';
    title: string;
    titleAr: string;
    icon: string;
    value: number;
    target: number;
}

// ============================================================================
// Home State Types
// ============================================================================

export interface HomeState {
    user: User | null;
    weightData: WeightData | null;
    meals: MealItem[];
    waterIntake: WaterIntake;
    planProgress: PlanProgress;
    isLoading: boolean;
    error: string | null;
    lastRefresh: number | null;
}

// ============================================================================
// API Response Types (for future backend integration)
// ============================================================================

export interface HomeDataResponse {
    user: User;
    weight: WeightData;
    meals: MealItem[];
    water: WaterIntake;
    plan: PlanProgress;
}

export interface ApiError {
    code: string;
    message: string;
    messageAr: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface HomeHeaderProps {
    userName: string;
    userAvatar?: string;
    greeting: string;
    onProfilePress: () => void;
}

export interface WeightProgressCardProps {
    progress: WeightProgress;
    onViewDetails: () => void;
    isLoading?: boolean;
}

export interface MealsCardProps {
    meals: MealItem[];
    nutrition: DailyNutrition;
    onMealToggle: (mealId: string) => void;
    onViewAll: () => void;
    isLoading?: boolean;
}

export interface QuickActionsProps {
    waterIntake: WaterIntake;
    planProgress: PlanProgress;
    onAddWater: () => void;
    onRemoveWater: () => void;
    onViewPlan: () => void;
}

export interface ProgressRingProps {
    progress: number; // 0-100
    size: number;
    strokeWidth: number;
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

export interface WeightChartProps {
    data: WeightEntry[];
    height?: number;
    showLabels?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_WATER_INTAKE: WaterIntake = {
    current: 0,
    target: 2500, // 2.5L
    glassSize: 250, // 250ml
};

export const DEFAULT_PLAN_PROGRESS: PlanProgress = {
    completedDays: 0,
    totalDays: 30,
    currentDay: 1,
};

export const DEFAULT_DAILY_NUTRITION: DailyNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 65,
};
