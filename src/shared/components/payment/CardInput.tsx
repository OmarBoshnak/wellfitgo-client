/**
 * CardInput Component
 * @description Formatted credit card number input with type detection
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
import { CardType } from '@/src/shared/types/payment';
import { formatCardNumber, detectCardType, getCardBrandInfo } from '@/src/shared/utils/cardUtils';

interface CardInputProps {
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
 * CardInput - Credit card number input with formatting
 */
function CardInput({
    value,
    onChange,
    error,
    label = 'رقم البطاقة',
    placeholder = '0000 0000 0000 0000',
}: CardInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const cardType = detectCardType(value);
    const brandInfo = getCardBrandInfo(cardType);

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
            const formatted = formatCardNumber(text);
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

            <Animated.View
                style={[styles.inputContainer, animatedBorderStyle]}
            >
                {/* Card type icon */}
                <View
                    style={[
                        styles.cardTypeIcon,
                        { backgroundColor: cardType !== 'unknown' ? brandInfo.color + '15' : colors.bgSecondary },
                    ]}
                >
                    <Ionicons
                        name="card"
                        size={horizontalScale(18)}
                        color={cardType !== 'unknown' ? brandInfo.color : colors.textSecondary}
                    />
                </View>

                {/* Input */}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={19} // 16 digits + 3 spaces
                    accessibilityLabel={label}
                />

                {/* Card type label */}
                {cardType !== 'unknown' && (
                    <Text style={[styles.cardTypeLabel, { color: brandInfo.color }]}>
                        {brandInfo.label}
                    </Text>
                )}
            </Animated.View>

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
        paddingHorizontal: horizontalScale(12),
        gap: horizontalScale(10),
    },
    cardTypeIcon: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        height: verticalScale(52),
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        letterSpacing: 2,
    },
    cardTypeLabel: {
        fontSize: ScaleFontSize(12),
        fontWeight: '600',
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

export default memo(CardInput);
