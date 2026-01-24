/**
 * DayNavigator Component
 * @description Enhanced day navigation with spring animations
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { DayNavigatorProps } from '@/src/shared/types/meals';
import { parseISODateString, getWeekdayName } from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { getRelativeDayLabel } from '@/src/shared/utils/dateTime/mealDateFormatting';
import { hapticLight, springConfigs } from '@/src/shared/utils/animations/presets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * DayNavigator - Enhanced with spring animations
 */
function DayNavigator({
    currentDate,
    dayOffset,
    maxOffset = 6,
    minOffset = 0,
    onNavigate,
}: DayNavigatorProps) {
    const date = parseISODateString(currentDate);
    date.setDate(date.getDate() + dayOffset);

    const relativeLabel = getRelativeDayLabel(date, true);
    const dayName = getWeekdayName(date.getDay(), true);

    const canGoPrev = dayOffset > minOffset;
    const canGoNext = dayOffset < maxOffset;

    const handleNavigate = useCallback(async (direction: 'prev' | 'next') => {
        await hapticLight();
        onNavigate(direction);
    }, [onNavigate]);

    return (
        <Animated.View
            entering={FadeInUp.delay(200).springify().damping(18)}
            style={styles.container}
        >
            <View style={styles.navigator}>
                {/* Previous Button */}
                <NavButton
                    icon="chevron-forward"
                    onPress={() => handleNavigate('prev')}
                    disabled={!canGoPrev}
                    label="اليوم السابق"
                />

                {/* Day Display */}
                <Animated.View
                    key={dayOffset}
                    entering={FadeIn.duration(200)}
                    style={styles.dayDisplay}
                >
                    {relativeLabel ? (
                        <LinearGradient
                            colors={gradients.primary}
                            style={styles.relativeBadge}
                        >
                            <Text style={styles.relativeLabel}>{relativeLabel}</Text>
                        </LinearGradient>
                    ) : (
                        <Text style={styles.dayName}>{dayName}</Text>
                    )}
                    <Text style={styles.dateText}>
                        {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
                    </Text>
                </Animated.View>

                {/* Next Button */}
                <NavButton
                    icon="chevron-back"
                    onPress={() => handleNavigate('next')}
                    disabled={!canGoNext}
                    label="اليوم التالي"
                />
            </View>

            {/* Animated Progress Dots */}
            <View style={styles.dotsContainer}>
                {Array.from({ length: maxOffset - minOffset + 1 }, (_, i) => (
                    <Animated.View
                        key={i}
                        entering={FadeIn.delay(50 * i)}
                        style={[
                            styles.dot,
                            i === dayOffset && styles.dotActive,
                        ]}
                    >
                        {i === dayOffset && (
                            <LinearGradient
                                colors={gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.dotGradient}
                            />
                        )}
                    </Animated.View>
                ))}
            </View>
        </Animated.View>
    );
}

/**
 * Navigation Button
 */
interface NavButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    disabled: boolean;
    label: string;
}

const NavButton = memo(({ icon, onPress, disabled, label }: NavButtonProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withSpring(0.9, springConfigs.stiff);
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, springConfigs.bouncy);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={[styles.navButton, disabled && styles.navButtonDisabled, animatedStyle]}
        >
            <Ionicons
                name={icon}
                size={horizontalScale(24)}
                color={disabled ? colors.gray : colors.primaryDark}
            />
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginTop: verticalScale(16),
    },
    navigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(14),
        ...shadows.card,
    },
    navButton: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        backgroundColor: colors.bgSecondary,
    },
    dayDisplay: {
        alignItems: 'center',
    },
    relativeBadge: {
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(16),
    },
    relativeLabel: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.white,
        writingDirection: 'rtl',
    },
    dayName: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    dateText: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        marginTop: verticalScale(4),
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: verticalScale(14),
        gap: horizontalScale(8),
    },
    dot: {
        width: horizontalScale(8),
        height: horizontalScale(8),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.bgSecondary,
        overflow: 'hidden',
    },
    dotActive: {
        width: horizontalScale(28),
    },
    dotGradient: {
        flex: 1,
        borderRadius: horizontalScale(4),
    },
});

export default memo(DayNavigator);
