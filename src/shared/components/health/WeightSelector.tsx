/**
 * WeightSelector Component
 * @description Weight input with unit toggle (kg/lb) and visual scale
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { WeightUnit } from '@/src/shared/types/health';
import { convertWeight } from '@/src/shared/utils/validation';

interface WeightSelectorProps {
    /** Current weight value */
    value: number | null;
    /** Current unit */
    unit: WeightUnit;
    /** Callback when weight changes */
    onChange: (weight: number) => void;
    /** Callback when unit changes */
    onUnitChange: (unit: WeightUnit) => void;
    /** Error message to display */
    error?: string;
    /** Label text */
    label?: string;
}

// Weight ranges
const WEIGHT_MIN_KG = 30;
const WEIGHT_MAX_KG = 200;
const WEIGHT_MIN_LB = 66;
const WEIGHT_MAX_LB = 440;
const SLIDER_WIDTH = 280;

/**
 * WeightSelector - Weight input with unit toggle and visual slider
 */
export default function WeightSelector({
    value,
    unit,
    onChange,
    onUnitChange,
    error,
    label = 'الوزن',
}: WeightSelectorProps) {
    const [inputValue, setInputValue] = useState(value?.toString() || '');

    // Slider animation values
    const sliderPosition = useSharedValue(0);
    const sliderScale = useSharedValue(1);

    // Get min/max based on unit
    const minVal = unit === 'kg' ? WEIGHT_MIN_KG : WEIGHT_MIN_LB;
    const maxVal = unit === 'kg' ? WEIGHT_MAX_KG : WEIGHT_MAX_LB;

    // Update input when value or unit changes
    useEffect(() => {
        if (value !== null) {
            setInputValue(value.toString());
            // Update slider position
            const percentage = (value - minVal) / (maxVal - minVal);
            sliderPosition.value = withSpring(Math.max(0, Math.min(percentage, 1)) * SLIDER_WIDTH);
        }
    }, [value, unit, minVal, maxVal, sliderPosition]);

    // Handle unit toggle
    const handleUnitToggle = useCallback((newUnit: WeightUnit) => {
        if (newUnit !== unit) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Convert value to new unit
            if (value !== null) {
                const converted = convertWeight(value, unit, newUnit);
                onChange(converted);
            }
            onUnitChange(newUnit);
        }
    }, [unit, value, onChange, onUnitChange]);

    // Handle text input change
    const handleInputChange = useCallback((text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        setInputValue(cleaned);

        const numValue = parseFloat(cleaned);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    }, [onChange]);

    // Handle slider gestures
    const updateValueFromSlider = useCallback((position: number) => {
        const percentage = Math.max(0, Math.min(position / SLIDER_WIDTH, 1));
        const newValue = minVal + percentage * (maxVal - minVal);
        const roundedValue = Math.round(newValue);
        onChange(roundedValue);
        Haptics.selectionAsync();
    }, [minVal, maxVal, onChange]);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            sliderScale.value = withSpring(1.2);
        })
        .onUpdate((event) => {
            const newPosition = Math.max(0, Math.min(event.x, SLIDER_WIDTH));
            sliderPosition.value = newPosition;
            runOnJS(updateValueFromSlider)(newPosition);
        })
        .onEnd(() => {
            sliderScale.value = withSpring(1);
        });

    const animatedSliderStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: sliderPosition.value },
            { scale: sliderScale.value },
        ],
    }));

    const animatedTrackStyle = useAnimatedStyle(() => ({
        width: sliderPosition.value,
    }));

    // Display value with nice formatting
    const displayValue = value !== null ? value.toString() : '';

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                {/* Label */}
                <Text style={styles.label}>{label}</Text>

                {/* Unit Toggle */}
                <View style={styles.unitToggle}>
                    <Pressable
                        style={[styles.unitButton, unit === 'kg' && styles.unitButtonActive]}
                        onPress={() => handleUnitToggle('kg')}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: unit === 'kg' }}
                        accessibilityLabel="كيلوجرام"
                    >
                        {unit === 'kg' ? (
                            <LinearGradient colors={gradients.primary} style={styles.unitButtonGradient}>
                                <Text style={[styles.unitText, styles.unitTextActive]}>كجم</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.unitText}>كجم</Text>
                        )}
                    </Pressable>
                    <Pressable
                        style={[styles.unitButton, unit === 'lb' && styles.unitButtonActive]}
                        onPress={() => handleUnitToggle('lb')}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: unit === 'lb' }}
                        accessibilityLabel="رطل"
                    >
                        {unit === 'lb' ? (
                            <LinearGradient colors={gradients.primary} style={styles.unitButtonGradient}>
                                <Text style={[styles.unitText, styles.unitTextActive]}>رطل</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.unitText}>رطل</Text>
                        )}
                    </Pressable>
                </View>

            </View>

            {/* Large Display Value */}
            <View style={styles.displayContainer}>
                <Text style={styles.displayValue}>{displayValue || '--'}</Text>
                <Text style={styles.displayUnit}>{unit === 'kg' ? 'كجم' : 'رطل'}</Text>
            </View>

            {/* Input */}
            <View style={[styles.inputContainer, error && styles.inputContainerError]}>
                <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    keyboardType="numeric"
                    placeholder={unit === 'kg' ? '70' : '154'}
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel={`الوزن بـ ${unit === 'kg' ? 'الكيلوجرام' : 'الرطل'}`}
                />
                <Text style={styles.unitLabel}>{unit === 'kg' ? 'كجم' : 'رطل'}</Text>
            </View>

            {/* Slider */}
            <GestureHandlerRootView style={styles.sliderContainer}>
                <GestureDetector gesture={panGesture}>
                    <View style={styles.sliderTrackContainer}>
                        <View style={styles.sliderTrack}>
                            <Animated.View style={[styles.sliderTrackFill, animatedTrackStyle]} />
                        </View>
                        <Animated.View style={[styles.sliderThumb, animatedSliderStyle]}>
                            <LinearGradient
                                colors={gradients.primary}
                                style={styles.sliderThumbGradient}
                            >
                                <Ionicons name="scale" size={horizontalScale(12)} color={colors.white} />
                            </LinearGradient>
                        </Animated.View>
                    </View>
                </GestureDetector>
                <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>{maxVal}</Text>
                    <Text style={styles.sliderLabel}>{minVal}</Text>
                </View>
            </GestureHandlerRootView>

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
    field: {
        flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between'
    },

    label: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(12),
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(30),
        marginBottom: verticalScale(16),
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    },
    unitButton: {
        borderRadius: horizontalScale(6),
    },
    unitButtonActive: {
        overflow: 'hidden',
    },
    unitButtonGradient: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(20),
        borderRadius: horizontalScale(30),
    },
    unitText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    unitTextActive: {
        color: colors.white,
    },
    displayContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    displayValue: {
        fontSize: ScaleFontSize(48),
        fontWeight: '700',
        color: colors.primaryDark,
    },
    displayUnit: {
        fontSize: ScaleFontSize(16),
        color: colors.textSecondary,
        marginTop: verticalScale(-4),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(56),
        marginBottom: verticalScale(16),
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        fontSize: ScaleFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    unitLabel: {
        fontSize: ScaleFontSize(16),
        color: colors.textSecondary,
        marginLeft: horizontalScale(8),
    },
    sliderContainer: {
        width: SLIDER_WIDTH + horizontalScale(20),
        alignSelf: 'center',
        paddingHorizontal: horizontalScale(10),
    },
    sliderTrackContainer: {
        height: verticalScale(40),
        justifyContent: 'center',
        transform: [{ scaleX: -1 }],
    },
    sliderTrack: {
        height: verticalScale(6),
        backgroundColor: colors.bgSecondary,
        borderRadius: verticalScale(3),
        overflow: 'hidden',
    },
    sliderTrackFill: {
        height: '100%',
        backgroundColor: colors.primaryDark,
        borderRadius: verticalScale(3),
    },
    sliderThumb: {
        position: 'absolute',
        width: horizontalScale(28),
        height: horizontalScale(28),
        borderRadius: horizontalScale(14),
        marginLeft: -horizontalScale(14),
        top: verticalScale(6),
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sliderThumbGradient: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(4),
    },
    sliderLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
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
