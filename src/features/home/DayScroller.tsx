/**
 * DayScroller Component
 * Horizontal scrollable day selector with status indicators
 */

import React, { memo, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';

import { colors } from '@/src/shared/core/constants/Theme';
import { ScaleFontSize, horizontalScale, verticalScale } from '@/src/core/utils/scaling';
import { isRTL } from '@/src/core/constants/translation';

// Day status types
export type DayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'today';

interface DayItem {
    date: string;
    dayNum: number;
    label: string;
    labelAr: string;
    status: DayStatus;
    isToday?: boolean;
    weekNumber?: number;
}

interface DayScrollerProps {
    days: DayItem[];
    selectedDate: string;
    onDaySelect: (date: string) => void;
}

// Get status color based on day status
const getStatusColor = (status: DayStatus): string => {
    switch (status) {
        case 'complete':
            return colors.success;
        case 'partial':
            return colors.warning;
        case 'missed':
            return colors.error;
        case 'future':
        case 'today':
        default:
            return colors.gray;
    }
};

// Day Item Component
const DayItemButton = memo<{
    day: DayItem;
    isSelected: boolean;
    onPress: () => void;
}>(({ day, isSelected, onPress }) => {
    const statusColor = getStatusColor(day.status);
    const dayLabel = isRTL ? day.labelAr : day.label;

    return (
        <TouchableOpacity
            style={[
                styles.dayItem,
                isSelected && styles.dayItemSelected,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${dayLabel} ${day.dayNum}`}
            accessibilityState={{ selected: isSelected }}
        >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                {dayLabel}
            </Text>
            <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {day.dayNum}
            </Text>
            {/* Status indicator dot */}
            <View
                style={[
                    styles.statusDot,
                    { backgroundColor: statusColor },
                    isSelected && styles.statusDotSelected,
                ]}
            />
        </TouchableOpacity>
    );
});

DayItemButton.displayName = 'DayItemButton';

/**
 * DayScroller - Horizontal scrollable day selector
 */
function DayScroller({ days, selectedDate, onDaySelect }: DayScrollerProps) {
    const scrollViewRef = useRef<ScrollView>(null);

    // Find index of selected or today's date
    const selectedIndex = days.findIndex((d) => d.date === selectedDate);
    const todayIndex = days.findIndex((d) => d.isToday);

    // Scroll to selected/today on mount
    useEffect(() => {
        const targetIndex = selectedIndex >= 0 ? selectedIndex : todayIndex;
        if (targetIndex >= 0 && scrollViewRef.current) {
            const scrollPosition = targetIndex * (DAY_ITEM_WIDTH + DAY_ITEM_MARGIN * 2);
            // Center the item
            const offset = scrollPosition - horizontalScale(100);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    x: isRTL ? -offset : offset,
                    animated: true,
                });
            }, 100);
        }
    }, [selectedIndex, todayIndex]);

    const handleDayPress = useCallback(
        (date: string) => {
            onDaySelect(date);
        },
        [onDaySelect]
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    isRTL && styles.scrollContentRTL,
                ]}
                decelerationRate="fast"
                snapToInterval={DAY_ITEM_WIDTH + DAY_ITEM_MARGIN * 2}
            >
                {days.map((day) => (
                    <DayItemButton
                        key={day.date}
                        day={day}
                        isSelected={day.date === selectedDate}
                        onPress={() => handleDayPress(day.date)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const DAY_ITEM_WIDTH = horizontalScale(52);
const DAY_ITEM_MARGIN = horizontalScale(4);

const styles = StyleSheet.create({
    container: {
        marginVertical: verticalScale(8),
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(8),
        gap: horizontalScale(8),
    },
    scrollContentRTL: {
        flexDirection: 'row-reverse',
    },
    dayItem: {
        width: DAY_ITEM_WIDTH,
        height: verticalScale(72),
        borderRadius: 12,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: DAY_ITEM_MARGIN,
        paddingVertical: verticalScale(8),
    },
    dayItemSelected: {
        backgroundColor: colors.primaryDark,
    },
    dayLabel: {
        fontSize: ScaleFontSize(11),
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: verticalScale(4),
    },
    dayLabelSelected: {
        color: colors.white,
    },
    dayNum: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    dayNumSelected: {
        color: colors.white,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: verticalScale(6),
    },
    statusDotSelected: {
        backgroundColor: colors.white,
    },
});

export default memo(DayScroller);
