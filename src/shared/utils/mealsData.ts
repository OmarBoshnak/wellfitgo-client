/**
 * Meals Mock Data
 * @description Mock data and helper functions for MealsScreen
 */

import {
    MealPlan,
    Meal,
    MealCompletion,
    MealHistory,
    DayMealStatus,
    MealCategory,
} from '@/src/shared/types/meals';

// ============================================================================
// Mock Meal Plan
// ============================================================================

export const mockMealPlan: MealPlan = {
    id: 'plan_001',
    name: 'Weight Loss Plan',
    nameAr: 'خطة إنقاص الوزن',
    format: 'general',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    emoji: '🥗',
    tags: ['Low Carb', 'High Protein', 'Healthy'],
    tagsAr: ['منخفض الكربوهيدرات', 'عالي البروتين', 'صحي'],
    description: 'A balanced diet plan focused on healthy weight loss with proper nutrition.',
    descriptionAr: 'خطة غذائية متوازنة تركز على إنقاص الوزن الصحي مع التغذية السليمة.',
    doctorId: 'doc_001',
    doctorName: 'Dr. Ahmed Hassan',
    doctorNameAr: 'د. أحمد حسن',
};

export const mockDailyMealPlan: MealPlan = {
    id: 'plan_002',
    name: 'Weekly Meal Plan',
    nameAr: 'خطة الوجبات الأسبوعية',
    format: 'daily',
    startDate: '2024-01-01',
    emoji: '📅',
    tags: ['Balanced', 'Variety'],
    tagsAr: ['متوازن', 'متنوع'],
    description: 'A weekly rotating meal plan with different meals each day.',
    descriptionAr: 'خطة وجبات أسبوعية دورية مع وجبات مختلفة كل يوم.',
};

// ============================================================================
// Mock Categories (for general format)
// ============================================================================

const breakfastCategories: MealCategory[] = [
    {
        id: 'protein',
        name: 'Protein',
        nameAr: 'البروتين',
        emoji: '🥚',
        minSelect: 1,
        maxSelect: 2,
        options: [
            { id: 'eggs_2', text: '2 Boiled Eggs', textAr: '٢ بيض مسلوق', calories: 155, serving: '2 eggs', servingAr: '٢ بيضة' },
            { id: 'eggs_3', text: '3 Scrambled Eggs', textAr: '٣ بيض مخفوق', calories: 232, serving: '3 eggs', servingAr: '٣ بيضات' },
            { id: 'cheese', text: 'Low-fat Cheese (50g)', textAr: 'جبنة قليلة الدسم (50 جم)', calories: 85, serving: '50g', servingAr: '٥٠ جم' },
            { id: 'labneh', text: 'Labneh (100g)', textAr: 'لبنة (100 جم)', calories: 95, serving: '100g', servingAr: '١٠٠ جم' },
        ],
    },
    {
        id: 'carbs',
        name: 'Carbohydrates',
        nameAr: 'الكربوهيدرات',
        emoji: '🍞',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'bread_1', text: '1 Whole Wheat Toast', textAr: '١ توست قمح كامل', calories: 70, serving: '1 slice', servingAr: 'شريحة واحدة' },
            { id: 'bread_2', text: '2 Whole Wheat Toast', textAr: '٢ توست قمح كامل', calories: 140, serving: '2 slices', servingAr: 'شريحتان' },
            { id: 'oats', text: 'Oats (40g)', textAr: 'شوفان (40 جم)', calories: 150, serving: '40g', servingAr: '٤٠ جم' },
        ],
    },
    {
        id: 'vegetables',
        name: 'Vegetables',
        nameAr: 'الخضروات',
        emoji: '🥒',
        minSelect: 0,
        maxSelect: 3,
        options: [
            { id: 'cucumber', text: 'Cucumber', textAr: 'خيار', calories: 8 },
            { id: 'tomato', text: 'Tomato', textAr: 'طماطم', calories: 22 },
            { id: 'lettuce', text: 'Lettuce', textAr: 'خس', calories: 5 },
        ],
    },
];

