/**
 * MealsCard Component
 * @description Today's meals list with completion tracking
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    Layout,
} from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { MealItem, DailyNutrition } from '@/src/shared/types/home';
import { getMealTypeNameAr } from '@/src/shared/utils/homeData';

interface MealsCardProps {
    /** Today's meals */
    meals: MealItem[];
    /** Nutrition summary */
    nutrition: DailyNutrition;
    /** Meal toggle handler */
    onMealToggle: (mealId: string) => void;
    /** View all handler */
    onViewAll: () => void;
    /** Loading state */
    isLoading?: boolean;
}

/**
 * Single meal item component
 */
const MealItemRow = memo(function MealItemRow({
    meal,
    onToggle,
}: {
    meal: MealItem;
    onToggle: (id: string) => void;
}) {
    const scale = useSharedValue(1);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle(meal.id);
    }, [meal.id, onToggle]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'م' : 'ص';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={() => { scale.value = withSpring(0.98); }}
            onPressOut={() => { scale.value = withSpring(1); }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: meal.isCompleted }}
            accessibilityLabel={`${meal.nameAr}، ${meal.calories} سعرة، ${meal.isCompleted ? 'مكتمل' : 'غير مكتمل'}`}
        >
            <Animated.View
                layout={Layout.springify()}
                style={[
                    styles.mealItem,
                    meal.isCompleted && styles.mealItemCompleted,
                    animatedStyle,
                ]}
            >
                {/* Checkbox */}
                <View style={[
                    styles.checkbox,
                    meal.isCompleted && styles.checkboxChecked,
                ]}>
                    {meal.isCompleted && (
                        <Ionicons
                            name="checkmark"
                            size={horizontalScale(14)}
                            color={colors.white}
                        />
                    )}
                </View>

                {/* Meal Info */}
                <View style={styles.mealInfo}>
                    <Text style={[
                        styles.mealName,
                        meal.isCompleted && styles.mealNameCompleted,
                    ]}>
                        {meal.nameAr}
                    </Text>
                    <Text style={styles.mealType}>
                        {getMealTypeNameAr(meal.type)} • {formatTime(meal.time)}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
});

/**
 * MealsCard - Today's meal plan card
 */
function MealsCard({
    meals,
    nutrition,
    onMealToggle,
    onViewAll,
    isLoading = false,
}: MealsCardProps) {
    const caloriesProgress = Math.min(
        (nutrition.calories / nutrition.targetCalories) * 100,
        100
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <View style={styles.loadingPlaceholder} />
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.container}
        >
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>وجبات اليوم</Text>
                        <Text style={styles.subtitle}>
                            {meals.filter(m => m.isCompleted).length}/{meals.length} وجبة
                        </Text>
                    </View>
                    <Pressable
                        onPress={onViewAll}
                        accessibilityRole="button"
                        accessibilityLabel="عرض كل الوجبات"
                        style={styles.viewAllButton}
                    >
                        <Text style={styles.viewAllText}>عرض الكل</Text>
                        <Ionicons
                            name="chevron-back"
                            size={horizontalScale(16)}
                            color={colors.primaryDark}
                        />
                    </Pressable>
                </View>

                {/* Calories Progress */}
                <View style={styles.caloriesProgress}>
                    <View style={styles.caloriesHeader}>
                        <Text style={styles.caloriesCount}>
                            {nutrition.targetCalories} / {nutrition.calories}
                        </Text>                        
                        <Text style={styles.caloriesLabel}>السعرات الحرارية</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: `${caloriesProgress}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Meals List */}
                <View style={styles.mealsList}>
                    {meals.map((meal) => (
                        <MealItemRow
                            key={meal.id}
                            meal={meal}
                            onToggle={onMealToggle}
                        />
                    ))}
                </View>

                {/* Macros Summary */}
                <View style={styles.macrosContainer}>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{nutrition.protein}g</Text>
                        <Text style={styles.macroLabel}>بروتين</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{nutrition.carbs}g</Text>
                        <Text style={styles.macroLabel}>كربوهيدرات</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{nutrition.fat}g</Text>
                        <Text style={styles.macroLabel}>دهون</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    loadingContainer: {
        height: verticalScale(300),
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(20),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        ...shadows.light,
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    headerLeft: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    subtitle: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        marginTop: verticalScale(2),
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(2),
    },
    viewAllText: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    caloriesProgress: {
        marginBottom: verticalScale(16),
    },
    caloriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    caloriesLabel: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
    caloriesCount: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    progressBar: {
        height: verticalScale(8),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(4),
        overflow: 'hidden',
        transform:[{scaleX:-1}]
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primaryDark,
        borderRadius: horizontalScale(4),
    },
    mealsList: {
        gap: verticalScale(8),
        marginBottom: verticalScale(16),
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(12),
    },
    mealItemCompleted: {
        backgroundColor: 'rgba(39, 174, 97, 0.1)',
    },
    checkbox: {
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: horizontalScale(12),
    },
    checkboxChecked: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    mealInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    mealName: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    mealNameCompleted: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    mealType: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    caloriesContainer: {
        alignItems: 'center',
    },
    caloriesValue: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.primaryDark,
    },
    caloriesUnit: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        paddingVertical: verticalScale(12),
    },
    macroItem: {
        alignItems: 'center',
    },
    macroValue: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    macroLabel: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    macroDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
});

export default memo(MealsCard);
