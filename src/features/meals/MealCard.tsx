/**
 * MealCard Component
 * @description Comprehensive meal card with categories, options, and completion states
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { Meal, MealCategory, MealOption } from '@/src/shared/types/meals';
import { hapticLight, hapticSuccess } from '@/src/shared/utils/animations/presets';

// RTL constant - in production this would come from i18n
const isRTL = true;

interface MealCardProps {
    meal: Meal;
    selections: Record<string, string[]>; // categoryId -> optionIds
    onSelectOption: (categoryId: string, optionId: string) => void;
    onOpenBottomSheet: (categoryId: string) => void;
    onCompleteMeal: () => void;
    onChangeMeal: () => void;
    onRequestChange: () => void;
}

/**
 * MealCard - Main meal card component
 */
function MealCard({
    meal,
    selections,
    onSelectOption,
    onOpenBottomSheet,
    onCompleteMeal,
    onChangeMeal,
    onRequestChange,
}: MealCardProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Check if all required categories have selections
    const isReadyToComplete = useMemo(() => {
        if (!meal.categories || meal.categories.length === 0) return true;
        return meal.categories.every((cat) => {
            const minSelect = cat.minSelect || 1;
            const selectedCount = (selections[cat.id] || []).length;
            return selectedCount >= minSelect;
        });
    }, [meal.categories, selections]);

    // Generate summary from selections
    const summary = useMemo(() => {
        if (!meal.categories) return [];
        return meal.categories.flatMap((cat) => {
            const selectedIds = selections[cat.id] || [];
            return cat.options
                .filter((opt) => selectedIds.includes(opt.id))
                .map((opt) => opt.textAr || opt.text);
        });
    }, [meal.categories, selections]);

    const toggleCategory = useCallback((categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    }, []);

    const handleSelectOption = useCallback(async (categoryId: string, optionId: string) => {
        await hapticLight();
        onSelectOption(categoryId, optionId);
    }, [onSelectOption]);

    const handleComplete = useCallback(async () => {
        if (isReadyToComplete) {
            await hapticSuccess();
            onCompleteMeal();
        }
    }, [isReadyToComplete, onCompleteMeal]);

    // =========================================================================
    // Completed State
    // =========================================================================
    if (meal.completed) {
        return (
            <Animated.View
                entering={FadeIn.duration(300)}
                style={[
                    styles.mealCard,
                    styles.mealCardCompleted,
                    { borderLeftWidth: isRTL ? 0 : 4, borderRightWidth: isRTL ? 4 : 0 },
                ]}
            >
                {/* Header */}
                <View style={[styles.mealHeader, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                    <View style={[styles.completedBadge, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                        <Ionicons name="checkmark-circle-sharp" size={20} color={colors.success} />
                        <Text style={styles.completedText}>{isRTL ? 'تم' : 'Done'}</Text>
                    </View>                    
                    <View style={[styles.mealInfo, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                        <Text style={styles.mealEmoji}>{meal.emoji || '🍽️'}</Text>
                        <Text style={[styles.mealName, isRTL && styles.textRTL]}>
                            {isRTL ? meal.nameAr : meal.name}
                        </Text>
                    </View>

                </View>

                {/* Summary */}
                {summary.length > 0 && (
                    <View style={styles.summaryCard}>
                        <Text style={[styles.summaryLabel, isRTL && styles.textRTL]}>
                            {isRTL ? 'ما أكلته:' : 'What I ate:'}
                        </Text>
                        {summary.map((item, i) => (
                            <View key={i} style={[styles.summaryItem, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={[styles.summaryText, isRTL && styles.textRTL]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Change Choices Button */}
                <TouchableOpacity
                    style={styles.changeChoicesButton}
                    onPress={onChangeMeal}
                    activeOpacity={0.7}
                >
                    <Text style={styles.changeChoicesText}>
                        {isRTL ? 'تغيير اختياراتي' : 'Change My Choices'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // =========================================================================
    // Active State
    // =========================================================================
    return (
        <Animated.View
            entering={FadeInUp.duration(400)}
            layout={Layout.springify().damping(20)}
            style={styles.mealCard}
        >
            {/* Header */}
            <View style={[styles.mealHeader, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                <TouchableOpacity onPress={onRequestChange} style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </TouchableOpacity>                
                <View style={[styles.mealInfo, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                    <Text style={styles.mealEmoji}>{meal.emoji || '🍽️'}</Text>
                    <Text style={[styles.mealName, isRTL && styles.textRTL]}>
                        {isRTL ? meal.nameAr : meal.name}
                    </Text>
                </View>

            </View>

            {/* Categories */}
            {meal.categories && meal.categories.length > 0 && (
                <View style={styles.categoriesContainer}>
                    {meal.categories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            selectedOptions={selections[category.id] || []}
                            isExpanded={expandedCategories[category.id] || false}
                            onToggleExpand={() => toggleCategory(category.id)}
                            onSelectOption={(optionId) => handleSelectOption(category.id, optionId)}
                            onOpenSheet={() => onOpenBottomSheet(category.id)}
                        />
                    ))}
                </View>
            )}

            {/* Complete Button */}
            <TouchableOpacity
                style={[
                    styles.completeButton,
                    !isReadyToComplete && styles.completeButtonDisabled,
                ]}
                onPress={handleComplete}
                disabled={!isReadyToComplete}
                activeOpacity={0.7}
            >
                <Text style={styles.completeButtonText}>
                    {isRTL ? 'أكلت هذا' : 'I Ate This'}
                </Text>
            </TouchableOpacity>

            {!isReadyToComplete && (
                <Text style={styles.selectHint}>
                    {isRTL ? 'اختر من كل فئة أولاً' : 'Select your choices first'}
                </Text>
            )}
        </Animated.View>
    );
}

// =============================================================================
// Category Section Component
// =============================================================================

interface CategorySectionProps {
    category: MealCategory;
    selectedOptions: string[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onSelectOption: (optionId: string) => void;
    onOpenSheet: () => void;
}

const CategorySection = memo(({
    category,
    selectedOptions,
    isExpanded,
    onToggleExpand,
    onSelectOption,
    onOpenSheet,
}: CategorySectionProps) => {
    const hasSelection = selectedOptions.length > 0;
    const visibleOptions = isExpanded ? category.options : category.options.slice(0, 3);
    const hasMore = category.options.length > 3;

    return (
        <View style={styles.categoryContainer}>
            {/* Category Header */}
            <View style={[styles.categoryHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.categoryTitleRow, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                    {category.emoji && <Text style={styles.categoryEmoji}>{category.emoji}</Text>}
                    <Text style={styles.categoryName}>
                        {isRTL ? category.nameAr : category.name}
                    </Text>
                    {hasSelection && (
                        <Ionicons name="checkmark" size={14} color={colors.success} />
                    )}
                </View>
                {hasMore && !isExpanded && (
                    <TouchableOpacity onPress={onToggleExpand}>
                        <Text style={styles.moreOptionsText}>
                            {isRTL ? `+${category.options.length - 3} المزيد` : `+${category.options.length - 3} more`}
                        </Text>
                    </TouchableOpacity>
                )}                
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {visibleOptions.map((option, i) => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionButton,
                                isSelected && styles.optionButtonSelected,
                                i < visibleOptions.length - 1 && styles.optionBorder,
                                { flexDirection: isRTL ? 'row' : 'row-reverse' },
                            ]}
                            onPress={() => onSelectOption(option.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[styles.optionText, isRTL && styles.textRTL]}>
                                {isRTL ? (option.textAr || option.text) : option.text}
                            </Text>
                            {isSelected && (
                                <Ionicons name="checkmark" size={16} color={colors.success} />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Show Less Button */}
                {isExpanded && hasMore && (
                    <TouchableOpacity
                        style={styles.showLessButton}
                        onPress={onToggleExpand}
                    >
                        <Text style={styles.showLessText}>
                            {isRTL ? 'عرض أقل' : 'Show less'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* See All Options */}
            {!isExpanded && hasMore && (
                <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={onOpenSheet}
                >
                    <Text style={styles.seeAllText}>
                        {isRTL ? 'انقر لرؤية جميع الخيارات' : 'Tap to see all options'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
    mealCard: {
        backgroundColor: colors.bgPrimary,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginBottom: verticalScale(12),
        ...shadows.card,
    },
    mealCardCompleted: {
        borderColor: colors.success,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    mealInfo: {
        alignItems: 'center',
        gap: horizontalScale(10),
    },
    mealEmoji: {
        fontSize: ScaleFontSize(24),
    },
    mealName: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    textRTL: {
        textAlign: 'right',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    completedText: {
        fontSize: ScaleFontSize(12),
        color: colors.success,
        fontWeight: '600',
    },
    moreButton: {
        padding: horizontalScale(4),
    },

    // Summary (completed state)
    summaryCard: {
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(12),
        marginBottom: verticalScale(12),
    },
    summaryLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: horizontalScale(8),
        marginBottom: verticalScale(4),
    },
    bulletPoint: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
    },
    summaryText: {
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
        flex: 1,
    },
    changeChoicesButton: {
        borderWidth: 2,
        borderColor: colors.border,
        height: verticalScale(48),
        borderRadius: horizontalScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeChoicesText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textSecondary,
    },

    // Categories
    categoriesContainer: {
        gap: verticalScale(12),
        marginBottom: verticalScale(16),
    },
    categoryContainer: {
    },
    categoryHeader: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    categoryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
    },
    categoryEmoji: {
        fontSize: ScaleFontSize(18),
    },
    categoryName: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    moreOptionsText: {
        fontSize: ScaleFontSize(12),
        color: colors.primaryDark,
        fontWeight: '600',
    },
    optionsContainer: {
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
        padding: horizontalScale(12),
    },
    optionButtonSelected: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    radioOuter: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primaryDark,
        backgroundColor: colors.primaryDark,
    },
    radioInner: {
        width: horizontalScale(8),
        height: horizontalScale(8),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.white,
    },
    optionText: {
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
        flex: 1,
    },
    showLessButton: {
        padding: horizontalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    showLessText: {
        fontSize: ScaleFontSize(12),
        color: colors.primaryDark,
        fontWeight: '600',
    },
    seeAllButton: {
        padding: horizontalScale(8),
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    seeAllText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
    },

    // Complete Button
    completeButton: {
        backgroundColor: colors.success,
        height: verticalScale(48),
        borderRadius: horizontalScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonDisabled: {
        backgroundColor: colors.border,
        opacity: 0.5,
    },
    completeButtonText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.white,
    },
    selectHint: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: verticalScale(8),
    },
});

export default memo(MealCard);
