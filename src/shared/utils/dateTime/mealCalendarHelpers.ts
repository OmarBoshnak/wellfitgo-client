/**
 * Meal Calendar Helpers
 * @description Monthly calendar generation for meals screen
 */

import { MealCalendarDay, MealHistory } from '@/src/shared/types/meals';

// ============================================================================
// Constants
// ============================================================================

const WEEKDAY_NAMES = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
};

const WEEKDAY_NAMES_FULL = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const MONTH_NAMES = {
    en: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

// ============================================================================
// Calendar Generation
// ============================================================================

/**
 * Generate all days for a month including padding days from prev/next months
 */
export function generateMonthDays(
    month: number,
    year: number,
    mealHistory?: MealHistory
): MealCalendarDay[] {
    const days: MealCalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Days from previous month to fill first week
    const startPadding = firstDay.getDay(); // 0 = Sunday
    if (startPadding > 0) {
        const prevMonth = new Date(year, month, 0); // Last day of prev month
        const prevMonthDays = prevMonth.getDate();

        for (let i = startPadding - 1; i >= 0; i--) {
            const dayNumber = prevMonthDays - i;
            const date = new Date(year, month - 1, dayNumber);
            const dateString = toISODateString(date);

            days.push({
                date,
                dateString,
                dayNumber,
                isCurrentMonth: false,
                isToday: isSameDay(date, today),
                isPast: date < today,
                isFuture: date > today,
                status: mealHistory?.[dateString],
            });
        }
    }

    // Days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateString = toISODateString(date);

        days.push({
            date,
            dateString,
            dayNumber: day,
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
            isPast: date < today,
            isFuture: date > today,
            status: mealHistory?.[dateString],
        });
    }

    // Days from next month to complete last week
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
        const date = new Date(year, month + 1, i);
        const dateString = toISODateString(date);

        days.push({
            date,
            dateString,
            dayNumber: i,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            isPast: date < today,
            isFuture: date > today,
            status: mealHistory?.[dateString],
        });
    }

    return days;
}

/**
 * Get weekday headers for calendar
 */
export function getWeekdayHeaders(isArabic: boolean = false): string[] {
    return isArabic ? WEEKDAY_NAMES.ar : WEEKDAY_NAMES.en;
}

/**
 * Get full weekday name
 */
export function getWeekdayName(dayIndex: number, isArabic: boolean = false): string {
    const names = isArabic ? WEEKDAY_NAMES_FULL.ar : WEEKDAY_NAMES_FULL.en;
    return names[dayIndex] || '';
}

/**
 * Get month name
 */
export function getMonthNameForCalendar(month: number, isArabic: boolean = false): string {
    const names = isArabic ? MONTH_NAMES.ar : MONTH_NAMES.en;
    return names[month] || '';
}

// ============================================================================
// Navigation
// ============================================================================

/**
 * Navigate to previous/next month
 */
export function navigateMonth(
    currentMonth: number,
    currentYear: number,
    direction: 'prev' | 'next'
): { month: number; year: number } {
    if (direction === 'prev') {
        if (currentMonth === 0) {
            return { month: 11, year: currentYear - 1 };
        }
        return { month: currentMonth - 1, year: currentYear };
    } else {
        if (currentMonth === 11) {
            return { month: 0, year: currentYear + 1 };
        }
        return { month: currentMonth + 1, year: currentYear };
    }
}

/**
 * Check if can navigate to previous month (limit to plan start date)
 */
export function canNavigateToPrevMonth(
    currentMonth: number,
    currentYear: number,
    planStartDate?: string
): boolean {
    if (!planStartDate) return true;

    const startDate = new Date(planStartDate);
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    if (currentYear > startYear) return true;
    if (currentYear === startYear && currentMonth > startMonth) return true;

    return false;
}

/**
 * Check if can navigate to next month (limit to 1 month ahead)
 */
export function canNavigateToNextMonth(
    currentMonth: number,
    currentYear: number
): boolean {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Allow navigation up to 1 month ahead
    if (currentYear < todayYear) return true;
    if (currentYear === todayYear && currentMonth < todayMonth + 1) return true;

    return false;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Convert date to ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date
 */
export function parseISODateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

/**
 * Get number of days in month
 */
export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get today's date string
 */
export function getTodayString(): string {
    return toISODateString(new Date());
}

/**
 * Get date with offset from today
 */
export function getDateWithOffset(offset: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
}

/**
 * Get weeks array from days array (for calendar grid)
 */
export function groupDaysIntoWeeks(days: MealCalendarDay[]): MealCalendarDay[][] {
    const weeks: MealCalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }
    return weeks;
}
