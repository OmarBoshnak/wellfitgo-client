/**
 * useHomeData Hook
 * @description Aggregates all home data with loading/error states
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectWeightData,
    selectMeals,
    selectWaterIntake,
    selectPlanProgress,
    selectHomeLoading,
    selectHomeError,
    selectInProgressMeals,
    setWeightData,
    setMeals,
    setWaterIntake,
    setPlanProgress,
    setLoading,
    setError,
    toggleMealCompletion,
    setMealInProgress,
    addWater,
    removeWater,
} from '@/src/shared/store/slices/homeSlice';
import { selectWeightGoalType } from '@/src/shared/store/slices/profileSlice';
import { refreshAuthUser } from '@/src/shared/store/slices/authSlice';
import {
    selectUser as selectAuthUser,
    selectToken,
} from '@/src/shared/store/selectors/auth.selectors';
import { getGreeting } from '@/src/shared/utils/homeData';
import {
    getAssignedMeals,
    getClientProfile,
    getIdealWeight,
    upsertMealCompletion,
    updateWaterIntake,
    getActiveMealPlan,
    getMealCompletions,
    getDailyProgress,
    AssignedMealApiItem,
    ClientProfileResponse,
    IdealWeightResponse,
    ActiveMealPlanResponse,
    MealCompletionsResponse,
    DailyProgressResponse,
} from '@/src/shared/services/backend/api';
import {
    WeightProgress,
    DailyNutrition,
    WeightData,
    DailyProgress,
    DEFAULT_PLAN_PROGRESS,
    DEFAULT_WATER_INTAKE,
} from '@/src/shared/types/home';
import { calculateMealsTotals } from '@/src/shared/utils/mealMacros';
import { calculateTargetWeight } from '@/src/shared/utils/profileData';
import { toISODateString } from '@/src/shared/utils/dateTime/mealCalendarHelpers';

/**
 * Main hook for HomeScreen data management
 */
