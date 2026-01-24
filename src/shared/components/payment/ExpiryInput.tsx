/**
 * ExpiryInput Component
 * @description MM/YY formatted expiry date input
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { formatExpiry } from '@/src/shared/utils/cardUtils';

interface ExpiryInputProps {
    /** Current value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Error message */
    error?: string;
    /** Label text */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
}

/**
 * ExpiryInput - MM/YY formatted input
 */
function ExpiryInput({
    value,
    onChange,
    error,
    label = 'تاريخ الانتهاء',
    placeholder = 'MM/YY',
}: ExpiryInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 200 });
    }, [focusAnim]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: 200 });
    }, [focusAnim]);

    const handleChangeText = useCallback(
        (text: string) => {
            const formatted = formatExpiry(text);
            onChange(formatted);
        },
        [onChange]
    );

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? colors.error
            : focusAnim.value === 1
                ? colors.primaryDark
                : colors.border,
        borderWidth: focusAnim.value === 1 || error ? 2 : 1,
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
                <Ionicons
                    name="calendar-outline"
                    size={horizontalScale(18)}
                    color={isFocused ? colors.primaryDark : colors.textSecondary}
                />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={5} // MM/YY
                    accessibilityLabel={label}
                />
            </Animated.View>

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
        flex: 1,
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(8),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: horizontalScale(14),
        gap: horizontalScale(10),
    },
    input: {
        flex: 1,
        height: verticalScale(52),
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(6),
        gap: horizontalScale(6),
    },
    errorText: {
        fontSize: ScaleFontSize(12),
        color: colors.error,
        writingDirection: 'rtl',
    },
});

export default memo(ExpiryInput);
