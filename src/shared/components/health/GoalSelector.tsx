/**
 * GoalSelector Component
 * @description Fitness goal selection with icons and animations
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { FitnessGoal, GoalOption } from '@/src/shared/types/health';

/** Goal options with Arabic labels and icons */
const GOAL_OPTIONS: GoalOption[] = [
    {
        value: 'lose_weight',
        labelAr: 'إنقاص الوزن',
        labelEn: 'Lose Weight',
        icon: 'trending-down',
    },
    {
        value: 'gain_muscle',
        labelAr: 'بناء العضلات',
        labelEn: 'Build Muscle',
        icon: 'fitness',
    },
    {
        value: 'maintain',
        labelAr: 'الحفاظ على الوزن',
        labelEn: 'Maintain',
        icon: 'analytics',
    },
    {
        value: 'improve_health',
        labelAr: 'تحسين الصحة',
        labelEn: 'Improve Health',
        icon: 'heart',
    },
];

interface GoalSelectorProps {
    /** Currently selected goal */
    value: FitnessGoal | null;
    /** Callback when goal is selected */
    onChange: (goal: FitnessGoal) => void;
    /** Error message to display */
    error?: string;
    /** Label text */
    label?: string;
}

interface GoalOptionItemProps {
    option: GoalOption;
    isSelected: boolean;
    onPress: () => void;
}

/**
 * Individual goal option item
 */
function GoalOptionItem({ option, isSelected, onPress }: GoalOptionItemProps) {
    const scale = useSharedValue(1);
    const selected = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        selected.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    }, [isSelected, selected]);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.97);
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }, [onPress]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const animatedBorderStyle = useAnimatedStyle(() => {
        return {
            borderWidth: interpolate(selected.value, [0, 1], [1, 2]),
            borderColor: selected.value > 0.5 ? colors.primaryDark : colors.border,
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(selected.value, [0, 1], [1, 1.15]) },
            ],
        };
    });

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.labelAr}
        >
            <Animated.View style={[styles.optionContainer, animatedContainerStyle, animatedBorderStyle]}>
                {isSelected ? (
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.optionContent}
                    >
                        <Animated.View style={animatedIconStyle}>
                            <Ionicons
                                name={option.icon as keyof typeof Ionicons.glyphMap}
                                size={horizontalScale(24)}
                                color={colors.white}
                            />
                        </Animated.View>
                        <Text style={[styles.optionLabel, styles.optionLabelSelected]}>
                            {option.labelAr}
                        </Text>
                        <Ionicons
                            name="checkmark-circle"
                            size={horizontalScale(20)}
                            color={colors.white}
                        />
                    </LinearGradient>
                ) : (
                    <View style={styles.optionContent}>
                        <Animated.View style={animatedIconStyle}>
                            <Ionicons
                                name={option.icon as keyof typeof Ionicons.glyphMap}
                                size={horizontalScale(24)}
                                color={colors.textSecondary}
                            />
                        </Animated.View>
                        <Text style={styles.optionLabel}>{option.labelAr}</Text>
                        <View style={styles.radioOuter}>
                            <View style={styles.radioInner} />
                        </View>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

/**
 * GoalSelector - Fitness goal selection component
 */
export default function GoalSelector({
    value,
    onChange,
    error,
    label = 'ما هو هدفك؟',
}: GoalSelectorProps) {
    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>

            {/* Options */}
            <View
                style={styles.optionsContainer}
                accessibilityRole="radiogroup"
                accessibilityLabel={label}
            >
                {GOAL_OPTIONS.map((option) => (
                    <GoalOptionItem
                        key={option.value}
                        option={option}
                        isSelected={value === option.value}
                        onPress={() => onChange(option.value)}
                    />
                ))}
            </View>

            {/* Error message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle"
                        size={horizontalScale(14)}
                        color={colors.error}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: verticalScale(20),
    },
    label: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(12),
    },
    optionsContainer: {
        gap: verticalScale(12),
    },
    optionContainer: {
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(16),
        paddingHorizontal: horizontalScale(16),
        gap: horizontalScale(12),
        backgroundColor: colors.bgSecondary,
    },
    optionLabel: {
        flex: 1,
        fontSize: ScaleFontSize(15),
        fontWeight: '500',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    optionLabelSelected: {
        color: colors.white,
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
    radioInner: {
        width: horizontalScale(10),
        height: horizontalScale(10),
        borderRadius: horizontalScale(5),
        backgroundColor: 'transparent',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
        gap: horizontalScale(6),
    },
    errorText: {
        fontSize: ScaleFontSize(12),
        color: colors.error,
        writingDirection: 'rtl',
    },
});
