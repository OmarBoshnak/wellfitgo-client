/**
 * SavedCard Component
 * @description Saved card display with radio selection
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
    interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { SavedCard as SavedCardType } from '@/src/shared/types/payment';
import { getCardBrandInfo, maskCardNumber } from '@/src/shared/utils/cardUtils';

interface SavedCardProps {
    /** Card data */
    card: SavedCardType;
    /** Whether this card is selected */
    isSelected: boolean;
    /** Callback when card is selected */
    onSelect: () => void;
    /** Callback when delete is pressed */
    onDelete: () => void;
}

/**
 * SavedCard - Saved card with selection and delete
 */
function SavedCard({
    card,
    isSelected,
    onSelect,
    onDelete,
}: SavedCardProps) {
    const scale = useSharedValue(1);
    const selected = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        selected.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    }, [isSelected, selected]);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.98);
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

    const handleSelect = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
    }, [onSelect]);

    const handleDelete = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
    }, [onDelete]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            selected.value,
            [0, 1],
            [colors.border, colors.primaryDark]
        ),
        borderWidth: selected.value > 0.5 ? 2 : 1,
    }));

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

    const brandInfo = getCardBrandInfo(card.type);

    return (
        <Pressable
            onPress={handleSelect}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${brandInfo.labelAr} تنتهي بـ ${card.last4}`}
        >
            <Animated.View
                style={[styles.container, animatedContainerStyle, animatedBorderStyle]}
            >
                <View style={styles.content}>
                    {/* Radio button */}
                    <Animated.View style={[styles.radioOuter, animatedRadioOuter]}>
                        <Animated.View style={[styles.radioInner, animatedRadioInner]}>
                            <LinearGradient
                                colors={gradients.primary}
                                style={styles.radioGradient}
                            />
                        </Animated.View>
                    </Animated.View>

                    {/* Card icon */}
                    <View style={[styles.cardIcon, { backgroundColor: brandInfo.color + '15' }]}>
                        <Ionicons
                            name="card"
                            size={horizontalScale(20)}
                            color={brandInfo.color}
                        />
                    </View>

                    {/* Card info */}
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardNumber}>
                            {maskCardNumber(card.last4)}
                        </Text>
                        <Text style={styles.cardMeta}>
                            {brandInfo.labelAr} • تنتهي {card.expiry}
                        </Text>
                    </View>

                    {/* Delete button */}
                    <Pressable
                        onPress={handleDelete}
                        style={styles.deleteButton}
                        accessibilityRole="button"
                        accessibilityLabel="حذف البطاقة"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={horizontalScale(18)}
                            color={colors.error}
                        />
                    </Pressable>
                </View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(14),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: colors.border,
    },
    content: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: horizontalScale(14),
        gap: horizontalScale(12),
    },
    radioOuter: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: horizontalScale(10),
        height: horizontalScale(10),
        borderRadius: horizontalScale(5),
        overflow: 'hidden',
    },
    radioGradient: {
        width: '100%',
        height: '100%',
    },
    cardIcon: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardNumber: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        letterSpacing: 1,
        textAlign: 'right'
    },
    cardMeta: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
        textAlign: 'right'
    },
    deleteButton: {
        padding: horizontalScale(8),
    },
});

export default memo(SavedCard);
