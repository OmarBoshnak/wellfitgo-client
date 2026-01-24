import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { Slide } from '@/src/shared/core/constants/Slides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
    slide: Slide;
    index: number;
    scrollX: { value: number };
}

export default function OnboardingSlide({
    slide,
    index,
    scrollX,
}: OnboardingSlideProps) {
    const isActive = Math.round(scrollX.value / SCREEN_WIDTH) === index;

    return (
        <View style={[
            styles.container,
            isActive ? styles.containerActive : styles.containerInactive
        ]}>
            {/* Text content */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        opacity: 0.3,
    },
    containerActive: {
        opacity: 1,
    },
    containerInactive: {
        opacity: 0.3,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: ScaleFontSize(28),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: verticalScale(16),
        writingDirection: 'rtl',
        lineHeight: ScaleFontSize(38),
    },
    description: {
        fontSize: ScaleFontSize(16),
        color: colors.textSecondary,
        textAlign: 'center',
        writingDirection: 'rtl',
        lineHeight: ScaleFontSize(26),
        paddingHorizontal: horizontalScale(10),
    },
});
