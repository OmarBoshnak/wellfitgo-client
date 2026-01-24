/**
 * DailyMealCard Component
 * @description Enhanced meal card with swipe gesture and animated checkbox
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { DailyMealCardProps } from '@/src/shared/types/meals';
import { formatMealTime } from '@/src/shared/utils/dateTime/mealDateFormatting';
import { hapticSuccess, hapticLight, springConfigs } from '@/src/shared/utils/animations/presets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

/**
 * DailyMealCard - Enhanced with swipe and animated checkbox
 */
function DailyMealCard({
    meal,
    onToggle,
    onOptionsPress,
}: DailyMealCardProps) {
    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);
    const checkScale = useSharedValue(meal.completed ? 1 : 0);
    const checkRotate = useSharedValue(meal.completed ? 0 : -45);

    // Handle toggle with animation
    const handleToggle = useCallback(async () => {
        if (!meal.completed) {
            await hapticSuccess();
            checkScale.value = withSequence(
                withSpring(1.2, springConfigs.bouncy),
                withSpring(1, springConfigs.smooth)
            );
            checkRotate.value = withSpring(0, springConfigs.bouncy);
        } else {
            await hapticLight();
            checkScale.value = withTiming(0, { duration: 200 });
            checkRotate.value = withTiming(-45, { duration: 200 });
        }
        onToggle();
    }, [meal.completed, onToggle, checkScale, checkRotate]);

    // Handle long press
    const handleLongPress = useCallback(async () => {
        await hapticLight();
        onOptionsPress?.();
    }, [onOptionsPress]);

    // Swipe gesture
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            // Only allow swipe to the left (RTL: swipe right)
            translateX.value = Math.min(0, Math.max(event.translationX, -SWIPE_THRESHOLD * 1.5));
        })
        .onEnd((event) => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                // Complete swipe action
                translateX.value = withSpring(-SWIPE_THRESHOLD, springConfigs.stiff);
                runOnJS(handleToggle)();
            }
            // Reset position
            translateX.value = withSpring(0, springConfigs.smooth);
        });

    // Press gesture for scale feedback
    const pressGesture = Gesture.Tap()
        .onStart(() => {
            cardScale.value = withSpring(0.98, springConfigs.stiff);
        })
        .onEnd(() => {
            cardScale.value = withSpring(1, springConfigs.bouncy);
            runOnJS(handleToggle)();
        });

    // Long press gesture
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            runOnJS(handleLongPress)();
        });

    // Combine gestures
    const combinedGesture = Gesture.Race(
        panGesture,
        Gesture.Exclusive(longPressGesture, pressGesture)
    );

    // Animated styles
    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    const checkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: checkScale.value },
            { rotate: `${checkRotate.value}deg` },
        ],
        opacity: interpolate(checkScale.value, [0, 0.5, 1], [0, 0.5, 1]),
    }));

    const swipeActionStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
            [0, 0.5, 1],
            Extrapolation.CLAMP
        ),
    }));

    return (
        <View style={styles.container}>
            {/* Swipe action indicator */}
            <Animated.View style={[styles.swipeAction, swipeActionStyle]}>
                <LinearGradient
                    colors={gradients.success}
                    style={styles.swipeActionGradient}
                >
                    <Ionicons
                        name="checkmark-circle"
                        size={horizontalScale(28)}
                        color={colors.white}
                    />
                </LinearGradient>
            </Animated.View>

            {/* Card */}
            <GestureDetector gesture={combinedGesture}>
                <Animated.View style={[styles.card, cardAnimatedStyle]}>
                    {/* Completion indicator bar */}
                    {meal.completed && (
                        <LinearGradient
                            colors={gradients.success}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.completionBar}
                        />
                    )}

                    {/* Emoji container */}
                    <View style={[
                        styles.emojiContainer,
                        meal.completed && styles.emojiContainerCompleted,
                    ]}>
                        <Text style={styles.emoji}>{meal.emoji || '🍽️'}</Text>

                        {/* Animated check badge */}
                        <Animated.View style={[styles.checkBadge, checkAnimatedStyle]}>
                            <LinearGradient
                                colors={gradients.success}
                                style={styles.checkBadgeGradient}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={horizontalScale(12)}
                                    color={colors.white}
                                />
                            </LinearGradient>
                        </Animated.View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[
                            styles.mealName,
                            meal.completed && styles.mealNameCompleted,
                        ]}>
                            {meal.nameAr || meal.name}
                        </Text>
                        {meal.time && (
                            <View style={styles.timeRow}>
                                <Ionicons
                                    name="time-outline"
                                    size={horizontalScale(12)}
                                    color={colors.textSecondary}
                                />
                                <Text style={styles.mealTime}>
                                    {formatMealTime(meal.time, true)}
                                </Text>
                            </View>
                        )}
                        {(meal.descriptionAr || meal.description) && (
                            <Text style={styles.description} numberOfLines={1}>
                                {meal.descriptionAr || meal.description}
                            </Text>
                        )}
                    </View>

                    {/* Status Icon */}
                    <View style={styles.statusContainer}>
                        <Ionicons
                            name={meal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                            size={horizontalScale(28)}
                            color={meal.completed ? colors.success : colors.gray}
                        />
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    swipeAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: horizontalScale(80),
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeActionGradient: {
        width: horizontalScale(56),
        height: horizontalScale(56),
        borderRadius: horizontalScale(28),
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(14),
        overflow: 'hidden',
        ...shadows.card,
    },
    completionBar: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: horizontalScale(4),
    },
    emojiContainer: {
        width: horizontalScale(56),
        height: horizontalScale(56),
        borderRadius: horizontalScale(28),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    emojiContainerCompleted: {
        backgroundColor: 'rgba(39, 174, 97, 0.1)',
    },
    emoji: {
        fontSize: ScaleFontSize(26),
    },
    checkBadge: {
        position: 'absolute',
        top: -horizontalScale(4),
        right: -horizontalScale(4),
        borderRadius: horizontalScale(10),
        overflow: 'hidden',
    },
    checkBadgeGradient: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    content: {
        flex: 1,
        marginRight: horizontalScale(14),
        marginLeft: horizontalScale(10),
    },
    mealName: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    mealNameCompleted: {
        color: colors.success,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(4),
        gap: horizontalScale(4),
    },
    mealTime: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
    },
    description: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        textAlign: 'right',
        marginTop: verticalScale(4),
    },
    statusContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(DailyMealCard);
