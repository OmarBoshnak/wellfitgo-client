/**
 * QuickActions Component
 * @description Water tracker and plan progress quick actions
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { WaterIntake, PlanProgress } from '@/src/shared/types/home';

interface QuickActionsProps {
    /** Water intake data */
    waterIntake: WaterIntake;
    /** Plan progress data */
    planProgress: PlanProgress;
    /** Add water handler */
    onAddWater: () => void;
    /** Remove water handler */
    onRemoveWater: () => void;
    /** View plan handler */
    onViewPlan: () => void;
}

/**
 * QuickActions - Water and plan quick actions
 */
function QuickActions({
    waterIntake,
    planProgress,
    onAddWater,
    onRemoveWater,
    onViewPlan,
}: QuickActionsProps) {
    const addScale = useSharedValue(1);
    const removeScale = useSharedValue(1);
    const planScale = useSharedValue(1);

    // Water calculations
    const waterProgress = Math.min((waterIntake.current / waterIntake.target) * 100, 100);
    const glassesConsumed = Math.floor(waterIntake.current / waterIntake.glassSize);
    const targetGlasses = Math.ceil(waterIntake.target / waterIntake.glassSize);
    const waterLiters = (waterIntake.current / 1000).toFixed(1);
    const targetLiters = (waterIntake.target / 1000).toFixed(1);

    // Plan calculations
    const planProgressPercent = Math.round((planProgress.completedDays / planProgress.totalDays) * 100);

    const handleAddWater = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAddWater();
    }, [onAddWater]);

    const handleRemoveWater = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRemoveWater();
    }, [onRemoveWater]);

    const handleViewPlan = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onViewPlan();
    }, [onViewPlan]);

    const animatedAddStyle = useAnimatedStyle(() => ({
        transform: [{ scale: addScale.value }],
    }));

    const animatedRemoveStyle = useAnimatedStyle(() => ({
        transform: [{ scale: removeScale.value }],
    }));

    const animatedPlanStyle = useAnimatedStyle(() => ({
        transform: [{ scale: planScale.value }],
    }));

    return (
        <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.container}
        >
            {/* Water Tracker Card */}
            <View style={styles.waterCard}>
                <View style={styles.waterHeader}>
                    <View style={styles.waterIconContainer}>
                        <Ionicons
                            name="water"
                            size={horizontalScale(24)}
                            color={colors.primaryLight}
                        />
                    </View>
                    <View style={styles.waterInfo}>
                        <Text style={styles.waterTitle}>شرب الماء</Text>
                        <Text style={styles.waterSubtitle}>
                            {waterLiters} / {targetLiters} لتر
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.waterProgressContainer}>
                    <View style={styles.waterProgressBar}>
                        <LinearGradient
                            colors={[colors.primaryLight, colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.waterProgressFill, { width: `${waterProgress}%` }]}
                        />
                    </View>
                    <Text style={styles.glassesText}>
                        {targetGlasses}/{glassesConsumed} كوب
                    </Text>
                </View>

                {/* Water Controls */}
                <View style={styles.waterControls}>
                    <Pressable
                        onPress={handleAddWater}
                        onPressIn={() => { addScale.value = withSpring(0.9); }}
                        onPressOut={() => { addScale.value = withSpring(1); }}
                        accessibilityRole="button"
                        accessibilityLabel="إضافة كوب ماء"
                        style={styles.waterButton}
                    >
                        <Animated.View style={animatedAddStyle}>
                            <LinearGradient
                                colors={gradients.primary}
                                style={[styles.waterButtonInner, styles.addButton]}
                            >
                                <Ionicons
                                    name="add"
                                    size={horizontalScale(24)}
                                    color={colors.white}
                                />
                            </LinearGradient>
                        </Animated.View>
                    </Pressable>
                    <View style={styles.waterAmount}>
                        <Text style={styles.waterAmountValue}>{glassesConsumed}</Text>
                        <Text style={styles.waterAmountLabel}>كوب</Text>
                    </View>
                    <Pressable
                        onPress={handleRemoveWater}
                        onPressIn={() => { removeScale.value = withSpring(0.9); }}
                        onPressOut={() => { removeScale.value = withSpring(1); }}
                        disabled={waterIntake.current <= 0}
                        accessibilityRole="button"
                        accessibilityLabel="إزالة كوب ماء"
                        style={styles.waterButton}
                    >
                        <Animated.View style={[
                            styles.waterButtonInner,
                            styles.removeButton,
                            waterIntake.current <= 0 && styles.buttonDisabled,
                            animatedRemoveStyle,
                        ]}>
                            <Ionicons
                                name="remove"
                                size={horizontalScale(24)}
                                color={waterIntake.current <= 0 ? colors.textSecondary : colors.textPrimary}
                            />
                        </Animated.View>
                    </Pressable>

                </View>
            </View>

            <Pressable
                onPress={handleViewPlan}
                onPressIn={() => { planScale.value = withSpring(0.98); }}
                onPressOut={() => { planScale.value = withSpring(1); }}
                accessibilityRole="button"
                accessibilityLabel={`تقدم الخطة، اليوم ${planProgress.currentDay} من ${planProgress.totalDays}`}
            >
                <Animated.View style={[styles.planCard, animatedPlanStyle]}>
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.planGradient}
                    >
                        <View style={styles.planContent}>
                            <View style={styles.planInfo}>
                                <Text style={styles.planTitle}>خطتك الغذائية</Text>
                                <Text style={styles.planDay}>
                                    اليوم {planProgress.currentDay} من {planProgress.totalDays}
                                </Text>
                            </View>
                            <View style={styles.planProgressCircle}>
                                <Text style={styles.planProgressText}>{planProgressPercent}%</Text>
                            </View>
                        </View>
                        <View style={styles.planProgressBar}>
                            <View style={[styles.planProgressFill, { width: `${planProgressPercent}%` }]} />
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
        gap: verticalScale(12),
    },
    waterCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        ...shadows.light,
    },
    waterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    waterIconContainer: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(22),
        backgroundColor: 'rgba(2, 195, 205, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: horizontalScale(12),
    },
    waterInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    waterTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    waterSubtitle: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    waterProgressContainer: {
        marginBottom: verticalScale(16),
    },
    waterProgressBar: {
        height: verticalScale(8),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(4),
        overflow: 'hidden',
        marginBottom: verticalScale(4),
        transform: [{ scaleX: -1 }]
    },
    waterProgressFill: {
        height: '100%',
        borderRadius: horizontalScale(4),
    },
    glassesText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        textAlign: 'right',
    },
    waterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(20),
    },
    waterButton: {
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
    },
    waterButtonInner: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {},
    removeButton: {
        backgroundColor: colors.bgSecondary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    waterAmount: {
        alignItems: 'center',
        minWidth: horizontalScale(60),
    },
    waterAmountValue: {
        fontSize: ScaleFontSize(28),
        fontWeight: '800',
        color: colors.textPrimary,
    },
    waterAmountLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
    },
    planCard: {
        borderRadius: horizontalScale(20),
        overflow: 'hidden',
        ...shadows.medium,
    },
    planGradient: {
        padding: horizontalScale(16),
    },
    planContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    planInfo: {
        flex: 1,
        alignItems: 'flex-end',
        marginHorizontal: horizontalScale(15)
    },
    planTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.white,
        writingDirection: 'rtl',
    },
    planDay: {
        fontSize: ScaleFontSize(13),
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: verticalScale(2),
    },
    planProgressCircle: {
        width: horizontalScale(50),
        height: horizontalScale(50),
        borderRadius: horizontalScale(25),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planProgressText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '700',
        color: colors.white,
    },
    planProgressBar: {
        height: verticalScale(6),
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: horizontalScale(3),
        overflow: 'hidden',
        transform: [{ scaleX: -1 }]
    },
    planProgressFill: {
        height: '100%',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(3),
    },
});

export default memo(QuickActions);