const lunchCategories: MealCategory[] = [
    {
        id: 'protein',
        name: 'Protein',
        nameAr: 'البروتين',
        emoji: '🍗',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'chicken_grilled', text: 'Grilled Chicken Breast (150g)', textAr: 'صدر دجاج مشوي (150 جم)', calories: 231 },
            { id: 'chicken_boiled', text: 'Boiled Chicken (150g)', textAr: 'دجاج مسلوق (150 جم)', calories: 215 },
            { id: 'fish_grilled', text: 'Grilled Fish (150g)', textAr: 'سمك مشوي (150 جم)', calories: 180 },
            { id: 'beef_lean', text: 'Lean Beef (120g)', textAr: 'لحم بقري خالي الدهن (120 جم)', calories: 250 },
        ],
    },
    {
        id: 'carbs',
        name: 'Carbohydrates',
        nameAr: 'الكربوهيدرات',
        emoji: '🍚',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'rice_brown', text: 'Brown Rice (100g)', textAr: 'أرز بني (100 جم)', calories: 111 },
            { id: 'rice_white', text: 'White Rice (80g)', textAr: 'أرز أبيض (80 جم)', calories: 103 },
            { id: 'pasta', text: 'Whole Wheat Pasta (100g)', textAr: 'معكرونة قمح كامل (100 جم)', calories: 124 },
            { id: 'potato', text: 'Baked Potato (150g)', textAr: 'بطاطس مخبوزة (150 جم)', calories: 130 },
        ],
    },
    {
        id: 'salad',
        name: 'Salad',
        nameAr: 'السلطة',
        emoji: '🥗',
        minSelect: 1,
        maxSelect: 2,
        options: [
            { id: 'green_salad', text: 'Green Salad', textAr: 'سلطة خضراء', calories: 25 },
            { id: 'fattoush', text: 'Fattoush Salad', textAr: 'سلطة فتوش', calories: 80 },
            { id: 'tabbouleh', text: 'Tabbouleh', textAr: 'تبولة', calories: 90 },
        ],
    },
];

const dinnerCategories: MealCategory[] = [
    {
        id: 'protein',
        name: 'Protein',
        nameAr: 'البروتين',
        emoji: '🥩',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'eggs_omelette', text: 'Egg Omelette (2 eggs)', textAr: 'أومليت (٢ بيضة)', calories: 180 },
            { id: 'tuna', text: 'Tuna (100g)', textAr: 'تونة (100 جم)', calories: 130 },
            { id: 'cottage_cheese', text: 'Cottage Cheese (150g)', textAr: 'جبن قريش (150 جم)', calories: 115 },
        ],
    },
    {
        id: 'side',
        name: 'Side',
        nameAr: 'طبق جانبي',
        emoji: '🥗',
        minSelect: 0,
        maxSelect: 2,
        options: [
            { id: 'yogurt', text: 'Low-fat Yogurt (150g)', textAr: 'زبادي قليل الدسم (150 جم)', calories: 93 },
            { id: 'salad', text: 'Mixed Salad', textAr: 'سلطة مشكلة', calories: 25 },
            { id: 'fruit', text: 'Fresh Fruit', textAr: 'فاكهة طازجة', calories: 60 },
        ],
    },
];

const snackCategories: MealCategory[] = [
    {
        id: 'snack',
        name: 'Snack Option',
        nameAr: 'خيار الوجبة الخفيفة',
        emoji: '🍎',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'apple', text: 'Apple', textAr: 'تفاحة', calories: 95 },
            { id: 'banana', text: 'Banana', textAr: 'موزة', calories: 105 },
            { id: 'nuts', text: 'Mixed Nuts (30g)', textAr: 'مكسرات مشكلة (30 جم)', calories: 175 },
            { id: 'dates', text: '3 Dates', textAr: '٣ تمرات', calories: 66 },
            { id: 'carrot', text: 'Carrot Sticks', textAr: 'أصابع الجزر', calories: 35 },
        ],
    },
];

// ============================================================================
// Mock Meals (General Format)
// ============================================================================

export const mockGeneralMeals: Meal[] = [
    {
        id: 'meal_breakfast',
        name: 'Breakfast',
        nameAr: 'الفطار',
        type: 'breakfast',
        emoji: '🍳',
        time: '08:00',
        categories: breakfastCategories,
    },
    {
        id: 'meal_lunch',
        name: 'Lunch',
        nameAr: 'الغداء',
        type: 'lunch',
        emoji: '🍽️',
        time: '13:00',
        categories: lunchCategories,
    },
    {
        id: 'meal_snack',
        name: 'Snack',
        nameAr: 'وجبة خفيفة',
        type: 'snack',
        emoji: '🍎',
        time: '16:00',
        categories: snackCategories,
    },
    {
        id: 'meal_dinner',
        name: 'Dinner',
        nameAr: 'العشاء',
        type: 'dinner',
        emoji: '🥗',
        time: '19:00',
        categories: dinnerCategories,
    },
];

// ============================================================================
// Mock Meals (Daily Format)
// ============================================================================

