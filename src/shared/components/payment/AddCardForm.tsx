/**
 * AddCardForm Component
 * @description Complete new card form with all inputs
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    FadeIn,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { NewCardForm, CardValidationErrors } from '@/src/shared/types/payment';
import { formatCVV } from '@/src/shared/utils/cardUtils';
import CardInput from './CardInput';
import ExpiryInput from './ExpiryInput';

interface AddCardFormProps {
    /** Form data */
    form: NewCardForm;
    /** Form errors */
    errors: CardValidationErrors;
    /** Update form field */
    onUpdateField: <K extends keyof NewCardForm>(field: K, value: NewCardForm[K]) => void;
}

/**
 * CVV Input component
 */
const CVVInput = memo(function CVVInput({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);
    const [showCVV, setShowCVV] = useState(false);

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
            onChange(formatCVV(text));
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
        <View style={styles.cvvContainer}>
            <Text style={styles.label}>رمز الأمان (CVV)</Text>

            <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
                <Ionicons
                    name="lock-closed-outline"
                    size={horizontalScale(18)}
                    color={isFocused ? colors.primaryDark : colors.textSecondary}
                />
                <TextInput
                    style={styles.cvvInput}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="•••"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showCVV}
                    accessibilityLabel="رمز الأمان"
                />
                <Pressable
                    onPress={() => setShowCVV(!showCVV)}
                    accessibilityRole="button"
                    accessibilityLabel={showCVV ? 'إخفاء رمز الأمان' : 'إظهار رمز الأمان'}
                >
                    <Ionicons
                        name={showCVV ? 'eye-off-outline' : 'eye-outline'}
                        size={horizontalScale(18)}
                        color={colors.textSecondary}
                    />
                </Pressable>
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
});

/**
 * Name Input component
 */
const NameInput = memo(function NameInput({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
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

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? colors.error
            : focusAnim.value === 1
                ? colors.primaryDark
                : colors.border,
        borderWidth: focusAnim.value === 1 || error ? 2 : 1,
    }));

    return (
        <View style={styles.nameContainer}>
            <Text style={styles.label}>اسم حامل البطاقة</Text>

            <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
                <Ionicons
                    name="person-outline"
                    size={horizontalScale(18)}
                    color={isFocused ? colors.primaryDark : colors.textSecondary}
                />
                <TextInput
                    style={styles.nameInput}
                    value={value}
                    onChangeText={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="الاسم كما هو على البطاقة"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                    accessibilityLabel="اسم حامل البطاقة"
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
});

/**
 * AddCardForm - Complete new card form
 */
function AddCardForm({ form, errors, onUpdateField }: AddCardFormProps) {
    return (
        <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
            {/* Card Number */}
            <CardInput
                value={form.number}
                onChange={(value) => onUpdateField('number', value)}
                error={errors.number}
            />

            {/* Holder Name */}
            <NameInput
                value={form.holderName}
                onChange={(value) => onUpdateField('holderName', value)}
                error={errors.holderName}
            />

            {/* Expiry and CVV row */}
            <View style={styles.row}>
                <ExpiryInput
                    value={form.expiry}
                    onChange={(value) => onUpdateField('expiry', value)}
                    error={errors.expiry}
                />
                <CVVInput
                    value={form.cvv}
                    onChange={(value) => onUpdateField('cvv', value)}
                    error={errors.cvv}
                />
            </View>

            {/* Save card toggle */}
            <View style={styles.saveCardRow}>
                <View style={styles.saveCardInfo}>
                    <Ionicons
                        name="bookmark-outline"
                        size={horizontalScale(18)}
                        color={colors.textSecondary}
                    />
                    <Text style={styles.saveCardText}>حفظ البطاقة للدفعات المستقبلية</Text>
                </View>
                <Switch
                    value={form.saveCard}
                    onValueChange={(value) => onUpdateField('saveCard', value)}
                    trackColor={{ false: colors.border, true: colors.primaryDark }}
                    thumbColor={colors.white}
                    accessibilityLabel="حفظ البطاقة"
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: verticalScale(8),
    },
    row: {
        flexDirection: 'row',
        gap: horizontalScale(12),
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
    cvvContainer: {
        flex: 1,
        marginBottom: verticalScale(16),
    },
    cvvInput: {
        flex: 1,
        height: verticalScale(52),
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        textAlign: 'center',
    },
    nameContainer: {
        marginBottom: verticalScale(16),
    },
    nameInput: {
        flex: 1,
        height: verticalScale(52),
        fontSize: ScaleFontSize(15),
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
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
    saveCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(14),
        marginTop: verticalScale(8),
    },
    saveCardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(10),
    },
    saveCardText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
});

export default memo(AddCardForm);
