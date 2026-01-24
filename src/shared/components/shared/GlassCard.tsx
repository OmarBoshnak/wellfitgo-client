/**
 * GlassCard Component
 * @description Glassmorphism card with blur effect
 */

import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale } from '@/src/shared/core/utils/scaling';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /** Blur intensity (0-100) */
    blurIntensity?: number;
    /** Show gradient border */
    showBorder?: boolean;
    /** Border gradient colors */
    borderColors?: readonly [string, string, ...string[]];
    /** Background opacity */
    backgroundOpacity?: number;
}

function GlassCard({
    children,
    style,
    blurIntensity = 80,
    showBorder = false,
    borderColors = ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)'] as const,
    backgroundOpacity = 0.9,
}: GlassCardProps) {
    // On Android, BlurView can be heavy, use semi-transparent background instead
    const isIOS = Platform.OS === 'ios';

    if (showBorder) {
        return (
            <LinearGradient
                colors={borderColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.borderGradient, style]}
            >
                <View style={styles.innerContainer}>
                    {isIOS ? (
                        <BlurView
                            intensity={blurIntensity}
                            tint="light"
                            style={styles.blurView}
                        >
                            <View style={[styles.content, { backgroundColor: `rgba(255,255,255,${backgroundOpacity})` }]}>
                                {children}
                            </View>
                        </BlurView>
                    ) : (
                        <View style={[styles.content, styles.androidFallback, { backgroundColor: `rgba(255,255,255,${backgroundOpacity})` }]}>
                            {children}
                        </View>
                    )}
                </View>
            </LinearGradient>
        );
    }

    if (isIOS) {
        return (
            <View style={[styles.container, style]}>
                <BlurView
                    intensity={blurIntensity}
                    tint="light"
                    style={styles.blurView}
                >
                    <View style={[styles.content, { backgroundColor: `rgba(255,255,255,${backgroundOpacity})` }]}>
                        {children}
                    </View>
                </BlurView>
            </View>
        );
    }

    // Android fallback - no blur, just semi-transparent background
    return (
        <View style={[styles.container, styles.androidFallback, style]}>
            <View style={[styles.content, { backgroundColor: `rgba(255,255,255,${backgroundOpacity})` }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: horizontalScale(20),
        overflow: 'hidden',
    },
    borderGradient: {
        borderRadius: horizontalScale(20),
        padding: 1,
    },
    innerContainer: {
        borderRadius: horizontalScale(19),
        overflow: 'hidden',
    },
    blurView: {
        borderRadius: horizontalScale(20),
        overflow: 'hidden',
    },
    content: {
        borderRadius: horizontalScale(20),
    },
    androidFallback: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
});

export default memo(GlassCard);
