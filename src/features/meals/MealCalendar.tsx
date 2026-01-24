/**
 * MealCalendar Component
 * @description Enhanced calendar with smooth transitions and animated days
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    Layout,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { MealCalendarProps, MealCalendarDay } from '@/src/shared/types/meals';
import {
    getWeekdayHeaders,
    groupDaysIntoWeeks,
    generateMonthDays,
} from '@/src/shared/utils/dateTime/mealCalendarHelpers';
import { formatCalendarHeader } from '@/src/shared/utils/dateTime/mealDateFormatting';
import { hapticLight, hapticSelection, springConfigs, staggeredFadeInUp } from '@/src/shared/utils/animations/presets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * CalendarDay - Individual day cell with animations
 */
interface CalendarDayCellProps {
    day: MealCalendarDay;
    isSelected: boolean;
    onPress: () => void;
    index: number;
}

const CalendarDayCell = memo(({ day, isSelected, onPress, index }: CalendarDayCellProps) => {
    const scale = useSharedValue(1);
    const hasCompletion = day.status && day.status.completed > 0;
    const isAllComplete = day.status && day.status.completed === day.status.total && day.status.total > 0;

    const handlePressIn = () => {
        scale.value = withSpring(0.9, springConfigs.stiff);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, springConfigs.bouncy);
    };

    const handlePress = async () => {
        if (day.isCurrentMonth) {
            await hapticSelection();
            onPress();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!day.isCurrentMonth}
            accessibilityRole="button"
            accessibilityLabel={`${day.dayNumber} ${day.isToday ? 'اليوم' : ''}`}
            style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOtherMonth,
                animatedStyle,
            ]}
        >
            {isSelected ? (
                <LinearGradient
                    colors={gradients.primary}
                    style={styles.selectedDayGradient}
                >
                    <Text style={[styles.dayText, styles.dayTextSelected]}>
                        {day.dayNumber}
                    </Text>
                </LinearGradient>
            ) : (
                <View style={[
                    styles.dayContent,
                    day.isToday && styles.dayContentToday,
                ]}>
                    <Text style={[
                        styles.dayText,
                        !day.isCurrentMonth && styles.dayTextOtherMonth,
                        day.isToday && styles.dayTextToday,
                    ]}>
                        {day.dayNumber}
                    </Text>
                </View>
            )}

            {/* Completion indicator */}
            {day.isCurrentMonth && hasCompletion && (
                <View
                    style={[
                        styles.completionDot,
                        isAllComplete ? styles.completionDotFull : styles.completionDotPartial,
                    ]}
                />
            )}
        </AnimatedPressable>
    );
});

/**
 * MealCalendar - Enhanced monthly calendar
 */
function MealCalendar({
    currentMonth,
    currentYear,
    selectedDate,
    mealHistory,
    onMonthChange,
    onDaySelect,
}: MealCalendarProps) {
    const weekdayHeaders = useMemo(() => getWeekdayHeaders(true), []);
    const calendarDays = useMemo(
        () => generateMonthDays(currentMonth, currentYear, mealHistory),
        [currentMonth, currentYear, mealHistory]
    );
    const weeks = useMemo(() => groupDaysIntoWeeks(calendarDays), [calendarDays]);
    const headerText = useMemo(
        () => formatCalendarHeader(currentMonth, currentYear, true),
        [currentMonth, currentYear]
    );

    const handlePrevMonth = useCallback(async () => {
        await hapticLight();
        const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        onMonthChange(newMonth, newYear);
    }, [currentMonth, currentYear, onMonthChange]);

    const handleNextMonth = useCallback(async () => {
        await hapticLight();
        const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        onMonthChange(newMonth, newYear);
    }, [currentMonth, currentYear, onMonthChange]);

    return (
        <Animated.View
            entering={FadeInUp.delay(200).springify().damping(18)}
            style={styles.container}
        >
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <NavButton
                        icon="chevron-back"
                        onPress={handleNextMonth}
                        label="الشهر التالي"
                    />
                    <Animated.Text
                        key={headerText}
                        entering={FadeIn.duration(200)}
                        style={styles.headerText}
                    >
                        {headerText}
                    </Animated.Text>
                    <NavButton
                        icon="chevron-forward"
                        onPress={handlePrevMonth}
                        label="الشهر السابق"
                    />
                </View>

                {/* Weekday Headers */}
                <View style={styles.weekdayRow}>
                    {weekdayHeaders.map((dayName, index) => (
                        <View key={index} style={styles.weekdayCell}>
                            <Text style={styles.weekdayText}>{dayName}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar Grid */}
                <Animated.View
                    layout={Layout.springify().damping(20)}
                    style={styles.calendarGrid}
                >
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.weekRow}>
                            {week.map((day, dayIndex) => (
                                <CalendarDayCell
                                    key={`${day.dateString}-${dayIndex}`}
                                    day={day}
                                    isSelected={day.dateString === selectedDate}
                                    onPress={() => onDaySelect(day.dateString)}
                                    index={weekIndex * 7 + dayIndex}
                                />
                            ))}
                        </View>
                    ))}
                </Animated.View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.completionDotFull]} />
                        <Text style={styles.legendText}>مكتمل</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.completionDotPartial]} />
                        <Text style={styles.legendText}>جزئي</Text>
                    </View>
                </View>
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
    label: string;
}

const NavButton = memo(({ icon, onPress, label }: NavButtonProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.9, springConfigs.stiff);
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
            accessibilityRole="button"
            accessibilityLabel={label}
            style={[styles.navButton, animatedStyle]}
        >
            <Ionicons
                name={icon}
                size={horizontalScale(20)}
                color={colors.primaryDark}
            />
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginTop: verticalScale(16),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(16),
        ...shadows.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    headerText: {
        fontSize: ScaleFontSize(17),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    navButton: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(20),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekdayRow: {
        flexDirection: 'row',
        marginBottom: verticalScale(8),
    },
    weekdayCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekdayText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        fontWeight: '600',
    },
    calendarGrid: {
        gap: verticalScale(4),
    },
    weekRow: {
        flexDirection: 'row',
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: horizontalScale(2),
        position: 'relative',
    },
    dayCellOtherMonth: {
        opacity: 0.3,
    },
    dayContent: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayContentToday: {
        backgroundColor: colors.primaryLightBg,
    },
    selectedDayGradient: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(18),
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '500',
        color: colors.textPrimary,
    },
    dayTextOtherMonth: {
        color: colors.textSecondary,
    },
    dayTextSelected: {
        color: colors.white,
        fontWeight: '700',
    },
    dayTextToday: {
        color: colors.primaryDark,
        fontWeight: '700',
    },
    completionDot: {
        position: 'absolute',
        bottom: verticalScale(2),
        width: horizontalScale(6),
        height: horizontalScale(6),
        borderRadius: horizontalScale(3),
    },
    completionDotFull: {
        backgroundColor: colors.success,
    },
    completionDotPartial: {
        backgroundColor: colors.warning,
    },
    legend: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        marginTop: verticalScale(16),
        gap: horizontalScale(24),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
    },
    legendDot: {
        width: horizontalScale(8),
        height: horizontalScale(8),
        borderRadius: horizontalScale(4),
    },
    legendText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        fontWeight: '500',
    },
});

export default memo(MealCalendar);
