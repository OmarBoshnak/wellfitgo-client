import { MealIngredient, MealItem } from '@/src/shared/types/home';

export interface MacroTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const normalizeNumber = (value?: number): number => (typeof value === 'number' ? value : 0);

const calculateIngredientMacros = (ingredient: MealIngredient): MacroTotals => {
    const ratio = typeof ingredient.grams === 'number'
        ? ingredient.grams / 100
        : null;

    const caloriesFromPer100g = ratio !== null && ingredient.macrosPer100g?.calories !== undefined
        ? ingredient.macrosPer100g.calories * ratio
        : undefined;
    const proteinFromPer100g = ratio !== null && ingredient.macrosPer100g?.protein !== undefined
        ? ingredient.macrosPer100g.protein * ratio
        : undefined;
    const carbsFromPer100g = ratio !== null && ingredient.macrosPer100g?.carbs !== undefined
        ? ingredient.macrosPer100g.carbs * ratio
        : undefined;
    const fatFromPer100g = ratio !== null && ingredient.macrosPer100g?.fat !== undefined
        ? ingredient.macrosPer100g.fat * ratio
        : undefined;

    return {
        calories: normalizeNumber(caloriesFromPer100g ?? ingredient.calories),
        protein: normalizeNumber(proteinFromPer100g ?? ingredient.protein),
        carbs: normalizeNumber(carbsFromPer100g ?? ingredient.carbs),
        fat: normalizeNumber(fatFromPer100g ?? ingredient.fat),
    };
};

export const calculateMealMacros = (meal: MealItem): MacroTotals => {
    const fallback = {
        calories: normalizeNumber(meal.calories),
        protein: normalizeNumber(meal.protein),
        carbs: normalizeNumber(meal.carbs),
        fat: normalizeNumber(meal.fat),
    };

    if (!meal.items || meal.items.length === 0) {
        return fallback;
    }

    const totals = meal.items.reduce<MacroTotals>((acc, item) => {
        const itemTotals = calculateIngredientMacros(item);
        acc.calories += itemTotals.calories;
        acc.protein += itemTotals.protein;
        acc.carbs += itemTotals.carbs;
        acc.fat += itemTotals.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const hasTotals = totals.calories || totals.protein || totals.carbs || totals.fat;
    return hasTotals ? totals : fallback;
};

export const calculateMealsTotals = (meals: MealItem[]): MacroTotals => (
    meals.reduce<MacroTotals>((acc, meal) => {
        const totals = calculateMealMacros(meal);
        acc.calories += totals.calories;
        acc.protein += totals.protein;
        acc.carbs += totals.carbs;
        acc.fat += totals.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
);
