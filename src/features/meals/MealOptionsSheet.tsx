/**
 * MealOptionsSheet Component
 * @description Bottom sheet for selecting meal options
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { MealOptionsSheetProps } from '@/src/shared/types/meals';

/**
 * MealOptionsSheet - Bottom sheet for meal options
 */
function MealOptionsSheet({
    visible,
    meal,
    selections,
    onClose,
    onSelectOption,
    onConfirm,
}: MealOptionsSheetProps) {
    // Calculate total calories
    const totalCalories = useMemo(() => {
        if (!meal?.categories) return 0;

        let total = 0;
        meal.categories.forEach(category => {
            const categorySelections = selections[category.id] || [];
            category.options.forEach(option => {
                if (categorySelections.includes(option.id) && option.calories) {
                    total += option.calories;
                }
            });
        });
        return total;
    }, [meal, selections]);

    const handleSelectOption = useCallback((categoryId: string, optionId: string) => {
        if (meal) {
            onSelectOption(meal.id, categoryId, optionId);
        }
    }, [meal, onSelectOption]);

    if (!meal) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={StyleSheet.absoluteFillObject}
                />
            </Pressable>

            <Animated.View
                entering={SlideInDown.duration(300)}
                exiting={SlideOutDown.duration(200)}
                style={styles.sheet}
            >
                {/* Handle */}
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="إغلاق"
                        style={styles.closeButton}
                    >
                        <Ionicons
                            name="close"
                            size={horizontalScale(24)}
                            color={colors.textPrimary}
                        />
                    </Pressable>
                    <View style={styles.headerContent}>
                        <Text style={styles.emoji}>{meal.emoji || '🍽️'}</Text>
                        <Text style={styles.mealName}>
                            {meal.nameAr || meal.name}
                        </Text>
                    </View>
                    <View style={{ width: horizontalScale(40) }} />
                </View>

                {/* Categories */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {meal.categories?.map((category) => {
                        const categorySelections = selections[category.id] || [];

                        return (
                            <View key={category.id} style={styles.category}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryEmoji}>
                                        {category.emoji || '•'}
                                    </Text>
                                    <Text style={styles.categoryName}>
                                        {category.nameAr || category.name}
                                    </Text>
                                    {category.minSelect && (
                                        <Text style={styles.categoryHint}>
                                            اختر {category.minSelect} على الأقل
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.options}>
                                    {category.options.map((option) => {
                                        const isSelected = categorySelections.includes(option.id);

                                        return (
                                            <Pressable
                                                key={option.id}
                                                onPress={() => handleSelectOption(category.id, option.id)}
                                                accessibilityRole="checkbox"
                                                accessibilityState={{ checked: isSelected }}
                                                style={[
                                                    styles.option,
                                                    isSelected && styles.optionSelected,
                                                ]}
                                            >
                                                <View style={[
                                                    styles.checkbox,
                                                    isSelected && styles.checkboxSelected,
                                                ]}>
                                                    {isSelected && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={horizontalScale(14)}
                                                            color={colors.white}
                                                        />
                                                    )}
                                                </View>
                                                <View style={styles.optionContent}>
                                                    <Text style={styles.optionText}>
                                                        {option.textAr || option.text}
                                                    </Text>
                                                    {option.serving && (
                                                        <Text style={styles.optionServing}>
                                                            {option.servingAr || option.serving}
                                                        </Text>
                                                    )}
                                                </View>
                                                {option.calories && (
                                                    <Text style={styles.optionCalories}>
                                                        {option.calories}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.totalCalories}>
                        <Text style={styles.totalLabel}>إجمالي السعرات</Text>
                        <Text style={styles.totalValue}>{totalCalories} سعرة</Text>
                    </View>
                    <Pressable
                        onPress={onConfirm}
                        accessibilityRole="button"
                        accessibilityLabel="تأكيد الاختيارات"
                        style={styles.confirmButton}
                    >
                        <Text style={styles.confirmButtonText}>تأكيد</Text>
                    </Pressable>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: horizontalScale(24),
        borderTopRightRadius: horizontalScale(24),
        maxHeight: '80%',
        ...shadows.medium,
    },
    handle: {
        alignSelf: 'center',
        width: horizontalScale(40),
        height: verticalScale(4),
        borderRadius: horizontalScale(2),
        backgroundColor: colors.bgSecondary,
        marginTop: verticalScale(12),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: horizontalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.bgSecondary,
    },
    closeButton: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: ScaleFontSize(28),
        marginBottom: verticalScale(4),
    },
    mealName: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: horizontalScale(16),
    },
    category: {
        marginBottom: verticalScale(20),
    },
    categoryHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    categoryEmoji: {
        fontSize: ScaleFontSize(16),
        marginLeft: horizontalScale(8),
    },
    categoryName: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    categoryHint: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginRight: horizontalScale(8),
    },
    options: {
        gap: verticalScale(8),
    },
    option: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: horizontalScale(12),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionSelected: {
        backgroundColor: colors.primaryLightBg,
        borderColor: colors.primaryDark,
    },
    checkbox: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        borderRadius: horizontalScale(11),
        borderWidth: 2,
        borderColor: colors.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primaryDark,
    },
    optionContent: {
        flex: 1,
        marginRight: horizontalScale(12),
    },
    optionText: {
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    optionServing: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    optionCalories: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: horizontalScale(16),
        borderTopWidth: 1,
        borderTopColor: colors.bgSecondary,
        paddingBottom: verticalScale(32), // Safe area
    },
    totalCalories: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
    },
    totalValue: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    confirmButton: {
        backgroundColor: colors.primaryDark,
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(32),
        borderRadius: horizontalScale(12),
    },
    confirmButtonText: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.white,
    },
});

export default memo(MealOptionsSheet);
