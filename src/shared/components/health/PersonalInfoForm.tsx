/**
 * PersonalInfoForm Component
 * @description Form inputs for personal information (name, phone, age)
 */

import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { PersonalInfoData, ValidationErrors } from '@/src/shared/types/health';
import PhoneInput from '@/src/shared/components/auth/PhoneInput';

interface PersonalInfoFormProps {
    /** Current form data */
    data: Partial<PersonalInfoData>;
    /** Validation errors */
    errors: ValidationErrors;
    /** Callback when field value changes */
    onChange: (field: keyof PersonalInfoData, value: string | number) => void;
    /** Callback when field loses focus (for validation) */
    onBlur?: (field: keyof PersonalInfoData) => void;
}

interface FormInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad';
    maxLength?: number;
    inputRef?: React.RefObject<TextInput | null>;
    accessibilityLabel?: string;
}

/**
 * Animated text input with label and error display
 */
function FormInput({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    placeholder,
    keyboardType = 'default',
    maxLength,
    inputRef,
    accessibilityLabel,
}: FormInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const focused = useSharedValue(0);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        focused.value = withTiming(1, { duration: 200 });
        Haptics.selectionAsync();
    }, [focused]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        focused.value = withTiming(0, { duration: 200 });
        onBlur?.();
    }, [focused, onBlur]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            borderColor: error
                ? colors.error
                : interpolateColor(
                    focused.value,
                    [0, 1],
                    [colors.border, colors.primaryDark]
                ),
            borderWidth: withTiming(focused.value > 0.5 || error ? 2 : 1, { duration: 150 }),
        };
    });

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
                <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    accessibilityLabel={accessibilityLabel || label}
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

/**
 * PersonalInfoForm - First name, last name, phone, and age inputs
 */
export default function PersonalInfoForm({
    data,
    errors,
    onChange,
    onBlur,
}: PersonalInfoFormProps) {
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const ageRef = useRef<TextInput>(null);

    return (
        <View style={styles.container}>
            {/* First Name */}
            <FormInput
                label="الاسم الأول"
                value={data.firstName || ''}
                onChangeText={(text) => onChange('firstName', text)}
                onBlur={() => onBlur?.('firstName')}
                error={errors.firstName}
                placeholder="أدخل اسمك الأول"
                inputRef={firstNameRef}
                accessibilityLabel="الاسم الأول"
            />

            {/* Last Name */}
            <FormInput
                label="اسم العائلة"
                value={data.lastName || ''}
                onChangeText={(text) => onChange('lastName', text)}
                onBlur={() => onBlur?.('lastName')}
                error={errors.lastName}
                placeholder="أدخل اسم العائلة"
                inputRef={lastNameRef}
                accessibilityLabel="اسم العائلة"
            />

            {/* Phone Number */}
            <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>رقم الهاتف</Text>
                <PhoneInput
                    value={data.phoneNumber || ''}
                    onChangeText={(text) => onChange('phoneNumber', text)}
                    countryCode={data.countryCode || '+20'}
                    onCountryCodeChange={(code) => onChange('countryCode', code)}
                    error={errors.phoneNumber}
                />
            </View>

            {/* Age */}
            <FormInput
                label="العمر"
                value={data.age?.toString() || ''}
                onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    const numValue = cleaned ? parseInt(cleaned, 10) : 0;
                    onChange('age', numValue);
                }}
                onBlur={() => onBlur?.('age')}
                error={errors.age}
                placeholder="أدخل عمرك"
                keyboardType="numeric"
                maxLength={2}
                inputRef={ageRef}
                accessibilityLabel="العمر"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: verticalScale(16),
    },
    inputWrapper: {
        width: '100%',
    },
    inputLabel: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: verticalScale(8),
        textAlign: 'right'
    },
    inputContainer: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(56),
        justifyContent: 'center',
    },
    textInput: {
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
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
});
