/**
 * Calendar Helpers
 * @description 14-day calendar generation for booking system
 */

import { CalendarDay } from '@/src/shared/types/booking';
import { getDayName, getMonthName, isToday, isPast, addDays } from './dateHelpers';

/**
 * Generate next 14 days for calendar selection
 * @param startDate - Starting date (defaults to today)
 * @returns Array of CalendarDay objects
 */
export function generateNext14Days(startDate: Date = new Date()): CalendarDay[] {
    const days: CalendarDay[] = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
        const date = addDays(start, i);

        days.push({
            date,
            dayNumber: date.getDate(),
            dayName: getDayName(date, false),
            dayNameAr: getDayName(date, true),
            monthName: getMonthName(date, false),
            monthNameAr: getMonthName(date, true),
            isToday: isToday(date),
            isPast: isPast(date),
        });
    }

    return days;
}

/**
 * Get the index of a date in the calendar days array
 * @param calendarDays - Array of calendar days
 * @param targetDate - Date to find
 * @returns Index of the date, or -1 if not found
 */
export function findDateIndex(calendarDays: CalendarDay[], targetDate: Date): number {
    return calendarDays.findIndex(day =>
        day.date.getDate() === targetDate.getDate() &&
        day.date.getMonth() === targetDate.getMonth() &&
        day.date.getFullYear() === targetDate.getFullYear()
    );
}

/**
 * Get calendar day by date
 * @param calendarDays - Array of calendar days
 * @param targetDate - Date to find
 * @returns CalendarDay object or undefined
 */
export function getCalendarDay(
    calendarDays: CalendarDay[],
    targetDate: Date
): CalendarDay | undefined {
    const index = findDateIndex(calendarDays, targetDate);
    return index >= 0 ? calendarDays[index] : undefined;
}

/**
 * Check if a date is selectable (not in past)
 * @param date - Date to check
 * @returns True if date can be selected
 */
export function isDateSelectable(date: Date): boolean {
    return !isPast(date);
}

/**
 * Get first available date (today or next available)
 * @param calendarDays - Array of calendar days
 * @returns First selectable CalendarDay
 */
export function getFirstAvailableDate(calendarDays: CalendarDay[]): CalendarDay | undefined {
    return calendarDays.find(day => !day.isPast);
}

/**
 * Group calendar days by month
 * @param calendarDays - Array of calendar days
 * @returns Object with month keys and arrays of days
 */
export function groupByMonth(
    calendarDays: CalendarDay[]
): Record<string, CalendarDay[]> {
    return calendarDays.reduce((acc, day) => {
        const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(day);
        return acc;
    }, {} as Record<string, CalendarDay[]>);
}
