/**
 * GeneralMealCard Component
 * @description Meal card for general format with categories and options
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { GeneralMealCardProps } from '@/src/shared/types/meals';
import { formatMealTime } from '@/src/shared/utils/dateTime/mealDateFormatting';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * GeneralMealCard - Expandable meal card with categories
 */
function GeneralMealCard({
    meal,
    selections,
    onToggle,
    onSelectOption,
    onOptionsPress,
}: GeneralMealCardProps) {
    const [expanded, setExpanded] = useState(false);
    const scale = useSharedValue(1);

    const handleToggle = useCallback(() => {
        scale.value = withSpring(0.98, {}, () => {
            scale.value = withSpring(1);
        });
        onToggle();
    }, [onToggle, scale]);

    const toggleExpand = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    }, [expanded]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const selectedCount = Object.values(selections).flat().length;
    const hasCategories = meal.categories && meal.categories.length > 0;

    return (
        <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
            <View style={styles.card}>
                {/* Header */}
                <Pressable
                    onPress={hasCategories ? toggleExpand : handleToggle}
                    accessibilityRole="button"
                    accessibilityLabel={meal.nameAr || meal.name}
                    style={styles.header}
                >
                    <View style={[
                        styles.emojiContainer,
                        meal.completed && styles.emojiContainerCompleted,
                    ]}>
                        <Text style={styles.emoji}>{meal.emoji || '🍽️'}</Text>
                    </View>

                    <View style={styles.headerContent}>
                        <Text style={styles.mealName}>
                            {meal.nameAr || meal.name}
                        </Text>
                        {meal.time && (
                            <Text style={styles.mealTime}>
                                {formatMealTime(meal.time, true)}
                            </Text>
                        )}
                        {selectedCount > 0 && (
                            <Text style={styles.selectionCount}>
                                {selectedCount} عناصر محددة
                            </Text>
                        )}
                    </View>

                    <View style={styles.headerActions}>
                        {hasCategories && (
                            <Ionicons
                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                size={horizontalScale(20)}
                                color={colors.textSecondary}
                            />
                        )}
                    </View>
                </Pressable>

                {/* Expandable Categories */}
                {expanded && hasCategories && (
                    <View style={styles.categoriesContainer}>
                        {meal.categories!.map((category) => {
                            const categorySelections = selections[category.id] || [];

                            return (
                                <View key={category.id} style={styles.category}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryEmoji}>{category.emoji || '•'}</Text>
                                        <Text style={styles.categoryName}>{category.nameAr || category.name}</Text>
                                        {category.minSelect && category.minSelect > 0 ? (
                                            <Text style={styles.categoryRequired}>
                                                {`(اختر ${category.minSelect})`}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View style={styles.optionsContainer}>
                                        {category.options.map((option) => {
                                            const isSelected = categorySelections.includes(option.id);

                                            return (
                                                <Pressable
                                                    key={option.id}
                                                    onPress={() => onSelectOption(category.id, option.id)}
                                                    accessibilityRole="checkbox"
                                                    accessibilityState={{ checked: isSelected }}
                                                    accessibilityLabel={option.textAr || option.text}
                                                    style={[
                                                        styles.option,
                                                        isSelected && styles.optionSelected,
                                                    ]}
                                                >
                                                    <View style={[
                                                        styles.optionCheck,
                                                        isSelected && styles.optionCheckSelected,
                                                    ]}>
                                                        {isSelected && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={horizontalScale(12)}
                                                                color={colors.white}
                                                            />
                                                        )}
                                                    </View>
                                                    <Text style={[
                                                        styles.optionText,
                                                        isSelected && styles.optionTextSelected,
                                                    ]}>
                                                        {option.textAr || option.text}
                                                    </Text>
                                                    {option.calories ? (
                                                        <Text style={styles.optionCalories}>
                                                            {`${option.calories} سعرة`}
                                                        </Text>
                                                    ) : null}
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <Pressable
                        onPress={handleToggle}
                        accessibilityRole="button"
                        accessibilityLabel={meal.completed ? 'إلغاء الإكمال' : 'تم'}
                        style={[
                            styles.completeButton,
                            meal.completed && styles.completeButtonDone,
                        ]}
                    >
                        <Ionicons
                            name={meal.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={horizontalScale(18)}
                            color={meal.completed ? colors.white : colors.primaryDark}
                        />
                        <Text style={[
                            styles.completeButtonText,
                            meal.completed && styles.completeButtonTextDone,
                        ]}>
                            {meal.completed ? 'مكتمل' : 'تم'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: verticalScale(4),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        overflow: 'hidden',
        ...shadows.light,
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: horizontalScale(12),
    },
    emojiContainer: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiContainerCompleted: {
        backgroundColor: 'rgba(39, 174, 97, 0.1)',
    },
    emoji: {
        fontSize: ScaleFontSize(22),
    },
    headerContent: {
        flex: 1,
        marginRight: horizontalScale(12),
    },
    mealName: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    mealTime: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    selectionCount: {
        fontSize: ScaleFontSize(11),
        color: colors.primaryDark,
        marginTop: verticalScale(2),
    },
    headerActions: {
        marginLeft: horizontalScale(8),
    },
    categoriesContainer: {
        paddingHorizontal: horizontalScale(12),
        paddingBottom: horizontalScale(8),
        borderTopWidth: 1,
        borderTopColor: colors.bgSecondary,
    },
    category: {
        marginTop: verticalScale(12),
    },
    categoryHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    categoryEmoji: {
        fontSize: ScaleFontSize(14),
        marginLeft: horizontalScale(6),
    },
    categoryName: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    categoryRequired: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginRight: horizontalScale(6),
    },
    optionsContainer: {
        gap: verticalScale(6),
    },
    option: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(10),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(8),
    },
    optionSelected: {
        backgroundColor: colors.primaryLightBg,
    },
    optionCheck: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        borderWidth: 2,
        borderColor: colors.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionCheckSelected: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primaryDark,
    },
    optionText: {
        flex: 1,
        marginRight: horizontalScale(10),
        fontSize: ScaleFontSize(13),
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    optionTextSelected: {
        fontWeight: '500',
        color: colors.primaryDark,
    },
    optionCalories: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
    },
    footer: {
        flexDirection: 'row-reverse',
        padding: horizontalScale(12),
        paddingTop: 0,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(14),
        borderRadius: horizontalScale(8),
        backgroundColor: colors.primaryLightBg,
        gap: horizontalScale(6),
    },
    completeButtonDone: {
        backgroundColor: colors.success,
    },
    completeButtonText: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    completeButtonTextDone: {
        color: colors.white,
    },
});

export default memo(GeneralMealCard);
