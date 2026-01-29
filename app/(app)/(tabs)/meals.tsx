/**
 * MealsScreen
 * @description Enhanced meals screen with modern UI and animations
 */

import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

// Hooks
import {
    useMealPlan,
    useMealCalendar,
    useMealCompletions,
    useMealSelections,
    useDailyNavigation,
} from '@/src/hooks/meals';

// Components
import {
    MealsHeader,
    DietPlanCard,
    MealCalendar,
    DayNavigator,
    MealList,
    MealOptionsSheet,
    ChangeRequestModal,
    MealsLoadingSkeleton,
    MealsErrorBoundary,
} from '@/src/features/meals';
import AnimatedProgressRing from '@/src/shared/components/shared/AnimatedProgressRing';
import { getOrCreateConversation, sendChatMessage } from '@/src/shared/services/backend/api';

// Redux
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectShowChangeRequestModal,
    selectShowOptionsSheet,
    selectActiveMeal,
    selectSelections,
    setShowChangeRequestModal,
    setActiveMeal,
    selectMealOption,
} from '@/src/shared/store/slices/mealsSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';

/**
 * DailyProgressBadge - Floating progress indicator
 */
const DailyProgressBadge = ({ completed, total }: { completed: number; total: number }) => {
    const progress = total > 0 ? completed / total : 0;

    return (
        <Animated.View
            entering={FadeInUp.delay(400).springify().damping(18)}
            style={styles.progressBadge}
        >
            <AnimatedProgressRing
                progress={progress}
                size={horizontalScale(50)}
                strokeWidth={3}
            >
                <Text style={styles.progressText}>{completed}/{total}</Text>
            </AnimatedProgressRing>
            <Text style={styles.progressLabel}>وجبات اليوم</Text>
        </Animated.View>
    );
};

/**
 * MealsScreen - Main screen showing meal plan and daily meals
 */
