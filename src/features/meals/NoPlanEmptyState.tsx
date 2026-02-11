/**
 * NoPlanEmptyState
 * @description Shown when no diet plan has been assigned by the doctor
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

interface NoPlanEmptyStateProps {
    onContactDoctor?: () => void;
}

const NoPlanEmptyState: React.FC<NoPlanEmptyStateProps> = ({ onContactDoctor }) => {
    return (
        <Animated.View
            entering={FadeInUp.delay(200).springify().damping(18)}
            style={styles.container}
        >
            <Text style={styles.emoji}>🍽️</Text>
            <Text style={styles.title}>لم يتم تعيين خطة غذائية بعد</Text>
            <Text style={styles.subtitle}>
                سيقوم طبيبك بتعيين خطة غذائية مخصصة لك قريباً
            </Text>

            {onContactDoctor && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onContactDoctor}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>تواصل مع طبيبك</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(32),
        paddingVertical: verticalScale(60),
    },
    emoji: {
        fontSize: ScaleFontSize(56),
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: ScaleFontSize(22),
        marginBottom: verticalScale(24),
    },
    button: {
        backgroundColor: colors.primaryDark,
        paddingHorizontal: horizontalScale(24),
        paddingVertical: verticalScale(12),
        borderRadius: horizontalScale(12),
    },
    buttonText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default NoPlanEmptyState;
