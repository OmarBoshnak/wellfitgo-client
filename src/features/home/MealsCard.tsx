/**
 * MealsCard Component
 * @description Today's meals list with completion tracking - simplified design
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { MealItem, MealsCardProps } from '@/src/shared/types/home';

// RTL constant - in production this would come from i18n
const isRTL = true;

// Translations
const homeTranslations = {
    todaysPlan: isRTL ? 'خطة اليوم' : "Today's Plan",
    viewAll: isRTL ? 'عرض الكل' : 'View All'
};

/**
 * MealsCard - Today's meal plan card
 */
function MealsCard({
    meals,
    onNavigate,
    isLoading = false,
    error,
    onRetry,
}: MealsCardProps) {

    return (
        <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.container}
        >
            {/* Card 3: Today's Meals */}
            <TouchableOpacity
                style={[styles.card, shadows.light]}
                onPress={() => onNavigate('meals')}
                activeOpacity={0.8}
            >
                <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                    <Text style={styles.viewAllText}>
                        {homeTranslations.viewAll}
                    </Text>
                    <Text style={styles.cardTitle}>
                        {homeTranslations.todaysPlan}
                    </Text>

                </View>

                <View style={styles.mealsList}>
                    {isLoading ? (
                        // Loading state
                        <View style={styles.mealsLoading}>
                            <ActivityIndicator size="small" color={colors.primaryDark} />
                            <Text style={styles.mealsLoadingText}>
                                {isRTL ? 'جاري التحميل...' : 'Loading meals...'}
                            </Text>
                        </View>
                    ) : meals.length === 0 ? (
                        // No plan state
                        <View style={styles.noMealsState}>
                            <Text style={styles.noMealsEmoji}>🥗</Text>
                            <Text style={[styles.noMealsText, isRTL && styles.textRTL]}>
                                {isRTL ? 'لم يتم تعيين خطة بعد' : 'No plan assigned yet'}
                            </Text>
                        </View>
                    ) : (
                        // Meals list
                        meals.map((meal, i) => (
                            <View key={meal.id || i} style={[styles.mealItem, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>

                                {meal.isCompleted ? (
                                    <View style={styles.checkmarkCompleted}>
                                        <Ionicons name="checkmark" size={14} color={colors.white} />
                                    </View>
                                ) : (
                                    <View style={styles.checkmarkEmpty} />
                                )}

                                <Text style={[styles.mealName, isRTL && styles.textRTL]}>
                                    <Text style={styles.mealEmoji}>{meal.emoji || '🍽️'}</Text>{'  '}
                                    {meal.name}
                                </Text>

                            </View>
                        ))
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },

    // Card styles
    card: {
        backgroundColor: colors.bgPrimary,
        borderRadius: 16,
        padding: 16,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    cardTitle: {
        fontSize: ScaleFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
    },

    viewAllText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.primaryDark,
    },

    // Meals list styles
    mealsList: {
        gap: 10,
    },

    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },

    mealEmoji: {
        fontSize: 15,
    },

    mealName: {
        flex: 1,
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
    },

    checkmarkCompleted: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkmarkEmpty: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
    },

    // Loading state
    mealsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 20,
    },

    mealsLoadingText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
    },

    // Empty state
    noMealsState: {
        alignItems: 'center',
        paddingVertical: 30,
    },

    noMealsEmoji: {
        fontSize: 40,
        marginBottom: 8,
    },

    noMealsText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // RTL support
    textRTL: {
        textAlign: 'right',
    },
});

export default memo(MealsCard);