export const mockDailyMeals: Meal[] = [
    // Sunday (0)
    { id: 'daily_sun_breakfast', name: 'Sunday Breakfast', nameAr: 'فطور الأحد', type: 'breakfast', emoji: '🍳', time: '08:00', dayIndex: 0, description: 'Eggs with toast', descriptionAr: 'بيض مع توست' },
    { id: 'daily_sun_lunch', name: 'Sunday Lunch', nameAr: 'غداء الأحد', type: 'lunch', emoji: '🍗', time: '13:00', dayIndex: 0, description: 'Grilled chicken with rice', descriptionAr: 'دجاج مشوي مع أرز' },
    { id: 'daily_sun_dinner', name: 'Sunday Dinner', nameAr: 'عشاء الأحد', type: 'dinner', emoji: '🥗', time: '19:00', dayIndex: 0, description: 'Light salad', descriptionAr: 'سلطة خفيفة' },
    // Monday (1)
    { id: 'daily_mon_breakfast', name: 'Monday Breakfast', nameAr: 'فطور الإثنين', type: 'breakfast', emoji: '🥣', time: '08:00', dayIndex: 1, description: 'Oatmeal with fruits', descriptionAr: 'شوفان مع فواكه' },
    { id: 'daily_mon_lunch', name: 'Monday Lunch', nameAr: 'غداء الإثنين', type: 'lunch', emoji: '🐟', time: '13:00', dayIndex: 1, description: 'Grilled fish with vegetables', descriptionAr: 'سمك مشوي مع خضار' },
    { id: 'daily_mon_dinner', name: 'Monday Dinner', nameAr: 'عشاء الإثنين', type: 'dinner', emoji: '🥪', time: '19:00', dayIndex: 1, description: 'Tuna sandwich', descriptionAr: 'ساندويتش تونة' },
    // Tuesday (2)
    { id: 'daily_tue_breakfast', name: 'Tuesday Breakfast', nameAr: 'فطور الثلاثاء', type: 'breakfast', emoji: '🧀', time: '08:00', dayIndex: 2, description: 'Cheese with bread', descriptionAr: 'جبنة مع خبز' },
    { id: 'daily_tue_lunch', name: 'Tuesday Lunch', nameAr: 'غداء الثلاثاء', type: 'lunch', emoji: '🥩', time: '13:00', dayIndex: 2, description: 'Grilled beef with vegetables', descriptionAr: 'لحم مشوي مع خضار' },
    { id: 'daily_tue_dinner', name: 'Tuesday Dinner', nameAr: 'عشاء الثلاثاء', type: 'dinner', emoji: '🍲', time: '19:00', dayIndex: 2, description: 'Vegetable soup', descriptionAr: 'شوربة خضار' },
    // Wednesday (3)
    { id: 'daily_wed_breakfast', name: 'Wednesday Breakfast', nameAr: 'فطور الأربعاء', type: 'breakfast', emoji: '🥞', time: '08:00', dayIndex: 3, description: 'Whole wheat pancakes', descriptionAr: 'بان كيك قمح كامل' },
    { id: 'daily_wed_lunch', name: 'Wednesday Lunch', nameAr: 'غداء الأربعاء', type: 'lunch', emoji: '🍗', time: '13:00', dayIndex: 3, description: 'Baked chicken with potato', descriptionAr: 'دجاج مخبوز مع بطاطس' },
    { id: 'daily_wed_dinner', name: 'Wednesday Dinner', nameAr: 'عشاء الأربعاء', type: 'dinner', emoji: '🥗', time: '19:00', dayIndex: 3, description: 'Greek salad', descriptionAr: 'سلطة يونانية' },
    // Thursday (4)
    { id: 'daily_thu_breakfast', name: 'Thursday Breakfast', nameAr: 'فطور الخميس', type: 'breakfast', emoji: '🍳', time: '08:00', dayIndex: 4, description: 'Omelette with vegetables', descriptionAr: 'أومليت مع خضار' },
    { id: 'daily_thu_lunch', name: 'Thursday Lunch', nameAr: 'غداء الخميس', type: 'lunch', emoji: '🍝', time: '13:00', dayIndex: 4, description: 'Whole wheat pasta', descriptionAr: 'معكرونة قمح كامل' },
    { id: 'daily_thu_dinner', name: 'Thursday Dinner', nameAr: 'عشاء الخميس', type: 'dinner', emoji: '🥙', time: '19:00', dayIndex: 4, description: 'Chicken shawarma (light)', descriptionAr: 'شاورما دجاج خفيفة' },
    // Friday (5)
    { id: 'daily_fri_breakfast', name: 'Friday Breakfast', nameAr: 'فطور الجمعة', type: 'breakfast', emoji: '🧇', time: '08:00', dayIndex: 5, description: 'Waffles with honey', descriptionAr: 'وافل مع عسل' },
    { id: 'daily_fri_lunch', name: 'Friday Lunch', nameAr: 'غداء الجمعة', type: 'lunch', emoji: '🍖', time: '13:00', dayIndex: 5, description: 'Lamb with rice', descriptionAr: 'لحم ضأن مع أرز' },
    { id: 'daily_fri_dinner', name: 'Friday Dinner', nameAr: 'عشاء الجمعة', type: 'dinner', emoji: '🥗', time: '19:00', dayIndex: 5, description: 'Fresh salad', descriptionAr: 'سلطة طازجة' },
    // Saturday (6)
    { id: 'daily_sat_breakfast', name: 'Saturday Breakfast', nameAr: 'فطور السبت', type: 'breakfast', emoji: '🥐', time: '08:00', dayIndex: 6, description: 'Croissant with eggs', descriptionAr: 'كرواسون مع بيض' },
    { id: 'daily_sat_lunch', name: 'Saturday Lunch', nameAr: 'غداء السبت', type: 'lunch', emoji: '🐟', time: '13:00', dayIndex: 6, description: 'Baked fish with salad', descriptionAr: 'سمك مخبوز مع سلطة' },
    { id: 'daily_sat_dinner', name: 'Saturday Dinner', nameAr: 'عشاء السبت', type: 'dinner', emoji: '🍲', time: '19:00', dayIndex: 6, description: 'Lentil soup', descriptionAr: 'شوربة عدس' },
];