export default function MealsScreen() {
    const dispatch = useAppDispatch();
    const [refreshing, setRefreshing] = useState(false);

    // Hooks
    const {
        plan,
        isLoading,
        error,
        refresh: refreshPlan,
        format,
        summary,
    } = useMealPlan();

    const {
        currentMonth,
        currentYear,
        selectedDate,
        mealHistory,
        goToMonth,
        selectDay,
    } = useMealCalendar();

    const {
        mealsWithStatus,
        toggleCompletion,
        progress,
    } = useMealCompletions();

    const {
        selectOption,
    } = useMealSelections();

    const {
        dayOffset,
        goToPrev,
        goToNext,
    } = useDailyNavigation();

    const resolvedTotalMeals = useMemo(() => {
        if (typeof summary?.planTotalMeals === 'number' && summary.planTotalMeals > 0) {
            return summary.planTotalMeals;
        }
        if (typeof summary?.totalMeals === 'number' && summary.totalMeals > 0) {
            return summary.totalMeals;
        }
        return progress.total;
    }, [summary?.planTotalMeals, summary?.totalMeals, progress.total]);

    const resolvedCompletedMeals = useMemo(() => {
        if (typeof summary?.planTotalMeals === 'number' && summary.planTotalMeals > 0) {
            return typeof summary.planMealsCompleted === 'number'
                ? summary.planMealsCompleted
                : progress.completed;
        }
        if (typeof summary?.totalMeals === 'number' && summary.totalMeals > 0) {
            return typeof summary.mealsCompleted === 'number'
                ? summary.mealsCompleted
                : progress.completed;
        }
        return progress.completed;
    }, [
        summary?.planTotalMeals,
        summary?.planMealsCompleted,
        summary?.totalMeals,
        summary?.mealsCompleted,
        progress.completed,
    ]);

    const completionProgress = useMemo(() => {
        if (!resolvedTotalMeals) {
            return 0;
        }
        return resolvedCompletedMeals / resolvedTotalMeals;
    }, [resolvedCompletedMeals, resolvedTotalMeals]);

    // Selectors
    const showChangeRequestModal = useAppSelector(selectShowChangeRequestModal);
    const showOptionsSheet = useAppSelector(selectShowOptionsSheet);
    const activeMeal = useAppSelector(selectActiveMeal);
    const selections = useAppSelector(selectSelections);
    const token = useAppSelector(selectToken);

    // Handlers
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshPlan();
        setRefreshing(false);
    }, [refreshPlan]);

    const handleHelpPress = useCallback(() => {
        Alert.alert('مساعدة', 'هذه هي خطتك الغذائية. اختر الوجبات المناسبة وقم بتسجيل إتمامها.\n\n• اسحب الوجبة لليسار لتسجيل الإتمام\n• اضغط مطولاً لعرض الخيارات');
    }, []);

    const handleReceiptPress = useCallback(() => {
        Alert.alert('سجل الوجبات', 'سيتم إضافة سجل الوجبات قريباً');
    }, []);

    const handleChangeRequestSubmit = useCallback(async (reason: string) => {
        if (!token) {
            Alert.alert('تنبيه', 'يرجى تسجيل الدخول لإرسال الطلب.');
            return;
        }

        const doctorId = summary?.doctor?.id || plan?.doctorId;
        if (!doctorId) {
            Alert.alert('تنبيه', 'لم يتم العثور على الطبيب المرتبط بخطتك الغذائية.');
            return;
        }

        const planName = plan?.nameAr || plan?.name || 'الخطة الغذائية';
        const content = `طلب تغيير الخطة (${planName})\nالسبب: ${reason}`;

        try {
            const conversation = await getOrCreateConversation(doctorId, token);
            const conversationId = conversation?.data?.id;

            if (!conversationId) {
                throw new Error('Missing conversation');
            }

            await sendChatMessage(
                conversationId,
                { content, messageType: 'text' },
                token
            );

            dispatch(setShowChangeRequestModal(false));
            Alert.alert(
                'تم إرسال الطلب',
                'سيتم مراجعة طلبك والرد عليك قريباً',
                [{ text: 'حسناً' }]
            );
        } catch (error) {
            console.error('Change request failed:', error);
            Alert.alert('خطأ', 'تعذر إرسال الطلب. حاول مرة أخرى.');
        }
    }, [dispatch, token, summary?.doctor?.id, plan?.doctorId, plan?.nameAr, plan?.name]);

    const handleMonthChange = useCallback((month: number, year: number) => {
        goToMonth(month, year);
    }, [goToMonth]);

    const handleMealToggle = useCallback((mealId: string) => {
        toggleCompletion(mealId);
    }, [toggleCompletion]);

    const handleMealOptions = useCallback((mealId: string) => {
        dispatch(setActiveMeal(mealId));
    }, [dispatch]);

    const handleCloseOptionsSheet = useCallback(() => {
        dispatch(setActiveMeal(null));
    }, [dispatch]);

    const handleSelectOption = useCallback((mealId: string, categoryId: string, optionId: string) => {
        const meal = mealsWithStatus.find(m => m.id === mealId);
        const category = meal?.categories?.find(c => c.id === categoryId);
        selectOption(mealId, categoryId, optionId, category?.maxSelect);
    }, [mealsWithStatus, selectOption]);

    const handleConfirmOptions = useCallback(() => {
        dispatch(setActiveMeal(null));
    }, [dispatch]);

    const handleDayNavigate = useCallback((direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            goToPrev();
        } else {
            goToNext();
        }
    }, [goToPrev, goToNext]);

    const handleOpenSheet = useCallback((mealId: string, categoryId: string) => {
        dispatch(setActiveMeal(mealId));
        // Could also store activeCategoryId if needed
    }, [dispatch]);

    const handleChangeMeal = useCallback((mealId: string) => {
        // Reset completion status to allow changes
        toggleCompletion(mealId);
    }, [toggleCompletion]);

    const handleRequestChange = useCallback((mealId: string) => {
        Alert.alert(
            'خيارات الوجبة',
            'ماذا تريد أن تفعل؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'طلب تغيير', onPress: () => dispatch(setShowChangeRequestModal(true)) },
            ]
        );
    }, [dispatch]);

    // Show loading skeleton
    if (isLoading && !plan) {
        return (
            <GestureHandlerRootView style={styles.flex}>
                <View style={styles.container}>
                    <MealsLoadingSkeleton format={format} />
                </View>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.flex}>
            <View style={styles.container}>
                <Animated.ScrollView
                    entering={FadeIn.duration(300)}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primaryDark}
                            colors={[colors.primaryDark]}
                        />
                    }
                >
                    {/* Header */}
                    <MealsHeader
                        title="الوجبات"
                        onHelpPress={handleHelpPress}
                        onReceiptPress={handleReceiptPress}
                    />

                    {/* Diet Plan Card */}
                    <MealsErrorBoundary
                        sectionName="الخطة الغذائية"
                        onRetry={handleRefresh}
                    >
                        <DietPlanCard
                            plan={plan!}
                            isLoading={isLoading}
                            mealCount={resolvedTotalMeals}
                            completionProgress={completionProgress}
                        />
                    </MealsErrorBoundary>

                    {/* Calendar (for general format) or Day Navigator (for daily format) */}
                    <MealsErrorBoundary
                        sectionName="التاريخ"
                        onRetry={handleRefresh}
                    >
                        {format === 'general' ? (
                            <MealCalendar
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                selectedDate={selectedDate}
                                mealHistory={mealHistory}
                                onMonthChange={handleMonthChange}
                                onDaySelect={selectDay}
                            />
                        ) : (
                            <DayNavigator
                                currentDate={selectedDate}
                                dayOffset={dayOffset}
                                onNavigate={handleDayNavigate}
                            />
                        )}
                    </MealsErrorBoundary>

                    {/* Daily Progress Badge */}
                    <DailyProgressBadge
                        completed={progress.completed}
                        total={progress.total}
                    />

                    {/* Meals List */}
                    <MealsErrorBoundary
                        sectionName="الوجبات"
                        onRetry={handleRefresh}
                    >
                        <MealList
                            meals={mealsWithStatus}
                            format={format}
                            selections={selections}
                            onMealToggle={handleMealToggle}
                            onMealOptions={handleMealOptions}
                            onSelectOption={handleSelectOption}
                            onOpenSheet={handleOpenSheet}
                            onChangeMeal={handleChangeMeal}
                            onRequestChange={handleRequestChange}
                            isLoading={isLoading}
                        />
                    </MealsErrorBoundary>
                </Animated.ScrollView>

                {/* Options Sheet */}
                <MealOptionsSheet
                    visible={showOptionsSheet}
                    meal={activeMeal}
                    selections={activeMeal ? (selections[activeMeal.id] || {}) : {}}
                    onClose={handleCloseOptionsSheet}
                    onSelectOption={handleSelectOption}
                    onConfirm={handleConfirmOptions}
                />

                {/* Change Request Modal */}
                <ChangeRequestModal
                    visible={showChangeRequestModal}
                    planName={plan?.nameAr || plan?.name || ''}
                    onClose={() => dispatch(setShowChangeRequestModal(false))}
                    onSubmit={handleChangeRequestSubmit}
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: verticalScale(100),
    },
    // Progress Badge
    progressBadge: {
        alignItems: 'center',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(8),
    },
    progressText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '700',
        color: colors.primaryDark,
    },
    progressLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginTop: verticalScale(6),
        fontWeight: '500',
    },
});
