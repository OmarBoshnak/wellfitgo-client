/**
 * FreeCallBanner Component
 * @description Promotional banner for first free consultation
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface FreeCallBannerProps {
    /** Whether the banner is visible */
    visible?: boolean;
    /** Main text */
    text?: string;
    /** Secondary text */
    subtext?: string;
}

/**
 * FreeCallBanner - Promotional banner with gradient background
 */
function FreeCallBanner({
    visible = true,
    text = 'أول استشارة مجانية!',
    subtext = 'ابدأ الآن واحصل على استشارتك الأولى مجاناً',
}: FreeCallBannerProps) {
    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(80, 115, 254, 0.08)', 'rgba(2, 195, 205, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={gradients.primary}
                        style={styles.iconGradient}
                    >
                        <Ionicons
                            name="call"
                            size={horizontalScale(20)}
                            color={colors.white}
                        />
                    </LinearGradient>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.mainText}>{text}</Text>
                    <Text style={styles.subText}>{subtext}</Text>
                </View>

                {/* Decorative sparkle */}
                <View style={styles.sparkle}>
                    <Ionicons
                        name="sparkles"
                        size={horizontalScale(18)}
                        color={colors.primaryDark}
                    />
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: horizontalScale(20),
        marginBottom: verticalScale(20),
        borderRadius: horizontalScale(16),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(80, 115, 254, 0.15)',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: horizontalScale(16),
        gap: horizontalScale(12),
    },
    iconContainer: {
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
    },
    iconGradient: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    mainText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.primaryDark,
        writingDirection: 'rtl',
        marginBottom: verticalScale(2),
    },
    subText: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        lineHeight: ScaleFontSize(18),
    },
    sparkle: {
        position: 'absolute',
        top: horizontalScale(8),
        left: horizontalScale(8),
        opacity: 0.6,
    },
});

export default memo(FreeCallBanner);
