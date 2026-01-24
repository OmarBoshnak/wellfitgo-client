/**
 * FormErrorSummary Component
 * @description Displays all form validation errors in a dismissible banner
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    FadeOutUp,
    Layout,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { ValidationErrors } from '@/src/shared/types/health';

interface FormErrorSummaryProps {
    /** Validation errors object */
    errors: ValidationErrors;
    /** Callback when dismiss button is pressed */
    onDismiss?: () => void;
    /** Callback when error item is pressed to scroll to field */
    onErrorPress?: (field: string) => void;
}

/**
 * FormErrorSummary - Shows all form errors in a banner
 */
export default function FormErrorSummary({
    errors,
    onDismiss,
    onErrorPress,
}: FormErrorSummaryProps) {
    // Filter out undefined errors
    const errorEntries = Object.entries(errors).filter(
        ([, message]) => message !== undefined
    );

    if (errorEntries.length === 0) {
        return null;
    }

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutUp.duration(200)}
            layout={Layout.springify()}
            style={styles.container}
            accessibilityRole="alert"
            accessibilityLabel={`يوجد ${errorEntries.length} أخطاء في النموذج`}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons
                        name="alert-circle"
                        size={horizontalScale(20)}
                        color={colors.error}
                    />
                    <Text style={styles.headerText}>
                        يرجى تصحيح الأخطاء التالية
                    </Text>
                </View>
                {onDismiss && (
                    <TouchableOpacity
                        onPress={onDismiss}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="إغلاق تنبيه الأخطاء"
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name="close"
                            size={horizontalScale(20)}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Error list */}
            <View style={styles.errorList}>
                {errorEntries.map(([field, message]) => (
                    <TouchableOpacity
                        key={field}
                        style={styles.errorItem}
                        onPress={() => onErrorPress?.(field)}
                        disabled={!onErrorPress}
                        accessibilityLabel={message}
                        accessibilityRole="button"
                        accessibilityHint="اضغط للانتقال إلى الحقل"
                    >
                        <View style={styles.bullet} />
                        <Text style={styles.errorText}>{message}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.error,
        padding: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    headerText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.error,
        writingDirection: 'rtl',
    },
    errorList: {
        gap: verticalScale(8),
    },
    errorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    bullet: {
        width: horizontalScale(6),
        height: horizontalScale(6),
        borderRadius: horizontalScale(3),
        backgroundColor: colors.error,
    },
    errorText: {
        fontSize: ScaleFontSize(13),
        color: colors.textPrimary,
        writingDirection: 'rtl',
        flex: 1,
    },
});
