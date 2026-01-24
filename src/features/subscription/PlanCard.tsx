/**
 * PlanCard Component
 * @description Individual subscription plan card with selection state
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { SubscriptionPlan } from '@/src/shared/types/subscription';

interface PlanCardProps {
    /** The subscription plan data */
    plan: SubscriptionPlan;
    /** Whether this plan is currently selected */
    isSelected: boolean;
    /** Callback when plan is selected */
    onSelect: () => void;
}

/**
 * Badge component for Best Value / Most Popular
 */
const PlanBadge = memo(function PlanBadge({
    type,
}: {
    type: 'best-value' | 'most-popular';
}) {
    const isBestValue = type === 'best-value';

    return (
        <View style={styles.badgeContainer}>
            <LinearGradient
                colors={isBestValue ? ['#5073FE', '#7C3AED'] : gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
            >
                <Ionicons
                    name={isBestValue ? 'star' : 'flame'}
                    size={horizontalScale(12)}
                    color={colors.white}
                />
                <Text style={styles.badgeText}>
                    {isBestValue ? 'أفضل قيمة' : 'الأكثر شعبية'}
                </Text>
            </LinearGradient>
        </View>
    );
});

/**
 * PlanCard - Subscription plan selection card
 */
function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
    const scale = useSharedValue(1);
    const selected = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        selected.value = withTiming(isSelected ? 1 : 0, { duration: 250 });
    }, [isSelected, selected]);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.98);
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelect();
    }, [onSelect]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedBorderStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            selected.value,
            [0, 1],
            [colors.border, colors.primaryDark]
        );
        const borderWidth = interpolate(selected.value, [0, 1], [1, 2]);

        return {
            borderColor,
            borderWidth,
        };
    });

    const animatedRadioOuter = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            selected.value,
            [0, 1],
            [colors.textSecondary, colors.primaryDark]
        ),
    }));

    const animatedRadioInner = useAnimatedStyle(() => ({
        transform: [{ scale: selected.value }],
        opacity: selected.value,
    }));

    const hasBadge = plan.badge !== undefined;
    const hasSavings = plan.savings !== undefined;

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${plan.nameAr} - ${plan.price} ${plan.currencyAr}`}
        >
            <Animated.View
                style={[
                    styles.container,
                    animatedContainerStyle,
                    animatedBorderStyle,
                    hasBadge && styles.containerWithBadge,
                    plan.badge === 'best-value' && styles.containerBestValue,
                ]}
            >
                {/* Badge */}
                {hasBadge && <PlanBadge type={plan.badge!} />}

                <View style={styles.content}>
                    {/* Left side - Radio and plan info */}
                    <View style={styles.leftSection}>
                        {/* Radio button */}
                        <Animated.View style={[styles.radioOuter, animatedRadioOuter]}>
                            <Animated.View style={[styles.radioInner, animatedRadioInner]}>
                                <LinearGradient
                                    colors={gradients.primary}
                                    style={styles.radioGradient}
                                />
                            </Animated.View>
                        </Animated.View>

                        {/* Plan info */}
                        <View style={styles.planInfo}>
                            <Text style={styles.planName}>{plan.nameAr}</Text>
                            {hasSavings && (
                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>{plan.savingsAr}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Right side - Pricing */}
                    <View style={styles.rightSection}>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{plan.price}</Text>
                            <Text style={styles.currency}>{plan.currencyAr}</Text>
                        </View>
                        {plan.originalPrice && (
                            <Text style={styles.originalPrice}>
                                {plan.originalPrice} {plan.currencyAr}
                            </Text>
                        )}
                        {plan.duration > 1 && (
                            <Text style={styles.pricePerMonth}>
                                {plan.pricePerMonth} {plan.currencyAr}/شهر
                            </Text>
                        )}
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        marginHorizontal: horizontalScale(20),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'visible',
    },
    containerWithBadge: {
        marginTop: verticalScale(14),
    },
    containerBestValue: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: horizontalScale(16),
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    radioOuter: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        borderRadius: horizontalScale(11),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: horizontalScale(12),
        height: horizontalScale(12),
        borderRadius: horizontalScale(6),
        overflow: 'hidden',
    },
    radioGradient: {
        width: '100%',
        height: '100%',
    },
    planInfo: {
        gap: verticalScale(4),
    },
    planName: {
        fontSize: ScaleFontSize(17),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    savingsBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(2),
        borderRadius: horizontalScale(4),
        alignSelf: 'flex-start',
    },
    savingsText: {
        fontSize: ScaleFontSize(11),
        fontWeight: '600',
        color: '#10B981',
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: horizontalScale(4),
    },
    price: {
        fontSize: ScaleFontSize(24),
        fontWeight: '800',
        color: colors.textPrimary,
    },
    currency: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    originalPrice: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
        marginTop: verticalScale(2),
    },
    pricePerMonth: {
        fontSize: ScaleFontSize(12),
        color: colors.primaryDark,
        fontWeight: '500',
        marginTop: verticalScale(2),
    },
    // Badge styles
    badgeContainer: {
        position: 'absolute',
        top: -verticalScale(12),
        alignSelf: 'center',
        zIndex: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(12),
        gap: horizontalScale(4),
    },
    badgeText: {
        fontSize: ScaleFontSize(11),
        fontWeight: '700',
        color: colors.white,
    },
});

export default memo(PlanCard);
