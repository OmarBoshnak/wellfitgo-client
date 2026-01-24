/**
 * Home Mock Data
 * @description Mock data providers for development and testing
 */

import {
    User,
    WeightData,
    WeightEntry,
    MealItem,
    WaterIntake,
    PlanProgress,
    DailyNutrition,
    DEFAULT_WATER_INTAKE,
    DEFAULT_PLAN_PROGRESS,
} from '@/src/shared/types/home';

// ============================================================================
// Mock User
// ============================================================================

export const mockUser: User = {
    id: 'user_001',
    name: 'Omar Ahmed',
    nameAr: 'عمر أحمد',
    email: 'omar@example.com',
    avatar: undefined,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
};

// ============================================================================
// Mock Weight Data
// ============================================================================

const generateWeeklyWeightData = (): WeightEntry[] => {
    const data: WeightEntry[] = [];
    const baseWeight = 85;
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Simulate gradual weight loss with small variations
        const variation = (Math.random() - 0.5) * 0.4;
        const weight = baseWeight - (6 - i) * 0.15 + variation;
        data.push({
            date: date.toISOString().split('T')[0],
            weight: Math.round(weight * 10) / 10,
            timestamp: date.getTime(),
        });
    }
    return data;
};

export const mockWeightData: WeightData = {
    currentWeight: 84.2,
    targetWeight: 75,
    startWeight: 90,
    unit: 'kg',
    history: generateWeeklyWeightData(),
};

// ============================================================================
// Mock Meals
// ============================================================================

export const mockMeals: MealItem[] = [
    {
        id: 'meal_001',
        name: 'Oatmeal with Fruits',
        nameAr: 'شوفان بالفواكه',
        type: 'breakfast',
        calories: 350,
        protein: 12,
        carbs: 55,
        fat: 8,
        time: '08:00',
        isCompleted: true,
        imageUrl: undefined,
    },
    {
        id: 'meal_002',
        name: 'Grilled Chicken Salad',
        nameAr: 'سلطة دجاج مشوي',
        type: 'lunch',
        calories: 420,
        protein: 35,
        carbs: 25,
        fat: 18,
        time: '13:00',
        isCompleted: false,
        imageUrl: undefined,
    },
    {
        id: 'meal_003',
        name: 'Greek Yogurt',
        nameAr: 'زبادي يوناني',
        type: 'snack',
        calories: 150,
        protein: 15,
        carbs: 12,
        fat: 5,
        time: '16:00',
        isCompleted: false,
        imageUrl: undefined,
    },
    {
        id: 'meal_004',
        name: 'Salmon with Vegetables',
        nameAr: 'سلمون مع خضروات',
        type: 'dinner',
        calories: 480,
        protein: 38,
        carbs: 20,
        fat: 22,
        time: '19:00',
        isCompleted: false,
        imageUrl: undefined,
    },
];

// ============================================================================
// Mock Water & Plan Progress
// ============================================================================

export const mockWaterIntake: WaterIntake = {
    ...DEFAULT_WATER_INTAKE,
    current: 1000, // 1L
};

export const mockPlanProgress: PlanProgress = {
    ...DEFAULT_PLAN_PROGRESS,
    completedDays: 12,
    currentDay: 13,
};

// ============================================================================
// Computed Mock Data
// ============================================================================

export const computeMockNutrition = (meals: MealItem[]): DailyNutrition => {
    const completed = meals.filter(m => m.isCompleted);
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
};

// ============================================================================
// Mock API Functions
// ============================================================================

/**
 * Simulate fetching home data
 */
export async function fetchMockHomeData(delayMs: number = 800): Promise<{
    user: User;
    weightData: WeightData;
    meals: MealItem[];
    waterIntake: WaterIntake;
    planProgress: PlanProgress;
}> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: mockUser,
                weightData: {
                    ...mockWeightData,
                    history: generateWeeklyWeightData(),
                },
                meals: [...mockMeals],
                waterIntake: { ...mockWaterIntake },
                planProgress: { ...mockPlanProgress },
            });
        }, delayMs);
    });
}

/**
 * Simulate toggling meal completion
 */
export async function toggleMockMealCompletion(
    mealId: string,
    delayMs: number = 200
): Promise<{ success: boolean; mealId: string; isCompleted: boolean }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const meal = mockMeals.find(m => m.id === mealId);
            if (meal) {
                meal.isCompleted = !meal.isCompleted;
                resolve({
                    success: true,
                    mealId,
                    isCompleted: meal.isCompleted,
                });
            } else {
                resolve({
                    success: false,
                    mealId,
                    isCompleted: false,
                });
            }
        }, delayMs);
    });
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'صباح الخير';
    } else if (hour < 17) {
        return 'مساء الخير';
    } else {
        return 'مساء الخير';
    }
}

/**
 * Get Arabic day name
 */
export function getArabicDayName(date: Date): string {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

/**
 * Get Arabic meal type name
 */
export function getMealTypeNameAr(type: MealItem['type']): string {
    const names: Record<MealItem['type'], string> = {
        breakfast: 'الإفطار',
        lunch: 'الغداء',
        dinner: 'العشاء',
        snack: 'وجبة خفيفة',
    };
    return names[type];
}
