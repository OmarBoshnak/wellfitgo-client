/**
 * useMealPlan Hook
 * @description Manages active meal plan data fetched from backend
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectMealPlan,
    selectMealsLoading,
    selectMealsError,
    selectSelectedDate,
    selectDayOffset,
    setMealsData,
    setMealsLoading,
    setMealsError,
} from '@/src/shared/store/slices/mealsSlice';
import { MealPlan, Meal, MealPlanFormat } from '@/src/shared/types/meals';
import {
    getActiveMealPlan,
    getMealPlanSummary,
    ActiveMealPlanApiPlan,
    ActiveMealPlanApiMeal,
} from '@/src/shared/services/backend/api';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import socketService from '@/src/shared/services/socket/socketService';

/**
 * Map backend plan response to client MealPlan type
 */
const mapApiPlanToMealPlan = (apiPlan: ActiveMealPlanApiPlan): MealPlan => ({
    id: apiPlan.id,
    name: apiPlan.name,
    nameAr: apiPlan.nameAr || apiPlan.name,
    format: apiPlan.format,
    startDate: apiPlan.startDate || new Date().toISOString().split('T')[0],
    endDate: apiPlan.endDate,
    emoji: apiPlan.emoji,
    tags: apiPlan.tags,
    description: apiPlan.description,
    descriptionAr: apiPlan.descriptionAr,
    doctorId: apiPlan.doctorId,
    doctorName: apiPlan.doctorName,
    doctorNameAr: apiPlan.doctorNameAr,
});

/**
 * Map backend meal response to client Meal type
 */
const mapApiMealToMeal = (apiMeal: ActiveMealPlanApiMeal): Meal => ({
    id: apiMeal.id,
    name: apiMeal.name,
    nameAr: apiMeal.nameAr,
    type: (apiMeal.type as Meal['type']) || 'other',
    emoji: apiMeal.emoji,
    time: apiMeal.time,
    description: apiMeal.note,
    descriptionAr: apiMeal.noteAr,
    dayIndex: apiMeal.dayIndex,
    categories: (apiMeal.categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        nameAr: cat.nameAr,
        emoji: cat.emoji,
        minSelect: cat.minSelect,
        maxSelect: cat.maxSelect,
        options: (cat.options || []).map(opt => ({
            id: opt.id,
            text: opt.text,
            textAr: opt.textAr,
            calories: opt.calories,
            serving: opt.serving,
            servingAr: opt.servingAr,
        })),
    })),
});

/**
 * Hook for managing active meal plan
 */
export function useMealPlan() {
    const dispatch = useAppDispatch();

    // Selectors
    const plan = useAppSelector(selectMealPlan);
    const isLoading = useAppSelector(selectMealsLoading);
    const error = useAppSelector(selectMealsError);
    const token = useAppSelector(selectToken);
    const selectedDate = useAppSelector(selectSelectedDate);
    const dayOffset = useAppSelector(selectDayOffset);

    const [noPlanAssigned, setNoPlanAssigned] = useState(false);

    const [summary, setSummary] = useState<
        | {
            doctor?: {
                id?: string;
                name?: string;
                nameAr?: string;
                avatarUrl?: string;
            } | null;
            mealsCompleted?: number;
            totalMeals?: number;
            planMealsCompleted?: number;
            planTotalMeals?: number;
        }
        | null
    >(null);

    const resolveSummaryDate = useCallback((format: MealPlanFormat) => {
        const baseDate = new Date(selectedDate);
        if (format === 'daily') {
            baseDate.setDate(baseDate.getDate() + dayOffset);
        }
        return toISODateString(baseDate);
    }, [selectedDate, dayOffset]);

    // Fetch meal plan data from backend
    const fetchPlan = useCallback(async (_format?: MealPlanFormat) => {
        dispatch(setMealsLoading(true));
        try {
            if (!token) {
                dispatch(setMealsError('يرجى تسجيل الدخول'));
                setNoPlanAssigned(true);
                return;
            }

            // Fetch the active diet plan from backend
            const planResponse = await getActiveMealPlan(token);

            if (!planResponse?.data) {
                // No plan assigned — show empty state
                setNoPlanAssigned(true);
                dispatch(setMealsData({
                    plan: {
                        id: '',
                        name: '',
                        nameAr: '',
                        format: 'general',
                        startDate: new Date().toISOString().split('T')[0],
                    },
                    meals: [],
                }));
                return;
            }

            setNoPlanAssigned(false);

            const mappedPlan = mapApiPlanToMealPlan(planResponse.data.plan);
            const mappedMeals = (planResponse.data.meals || []).map(mapApiMealToMeal);
            const resolvedFormat = mappedPlan.format || 'general';

            // Fetch summary data
            let summaryData: typeof summary = null;
            try {
                const summaryResponse = await getMealPlanSummary(token, resolveSummaryDate(resolvedFormat));
                summaryData = summaryResponse?.data ?? null;
            } catch {
                summaryData = null;
            }

            setSummary(summaryData);

            // Merge doctor info from summary if available
            const finalPlan = summaryData?.doctor
                ? {
                    ...mappedPlan,
                    doctorId: summaryData.doctor.id || mappedPlan.doctorId,
                    doctorName: summaryData.doctor.name || mappedPlan.doctorName,
                    doctorNameAr: summaryData.doctor.nameAr || mappedPlan.doctorNameAr,
                }
                : mappedPlan;

            dispatch(setMealsData({
                plan: finalPlan,
                meals: mappedMeals,
            }));
        } catch (err) {
            dispatch(setMealsError('حدث خطأ أثناء تحميل الخطة الغذائية'));
        }
    }, [dispatch, token, resolveSummaryDate]);

    // Refresh handler
    const refresh = useCallback(async () => {
        await fetchPlan(plan?.format);
    }, [fetchPlan, plan]);

    // Initial fetch
    const hasFetched = useRef(false);
    useEffect(() => {
        if (!hasFetched.current && token) {
            hasFetched.current = true;
            fetchPlan();
        }
    }, [token, fetchPlan]);

    // Socket listener for real-time diet plan assignment
    useEffect(() => {
        if (!socketService.isConnected()) return;

        const handlePlanAssigned = (data: { dietPlanName?: string }) => {
            Alert.alert(
                'خطة غذائية جديدة',
                data?.dietPlanName
                    ? `تم تعيين خطة "${data.dietPlanName}" لك`
                    : 'تم تعيين خطة غذائية جديدة لك',
                [{ text: 'عرض', onPress: () => { hasFetched.current = false; fetchPlan(); } }]
            );
        };

        socketService.on('diet:plan:assigned' as any, handlePlanAssigned as any);
        return () => {
            socketService.off('diet:plan:assigned' as any, handlePlanAssigned as any);
        };
    }, [fetchPlan]);

    return {
        plan,
        isLoading,
        error,
        fetchPlan,
        refresh,
        summary,
        noPlanAssigned,
        // Computed
        format: plan?.format || 'general',
        isDaily: plan?.format === 'daily',
        isGeneral: plan?.format === 'general',
        planName: plan?.nameAr || plan?.name || '',
        planEmoji: plan?.emoji || '🍽️',
    };
}

export default useMealPlan;
