/**
 * MedicalConditionsChip Component
 * @description Multi-select chip component for medical conditions
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    Layout,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { MedicalCondition, MedicalConditionOption } from '@/src/shared/types/health';
import { LinearGradient } from 'expo-linear-gradient';

/** Medical condition options with Arabic labels */
const CONDITION_OPTIONS: MedicalConditionOption[] = [
    { value: 'none', labelAr: 'لا يوجد', labelEn: 'None' },
    { value: 'diabetes', labelAr: 'السكري', labelEn: 'Diabetes' },
    { value: 'hypertension', labelAr: 'ارتفاع ضغط الدم', labelEn: 'Hypertension' },
    { value: 'heart_disease', labelAr: 'أمراض القلب', labelEn: 'Heart Disease' },
    { value: 'asthma', labelAr: 'الربو', labelEn: 'Asthma' },
    { value: 'thyroid', labelAr: 'الغدة الدرقية', labelEn: 'Thyroid' },
    { value: 'cholesterol', labelAr: 'الكوليسترول', labelEn: 'Cholesterol' },
];

interface MedicalConditionsChipProps {
    /** Selected conditions */
    value: MedicalCondition[];
    /** Callback when conditions change */
    onChange: (conditions: MedicalCondition[]) => void;
    /** Error message to display */
    error?: string;
    /** Label text */
    label?: string;
    /** Show custom input */
    showCustomInput?: boolean;
}

interface ChipItemProps {
    option: MedicalConditionOption;
    isSelected: boolean;
    onPress: () => void;
}

/**
 * Individual chip item
 */
function ChipItem({ option, isSelected, onPress }: ChipItemProps) {
    const scale = useSharedValue(1);
    const selected = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        selected.value = withTiming(isSelected ? 1 : 0, { duration: 150 });
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
            borderWidth: interpolate(selected.value, [0, 1], [1, 0]),
            borderColor: colors.border,
        };
    });

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option.labelAr}
        >
            <Animated.View
                layout={Layout.springify()}
                style={[styles.chipContainer, animatedContainerStyle, animatedBorderStyle]}
            >
                {isSelected ? (
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chipContent}
                    >
                        <Text style={[styles.chipText, styles.chipTextSelected]}>
                            {option.labelAr}
                        </Text>
                        <Ionicons
                            name="checkmark-circle"
                            size={horizontalScale(16)}
                            color={colors.white}
                        />
                    </LinearGradient>
                ) : (
                    <View style={styles.chipContent}>
                        <Text style={styles.chipText}>{option.labelAr}</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
}

/**
 * MedicalConditionsChip - Multi-select chips for medical conditions
 */
export default function MedicalConditionsChip({
    value,
    onChange,
    error,
    label = 'الحالات الصحية',
}: MedicalConditionsChipProps) {
    const handleToggle = useCallback((condition: MedicalCondition) => {
        // Special handling for "none" option
        if (condition === 'none') {
            // If selecting "none", clear all other selections
            if (!value.includes('none')) {
                onChange(['none']);
            } else {
                onChange([]);
            }
            return;
        }

        // If selecting another condition, remove "none" if present
        let newConditions = value.filter(c => c !== 'none');

        if (newConditions.includes(condition)) {
            newConditions = newConditions.filter(c => c !== condition);
        } else {
            newConditions = [...newConditions, condition];
        }

        onChange(newConditions);
    }, [value, onChange]);

    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.hint}>يمكنك اختيار أكثر من خيار</Text>

            {/* Chips grid */}
            <View style={styles.chipsContainer}>
                {CONDITION_OPTIONS.map((option) => (
                    <ChipItem
                        key={option.value}
                        option={option}
                        isSelected={value.includes(option.value)}
                        onPress={() => handleToggle(option.value)}
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
        marginBottom: verticalScale(4),
    },
    hint: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(12),
    },
    chipsContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: horizontalScale(10),
    },
    chipContainer: {
        borderRadius: horizontalScale(20),
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(16),
        gap: horizontalScale(6),
        backgroundColor: colors.bgSecondary,
    },
    chipText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '500',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    chipTextSelected: {
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
