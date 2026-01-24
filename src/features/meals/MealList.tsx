/**
 * MealList Component
 * @description List of meals for selected day with new MealCard design
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { Meal } from '@/src/shared/types/meals';
import MealCard from './MealCard';
import DailyMealCard from './DailyMealCard';

interface MealListProps {
    meals: Meal[];
    format: 'daily' | 'general';
    selections: Record<string, Record<string, string[]>>; // mealId -> categoryId -> optionIds
    onMealToggle: (mealId: string) => void;
    onMealOptions: (mealId: string) => void;
    onSelectOption: (mealId: string, categoryId: string, optionId: string) => void;
    onOpenSheet: (mealId: string, categoryId: string) => void;
    onChangeMeal: (mealId: string) => void;
    onRequestChange: (mealId: string) => void;
    isLoading?: boolean;
}

/**
 * MealList - Renders list of meals based on format
 */
function MealList({
    meals,
    format,
    selections,
    onMealToggle,
    onMealOptions,
    onSelectOption,
    onOpenSheet,
    onChangeMeal,
    onRequestChange,
    isLoading,
}: MealListProps) {
    const renderMeal = useCallback(({ item, index }: { item: Meal; index: number }) => {
        if (format === 'daily') {
            return (
                <DailyMealCard
                    meal={item}
                    onToggle={() => onMealToggle(item.id)}
                    onOptionsPress={() => onMealOptions(item.id)}
                />
            );
        }

        return (
            <MealCard
                meal={item}
                selections={(selections && selections[item.id]) || {}}
                onSelectOption={(categoryId, optionId) => onSelectOption(item.id, categoryId, optionId)}
                onOpenBottomSheet={(categoryId) => onOpenSheet(item.id, categoryId)}
                onCompleteMeal={() => onMealToggle(item.id)}
                onChangeMeal={() => onChangeMeal(item.id)}
                onRequestChange={() => onRequestChange(item.id)}
            />
        );
    }, [format, selections, onMealToggle, onMealOptions, onSelectOption, onOpenSheet, onChangeMeal, onRequestChange]);

    const keyExtractor = useCallback((item: Meal) => item.id, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.skeletonContainer}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.skeletonCard}>
                            <View style={styles.skeletonIcon} />
                            <View style={styles.skeletonContent}>
                                <View style={styles.skeletonTitle} />
                                <View style={styles.skeletonSubtitle} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    if (meals.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🍽️</Text>
                    <Text style={styles.emptyTitle}>لا توجد وجبات</Text>
                    <Text style={styles.emptySubtitle}>
                        لم يتم إضافة وجبات لهذا اليوم بعد
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeInDown.duration(400).delay(300)}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>وجبات اليوم</Text>
                <Text style={styles.mealCount}>{meals.length} وجبات</Text>
            </View>
            <FlatList
                data={meals}
                renderItem={renderMeal}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                {...({} as any)}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginTop: verticalScale(16),
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    headerTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    mealCount: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
    },
    listContent: {
        gap: verticalScale(12),
    },
    // Skeleton styles
    skeletonContainer: {
        gap: verticalScale(12),
    },
    skeletonCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        height: verticalScale(120),
        ...shadows.light,
    },
    skeletonIcon: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: colors.bgSecondary,
    },
    skeletonContent: {
        flex: 1,
        marginRight: horizontalScale(12),
    },
    skeletonTitle: {
        width: '60%',
        height: verticalScale(16),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.bgSecondary,
        marginBottom: verticalScale(8),
    },
    skeletonSubtitle: {
        width: '40%',
        height: verticalScale(12),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.bgSecondary,
    },
    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: verticalScale(40),
    },
    emptyEmoji: {
        fontSize: ScaleFontSize(48),
        marginBottom: verticalScale(16),
    },
    emptyTitle: {
        fontSize: ScaleFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(8),
    },
    emptySubtitle: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        textAlign: 'center',
    },
});

export default memo(MealList);
