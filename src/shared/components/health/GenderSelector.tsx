/**
 * GenderSelector Component
 * @description Animated gender selection with haptic feedback
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

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { Gender } from '@/src/shared/types/health';
import { LinearGradient } from 'expo-linear-gradient';

interface GenderSelectorProps {
    /** Currently selected gender */
    value: Gender | null;
    /** Callback when gender is selected */
    onChange: (gender: Gender) => void;
    /** Error message to display */
    error?: string;
    /** Label text */
    label?: string;
}

interface GenderOptionProps {
    gender: Gender;
    isSelected: boolean;
    onPress: () => void;
    icon: 'male' | 'female';
    label: string;
}

/**
 * Individual gender option button
 */
function GenderOption({ gender, isSelected, onPress, icon, label }: GenderOptionProps) {
    const scale = useSharedValue(1);
    const selected = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        selected.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    }, [isSelected, selected]);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.95);
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
                { scale: interpolate(selected.value, [0, 1], [1, 1.1]) },
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
            accessibilityLabel={label}
        >
            <Animated.View style={[styles.optionContainer, animatedContainerStyle, animatedBorderStyle]}>
                {isSelected ? (
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.selectedBackground}
                    >
                        <Animated.View style={animatedIconStyle}>
                            <Ionicons
                                name={icon}
                                size={horizontalScale(40)}
                                color={colors.white}
                            />
                        </Animated.View>
                        <Text style={[styles.optionLabel, styles.optionLabelSelected]}>{label}</Text>
                    </LinearGradient>
                ) : (
                    <View style={styles.unselectedBackground}>
                        <Animated.View style={animatedIconStyle}>
                            <Ionicons
                                name={icon}
                                size={horizontalScale(40)}
                                color={colors.textSecondary}
                            />
                        </Animated.View>
                        <Text style={styles.optionLabel}>{label}</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

/**
 * GenderSelector - Male/Female selection component
 */
export default function GenderSelector({
    value,
    onChange,
    error,
    label = 'الجنس',
}: GenderSelectorProps) {
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
                <GenderOption
                    gender="male"
                    isSelected={value === 'male'}
                    onPress={() => onChange('male')}
                    icon="male"
                    label="ذكر"
                />
                <GenderOption
                    gender="female"
                    isSelected={value === 'female'}
                    onPress={() => onChange('female')}
                    icon="female"
                    label="أنثى"
                />
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
        flexDirection: 'row',
        gap: horizontalScale(16),
    },
    optionContainer: {
        flex: 1,
        borderRadius: horizontalScale(16),
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    selectedBackground: {
        width: horizontalScale(150),
        height: verticalScale(120),
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(8),
    },
    unselectedBackground: {
        width: horizontalScale(150),
        height: verticalScale(120),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgSecondary,
        gap: verticalScale(8),
    },
    optionLabel: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    optionLabelSelected: {
        color: colors.white,
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