// ============================================================================
// Mock Completions
// ============================================================================

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

export const mockCompletions: MealCompletion[] = [
    { id: 'comp_1', mealId: 'meal_breakfast', date: yesterdayStr, completedAt: Date.now() - 86400000 },
    { id: 'comp_2', mealId: 'meal_lunch', date: yesterdayStr, completedAt: Date.now() - 86400000 + 18000000 },
    { id: 'comp_3', mealId: 'meal_dinner', date: yesterdayStr, completedAt: Date.now() - 86400000 + 36000000 },
    { id: 'comp_4', mealId: 'meal_breakfast', date: todayStr, completedAt: Date.now() - 10800000 },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate meal history from completions
 */
export function generateMealHistory(
    completions: MealCompletion[],
    totalMealsPerDay: number,
    startDate: Date,
    endDate: Date
): MealHistory {
    const history: MealHistory = {};

    // Group completions by date
    const completionsByDate: Record<string, number> = {};
    completions.forEach(comp => {
        completionsByDate[comp.date] = (completionsByDate[comp.date] || 0) + 1;
    });

    // Generate history for date range
    const current = new Date(startDate);
    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        const completed = completionsByDate[dateStr] || 0;
        history[dateStr] = {
            date: dateStr,
            completed,
            total: totalMealsPerDay,
            percentage: Math.round((completed / totalMealsPerDay) * 100),
        };
        current.setDate(current.getDate() + 1);
    }

    return history;
}

/**
 * Get status for a specific date
 */
export function getMealStatusForDate(
    date: string,
    completions: MealCompletion[],
    totalMeals: number
): DayMealStatus {
    const completed = completions.filter(c => c.date === date).length;
    return {
        date,
        completed,
        total: totalMeals,
        percentage: totalMeals > 0 ? Math.round((completed / totalMeals) * 100) : 0,
    };
}

/**
 * Check if a meal is completed for a date
 */
export function isMealCompleted(
    mealId: string,
    date: string,
    completions: MealCompletion[]
): boolean {
    return completions.some(c => c.mealId === mealId && c.date === date);
}

/**
 * Get meals for a specific day (daily format)
 */
export function getMealsForDay(meals: Meal[], dayIndex: number): Meal[] {
    return meals.filter(m => m.dayIndex === dayIndex);
}

/**
 * Get day index from date (0 = Sunday)
 */
export function getDayIndexFromDate(date: Date): number {
    return date.getDay();
}

/**
 * Simulate API delay
 */
export async function simulateApiDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch mock meals data
 */
export async function fetchMockMealsData(format: 'general' | 'daily' = 'general') {
    await simulateApiDelay(300);

    const plan = format === 'general' ? mockMealPlan : mockDailyMealPlan;
    const meals = format === 'general' ? mockGeneralMeals : mockDailyMeals;

    return {
        plan,
        meals,
        completions: mockCompletions,
    };
}
