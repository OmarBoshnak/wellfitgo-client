/**
 * HeightSelector Component
 * @description Height input with unit toggle (cm/ft) and slider
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { HeightUnit } from '@/src/shared/types/health';
import { convertHeight } from '@/src/shared/utils/validation';
import { LinearGradient } from 'expo-linear-gradient';

interface HeightSelectorProps {
    /** Current height value */
    value: number | null;
    /** Current unit */
    unit: HeightUnit;
    /** Callback when height changes */
    onChange: (height: number) => void;
    /** Callback when unit changes */
    onUnitChange: (unit: HeightUnit) => void;
    /** Error message to display */
    error?: string;
    /** Label text */
    label?: string;
}

// Height ranges
const HEIGHT_MIN_CM = 100;
const HEIGHT_MAX_CM = 250;
const HEIGHT_MIN_FT = 3.3;
const HEIGHT_MAX_FT = 8.2;
const SLIDER_WIDTH = 280;

/**
 * HeightSelector - Height input with unit toggle and visual slider
 */
export default function HeightSelector({
    value,
    unit,
    onChange,
    onUnitChange,
    error,
    label = 'الطول',
}: HeightSelectorProps) {
    const [inputValue, setInputValue] = useState(value?.toString() || '');

    // Slider animation values
    const sliderPosition = useSharedValue(0);
    const sliderScale = useSharedValue(1);

    // Get min/max based on unit
    const minVal = unit === 'cm' ? HEIGHT_MIN_CM : HEIGHT_MIN_FT;
    const maxVal = unit === 'cm' ? HEIGHT_MAX_CM : HEIGHT_MAX_FT;

    // Update input when value or unit changes
    useEffect(() => {
        if (value !== null) {
            setInputValue(value.toString());
            // Update slider position
            const percentage = (value - minVal) / (maxVal - minVal);
            sliderPosition.value = withSpring(percentage * SLIDER_WIDTH);
        }
    }, [value, unit, minVal, maxVal, sliderPosition]);

    // Handle unit toggle
    const handleUnitToggle = useCallback((newUnit: HeightUnit) => {
        if (newUnit !== unit) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Convert value to new unit
            if (value !== null) {
                const converted = convertHeight(value, unit, newUnit);
                onChange(converted);
            }
            onUnitChange(newUnit);
        }
    }, [unit, value, onChange, onUnitChange]);

    // Handle text input change
    const handleInputChange = useCallback((text: string) => {
        // Allow decimal for feet
        const cleaned = unit === 'ft'
            ? text.replace(/[^0-9.]/g, '')
            : text.replace(/[^0-9]/g, '');
        setInputValue(cleaned);

        const numValue = parseFloat(cleaned);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    }, [unit, onChange]);

    // Handle slider gestures
    const updateValueFromSlider = useCallback((position: number) => {
        const percentage = Math.max(0, Math.min(position / SLIDER_WIDTH, 1));
        const newValue = minVal + percentage * (maxVal - minVal);
        const roundedValue = unit === 'ft'
            ? Math.round(newValue * 10) / 10
            : Math.round(newValue);
        onChange(roundedValue);
        Haptics.selectionAsync();
    }, [minVal, maxVal, unit, onChange]);

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

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                {/* Label */}
                <Text style={styles.label}>{label}</Text>

                {/* Unit Toggle */}
                <View style={styles.unitToggle}>
                    <Pressable
                        style={[styles.unitButton, unit === 'cm' && styles.unitButtonActive]}
                        onPress={() => handleUnitToggle('cm')}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: unit === 'cm' }}
                        accessibilityLabel="سنتيمتر"
                    >
                        {unit === 'cm' ? (
                            <LinearGradient colors={gradients.primary} style={styles.unitButtonGradient}>
                                <Text style={[styles.unitText, styles.unitTextActive]}>سم</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.unitText}>سم</Text>
                        )}
                    </Pressable>
                    <Pressable
                        style={[styles.unitButton, unit === 'ft' && styles.unitButtonActive]}
                        onPress={() => handleUnitToggle('ft')}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: unit === 'ft' }}
                        accessibilityLabel="قدم"
                    >
                        {unit === 'ft' ? (
                            <LinearGradient colors={gradients.primary} style={styles.unitButtonGradient}>
                                <Text style={[styles.unitText, styles.unitTextActive]}>قدم</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={styles.unitText}>قدم</Text>
                        )}
                    </Pressable>
                </View>

            </View>

            {/* Input */}
            <View style={[styles.inputContainer, error && styles.inputContainerError]}>
                                <Text style={styles.unitLabel}>{unit === 'cm' ? 'سم' : 'قدم'}</Text>
                <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    keyboardType="decimal-pad"
                    placeholder={unit === 'cm' ? '170' : '5.6'}
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel={`الطول بـ ${unit === 'cm' ? 'السنتيمتر' : 'القدم'}`}
                />
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
                            />
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
        borderRadius: horizontalScale(30),
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
    inputContainer: {
        flexDirection: 'row-reverse',
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
        width: horizontalScale(24),
        height: horizontalScale(24),
        borderRadius: horizontalScale(12),
        marginLeft: -horizontalScale(12),
        top: verticalScale(8),
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sliderThumbGradient: {
        width: '100%',
        height: '100%',
        borderRadius: horizontalScale(12),
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
