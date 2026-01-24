/**
 * WelcomeMessage Component
 * @description Title with gradient text and celebratory message
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface WelcomeMessageProps {
    /** Main title text */
    title?: string;
    /** Subtitle text */
    subtitle?: string;
    /** Animation delay in ms */
    delay?: number;
}

/**
 * WelcomeMessage - Title with gradient text effect
 */
function WelcomeMessage({
    title = 'تم الدفع بنجاح! 🎉',
    subtitle = 'مرحباً بك في رحلتك نحو حياة صحية أفضل',
    delay = 200,
}: WelcomeMessageProps) {
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600).springify()}
            style={styles.container}
        >
            {/* Gradient Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        marginVertical: verticalScale(16),
    },
    titleContainer: {
        marginBottom: verticalScale(8),
    },
    title: {
        fontSize: ScaleFontSize(26),
        fontWeight: '800',
        color: colors.primaryDark,
        textAlign: 'center',
        writingDirection: 'rtl',
    },
    subtitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '500',
        color: colors.textSecondary,
        textAlign: 'center',
        writingDirection: 'rtl',
        lineHeight: ScaleFontSize(24),
    },
});

export default memo(WelcomeMessage);