export function useHomeData() {
    const dispatch = useAppDispatch();

    // Selectors
    const user = useAppSelector(selectAuthUser);
    const token = useAppSelector(selectToken);
    const weightData = useAppSelector(selectWeightData);
    const meals = useAppSelector(selectMeals);
    const waterIntake = useAppSelector(selectWaterIntake);
    const planProgress = useAppSelector(selectPlanProgress);
    const isLoading = useAppSelector(selectHomeLoading);
    const error = useAppSelector(selectHomeError);
    const inProgressMeals = useAppSelector(selectInProgressMeals);
    const goalType = useAppSelector(selectWeightGoalType);

    // State for user profile data
    const [userProfile, setUserProfile] = useState<ClientProfileResponse | null>(null);

    // State for diet plan data
    const [dietPlan, setDietPlan] = useState<ActiveMealPlanResponse['data'] | null>(null);
    const [mealCompletions, setMealCompletions] = useState<MealCompletionsResponse['data'] | null>(null);

    // State for daily progress (meals + water completion)
    const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);

    // Computed greeting
    const greeting = useMemo(() => getGreeting(), []);

    // Weight progress computation - uses goal type for dynamic target calculation
    const weightProgress = useMemo((): WeightProgress | null => {
        if (!weightData) return null;

        const { currentWeight, targetWeight: storedTargetWeight, startWeight, history } = weightData;
        const normalizedProfile = (userProfile as any)?.data && typeof (userProfile as any).data === 'object'
            ? (userProfile as any).data
            : userProfile;
        const height = normalizedProfile?.height;
        const age = normalizedProfile?.age;
        const gender = normalizedProfile?.gender === 'female' ? 'female' : 'male';

        let targetWeight = storedTargetWeight;
        if (goalType && typeof height === 'number' && typeof age === 'number') {
            targetWeight = calculateTargetWeight(currentWeight, height, age, gender, goalType);
        }

        let totalLost = 0;
        let remainingToGoal = 0;
        let progressPercentage = 0;

        if (goalType === 'gain') {
            const totalToGain = targetWeight - startWeight;
            const totalGained = currentWeight - startWeight;
            remainingToGoal = Math.max(targetWeight - currentWeight, 0);
            progressPercentage = totalToGain > 0
                ? Math.min(Math.round((totalGained / totalToGain) * 100), 100)
                : 0;
            totalLost = Math.max(totalGained, 0);
        } else if (goalType === 'maintain') {
            totalLost = 0;
            remainingToGoal = 0;
            progressPercentage = 100;
        } else {
            const totalToLose = startWeight - targetWeight;
            const actuallyLost = startWeight - currentWeight;
            remainingToGoal = Math.max(currentWeight - targetWeight, 0);
            progressPercentage = totalToLose > 0
                ? Math.min(Math.round((actuallyLost / totalToLose) * 100), 100)
                : 0;
            totalLost = Math.max(actuallyLost, 0);
        }

        // Calculate trend from last 3 entries
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (history.length >= 2) {
            const last = history[history.length - 1].weight;
            const prev = history[history.length - 2].weight;
            if (last < prev - 0.1) trend = 'down';
            else if (last > prev + 0.1) trend = 'up';
        }

        return {
            currentWeight,
            targetWeight,
            startWeight,
            progressPercentage,
            totalLost,
            remainingToGoal,
            weeklyData: history.slice(-7),
            trend,
        };
    }, [weightData, userProfile, goalType]);

    // Nutrition computation
    const nutrition = useMemo((): DailyNutrition => {
        const completed = meals.filter(m => m.isCompleted);
        const totals = calculateMealsTotals(completed);
        return {
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fat: totals.fat,
            targetCalories: 1400,
            targetProtein: 100,
            targetCarbs: 112,
            targetFat: 53,
        };
    }, [meals]);

    const buildWeightData = useCallback((
        profile?: ClientProfileResponse | null,
        idealWeight?: IdealWeightResponse | null,
        goal?: 'lose' | 'gain' | 'maintain'
    ): WeightData | null => {
        if (!profile) return null;

        const normalizedProfile = (profile as any)?.data && typeof (profile as any).data === 'object'
            ? (profile as any).data
            : profile;

        const history = Array.isArray(normalizedProfile.weightHistory)
            ? normalizedProfile.weightHistory
            : [];
        const currentWeight = typeof normalizedProfile.currentWeight === 'number'
            ? normalizedProfile.currentWeight
            : history[history.length - 1]?.weight;
        const startWeight = typeof normalizedProfile.startingWeight === 'number'
            ? normalizedProfile.startingWeight
            : history[0]?.weight ?? currentWeight;

        // Calculate dynamic target based on goal type if provided
        let targetWeight = typeof normalizedProfile.targetWeight === 'number'
            ? normalizedProfile.targetWeight
            : startWeight ?? currentWeight;

        if (goal && currentWeight && normalizedProfile.height && normalizedProfile.age) {
            targetWeight = calculateTargetWeight(
                currentWeight,
                normalizedProfile.height,
                normalizedProfile.age,
                normalizedProfile.gender === 'female' ? 'female' : 'male',
                goal
            );
        }

        if (currentWeight === undefined || currentWeight === null
            || startWeight === undefined || startWeight === null
            || targetWeight === undefined || targetWeight === null) {
            return null;
        }

        return {
            currentWeight,
            targetWeight,
            startWeight,
            unit: 'kg',
            history,
        };
    }, []);

    const buildWaterIntake = useCallback((profile?: ClientProfileResponse | null) => {
        const normalizedProfile = (profile as any)?.data && typeof (profile as any).data === 'object'
            ? (profile as any).data
            : profile;
        const waterIntakeData = normalizedProfile?.waterIntake;

        return {
            ...DEFAULT_WATER_INTAKE,
            ...(waterIntakeData && typeof waterIntakeData === 'object' ? waterIntakeData : {}),
        };
    }, []);

    const buildPlanProgress = useCallback((profile?: ClientProfileResponse | null) => {
        const normalizedProfile = (profile as any)?.data && typeof (profile as any).data === 'object'
            ? (profile as any).data
            : profile;
        const planProgressData = normalizedProfile?.planProgress;

        return {
            ...DEFAULT_PLAN_PROGRESS,
            ...(planProgressData && typeof planProgressData === 'object' ? planProgressData : {}),
        };
    }, []);

    const mapAssignedMeals = useCallback((
        assignedMeals?: AssignedMealApiItem[],
        dietPlanData?: ActiveMealPlanResponse['data'],
        completionsData?: MealCompletionsResponse['data']
    ) => {
        // If we have diet plan meals, use them as the primary source
        if (dietPlanData?.meals && dietPlanData.meals.length > 0) {
            const completionDate = completionsData?.todayDate || toISODateString(new Date());
            const completionsList = Array.isArray(completionsData?.completions)
                ? completionsData?.completions
                : [];

            return dietPlanData.meals.map((meal) => {
                // Check if this meal is completed from completions data
                const hasCompletion = completionsList.some(
                    (item) => item?.mealId === meal.id && (!completionDate || item?.date === completionDate)
                );
                const hasSelections = Boolean(completionsData?.selections && completionsData.selections[meal.id]);
                const isCompleted = hasCompletion || hasSelections;

                return {
                    id: meal.id,
                    name: meal.nameAr || meal.name,
                    nameAr: meal.nameAr || meal.name,
                    type: (meal.type as any) || 'other',
                    calories: 0, // Will be calculated if needed
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    time: meal.time || '12:00',
                    isCompleted,
                    items: [],
                    emoji: meal.emoji || '🍽️',
                };
            });
        }

        // Fallback to assigned meals
        return Array.isArray(assignedMeals)
            ? assignedMeals.map((meal) => ({
                id: meal.id,
                name: meal.name,
                nameAr: meal.nameAr || meal.name,
                type: meal.type,
                calories: meal.calories,
                protein: meal.protein ?? 0,
                carbs: meal.carbs ?? 0,
                fat: meal.fat ?? 0,
                time: meal.time,
                isCompleted: meal.isCompleted,
                items: meal.items ?? [],
                emoji: '🍽️',
            }))
            : [];
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            console.log('[useHomeData] Token check:', token ? 'Token exists' : 'No token');
            console.log('[useHomeData] Token value:', token ? `${token.substring(0, 20)}...` : 'null');

            if (!token) {
                console.log('[useHomeData] No token available, skipping API calls');
                dispatch(setWeightData(null));
                dispatch(setLoading(false));
                return;
            }

            console.log('[useHomeData] Making API calls...');
            const [profile, idealWeight, assignedMeals, activeMealPlan, mealCompletionsData, dailyProgressData] = await Promise.all([
                getClientProfile(token),
                getIdealWeight(token),
                getAssignedMeals(token),
                getActiveMealPlan(token),
                getMealCompletions(token),
                getDailyProgress(token),
            ]);

            console.log('[useHomeData] API responses received:', {
                profile,
                idealWeight,
                dietPlan: activeMealPlan,
                completions: mealCompletionsData,
                dailyProgress: dailyProgressData
            });

            // Store user profile data
            setUserProfile(profile);

            // Store diet plan and completions data
            setDietPlan(activeMealPlan?.data || null);
            setMealCompletions(mealCompletionsData?.data || null);

            // Store daily progress data
            setDailyProgress(dailyProgressData?.data || null);

            const mappedWeightData = buildWeightData(profile, idealWeight, goalType);
            dispatch(setWeightData(mappedWeightData));

            // Map meals with diet plan and completion data
            const mappedMeals = mapAssignedMeals(
                assignedMeals?.data,
                activeMealPlan?.data,
                mealCompletionsData?.data
            );
            dispatch(setMeals(mappedMeals));

            dispatch(setWaterIntake(buildWaterIntake(profile)));
            dispatch(setPlanProgress(buildPlanProgress(profile)));
            dispatch(setLoading(false));
        } catch (err) {
            console.error('[useHomeData] Error fetching data:', err);
            dispatch(setError('حدث خطأ أثناء تحميل البيانات'));
        }
    }, [dispatch, token, buildWeightData, buildWaterIntake, buildPlanProgress, mapAssignedMeals, goalType]);

    // Refresh handler
    const refresh = useCallback(async () => {
        await Promise.all([
            fetchData(),
            dispatch(refreshAuthUser())
        ]);
    }, [fetchData, dispatch]);

    // Toggle meal handler
    const isMealInProgress = useCallback((mealId: string) => (
        Boolean(inProgressMeals[mealId])
    ), [inProgressMeals]);

    const handleMealToggle = useCallback(async (mealId: string) => {
        if (inProgressMeals[mealId]) {
            return;
        }

        const meal = meals.find(item => item.id === mealId);
        if (!meal) return;

        const nextCompleted = !meal.isCompleted;
        const date = toISODateString(new Date());

        dispatch(setMealInProgress({ mealId, inProgress: true }));
        dispatch(toggleMealCompletion(mealId));

        // Optimistically update dailyProgress for real-time feedback
        setDailyProgress(prev => {
            if (!prev) return prev;
            const completedMeals = nextCompleted
                ? prev.completedMeals + 1
                : Math.max(0, prev.completedMeals - 1);
            const mealCompletionPercentage = prev.totalMeals > 0
                ? Math.round((completedMeals / prev.totalMeals) * 100)
                : 0;
            const overallProgress = Math.round((mealCompletionPercentage + (prev.waterIntake?.percentage || 0)) / 2);
            return {
                ...prev,
                completedMeals,
                mealCompletionPercentage,
                overallProgress,
            };
        });

        if (!token) {
            dispatch(setMealInProgress({ mealId, inProgress: false }));
            return;
        }

        try {
            const response = await upsertMealCompletion({
                mealId,
                date,
                mealType: meal.type,
                completed: nextCompleted,
                completedAt: nextCompleted ? Date.now() : undefined,
            }, token);

            if (!response?.success) {
                throw new Error(response?.message || 'Failed to save meal completion');
            }
        } catch (err) {
            console.error('[useHomeData] Error saving meal completion:', err);
            dispatch(toggleMealCompletion(mealId));
            // Revert dailyProgress on error
            setDailyProgress(prev => {
                if (!prev) return prev;
                const completedMeals = nextCompleted
                    ? Math.max(0, prev.completedMeals - 1)
                    : prev.completedMeals + 1;
                const mealCompletionPercentage = prev.totalMeals > 0
                    ? Math.round((completedMeals / prev.totalMeals) * 100)
                    : 0;
                const overallProgress = Math.round((mealCompletionPercentage + (prev.waterIntake?.percentage || 0)) / 2);
                return {
                    ...prev,
                    completedMeals,
                    mealCompletionPercentage,
                    overallProgress,
                };
            });
            Alert.alert('تعذر حفظ الوجبة', 'يرجى المحاولة مرة أخرى');
        } finally {
            dispatch(setMealInProgress({ mealId, inProgress: false }));
        }
    }, [dispatch, inProgressMeals, meals, token]);

    // Water handlers
    const persistWaterDelta = useCallback(async (delta: number) => {
        // Optimistically update dailyProgress for real-time feedback
        setDailyProgress(prev => {
            if (!prev) return prev;
            const newCurrent = Math.max(0, (prev.waterIntake?.current || 0) + delta);
            const target = prev.waterIntake?.target || 2000;
            const percentage = Math.min(100, Math.round((newCurrent / target) * 100));
            const overallProgress = Math.round((prev.mealCompletionPercentage + percentage) / 2);
            return {
                ...prev,
                waterIntake: {
                    current: newCurrent,
                    target,
                    percentage,
                },
                overallProgress,
            };
        });

        if (!token) {
            if (delta > 0) {
                dispatch(addWater());
            } else {
                dispatch(removeWater());
            }
            return;
        }

        try {
            const response = await updateWaterIntake({ delta }, token);
            if (response?.waterIntake) {
                dispatch(setWaterIntake({
                    ...DEFAULT_WATER_INTAKE,
                    ...response.waterIntake,
                }));
                // Sync dailyProgress with server response
                setDailyProgress(prev => {
                    if (!prev) return prev;
                    const current = response.waterIntake?.current || 0;
                    const target = response.waterIntake?.target || prev.waterIntake?.target || 2000;
                    const percentage = Math.min(100, Math.round((current / target) * 100));
                    const overallProgress = Math.round((prev.mealCompletionPercentage + percentage) / 2);
                    return {
                        ...prev,
                        waterIntake: {
                            current,
                            target,
                            percentage,
                        },
                        overallProgress,
                    };
                });
                return;
            }
        } catch (err) {
            console.error('[useHomeData] Error updating water intake:', err);
            // Revert optimistic update on error
            setDailyProgress(prev => {
                if (!prev) return prev;
                const newCurrent = Math.max(0, (prev.waterIntake?.current || 0) - delta);
                const target = prev.waterIntake?.target || 2000;
                const percentage = Math.min(100, Math.round((newCurrent / target) * 100));
                const overallProgress = Math.round((prev.mealCompletionPercentage + percentage) / 2);
                return {
                    ...prev,
                    waterIntake: {
                        current: newCurrent,
                        target,
                        percentage,
                    },
                    overallProgress,
                };
            });
        }

        if (delta > 0) {
            dispatch(addWater());
        } else {
            dispatch(removeWater());
        }
    }, [dispatch, token]);

    const handleAddWater = useCallback(() => {
        persistWaterDelta(waterIntake.glassSize || DEFAULT_WATER_INTAKE.glassSize);
    }, [persistWaterDelta, waterIntake.glassSize]);

    const handleRemoveWater = useCallback(() => {
        persistWaterDelta(-(waterIntake.glassSize || DEFAULT_WATER_INTAKE.glassSize));
    }, [persistWaterDelta, waterIntake.glassSize]);

    // Initial fetch
    useEffect(() => {
        if (user && token) {
            fetchData();
        }
    }, [user, token, fetchData]);

    return {
        // Data
        user: userProfile,
        weightProgress,
        meals,
        nutrition,
        waterIntake,
        planProgress,
        dailyProgress,
        greeting,
        // State
        isLoading,
        error,
        // Actions
        refresh,
        handleMealToggle,
        isMealInProgress,
        handleAddWater,
        handleRemoveWater,
    };
}

export default useHomeData;
