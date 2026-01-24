/**
 * MealsHeader Component
 * @description Enhanced header with gradient, animations, and floating buttons
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { MealsHeaderProps } from '@/src/shared/types/meals';
import { hapticLight, springConfigs } from '@/src/shared/utils/animations/presets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * FloatingButton - Animated icon button with scale feedback
 */
interface FloatingButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
    delay?: number;
}

const FloatingButton = memo(({ icon, onPress, accessibilityLabel, delay = 0 }: FloatingButtonProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.9, springConfigs.stiff);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, springConfigs.bouncy);
    };

    const handlePress = async () => {
        await hapticLight();
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)}>
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                style={[styles.floatingButton, animatedStyle]}
            >
                <Ionicons
                    name={icon}
                    size={horizontalScale(22)}
                    color={colors.white}
                />
            </AnimatedPressable>
        </Animated.View>
    );
});

/**
 * MealsHeader - Enhanced header with gradient and animations
 */
function MealsHeader({
    title,
    onHelpPress,
    onReceiptPress,
}: MealsHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { paddingTop: insets.top + verticalScale(8) }]}
        >
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.content}>
                {/* Left Button */}
                <FloatingButton
                    icon="help-circle-outline"
                    onPress={onHelpPress || (() => { })}
                    accessibilityLabel="مساعدة"
                    delay={100}
                />

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(50).springify().damping(18)}>
                    <Text style={styles.title}>{title}</Text>
                </Animated.View>

                {/* Right Button */}
                <FloatingButton
                    icon="receipt-outline"
                    onPress={onReceiptPress || (() => { })}
                    accessibilityLabel="سجل الوجبات"
                    delay={150}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        paddingHorizontal: horizontalScale(16),
        paddingBottom: verticalScale(20),
        position: 'relative',
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    floatingButton: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.light,
    },
    title: {
        fontSize: ScaleFontSize(22),
        fontWeight: '700',
        color: colors.white,
        textAlign: 'center',
        writingDirection: 'rtl',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    // Decorative elements
    decorativeCircle1: {
        position: 'absolute',
        top: -horizontalScale(60),
        right: -horizontalScale(30),
        width: horizontalScale(150),
        height: horizontalScale(150),
        borderRadius: horizontalScale(75),
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -horizontalScale(40),
        left: -horizontalScale(50),
        width: horizontalScale(120),
        height: horizontalScale(120),
        borderRadius: horizontalScale(60),
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});

export default memo(MealsHeader);
