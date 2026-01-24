/**
 * Date Helpers
 * @description Date formatting and localization utilities for booking system
 */

// Arabic day names
const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Arabic month names
const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
const ENGLISH_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Get day name from date
 * @param date - The date to get day name from
 * @param isRTL - Whether to return Arabic name
 */
export function getDayName(date: Date, isRTL: boolean = true): string {
    const dayIndex = date.getDay();
    return isRTL ? ARABIC_DAYS[dayIndex] : ENGLISH_DAYS[dayIndex];
}

/**
 * Get month name from date
 * @param date - The date to get month name from
 * @param isRTL - Whether to return Arabic name
 */
export function getMonthName(date: Date, isRTL: boolean = true): string {
    const monthIndex = date.getMonth();
    return isRTL ? ARABIC_MONTHS[monthIndex] : ENGLISH_MONTHS[monthIndex];
}

/**
 * Format date for display
 * @param date - The date to format
 * @param isRTL - Whether to format in Arabic
 * @returns Formatted date string (e.g., "15 يناير" or "15 Jan")
 */
export function formatDateForDisplay(date: Date, isRTL: boolean = true): string {
    const day = date.getDate();
    const month = getMonthName(date, isRTL);
    return isRTL ? `${day} ${month}` : `${month} ${day}`;
}

/**
 * Format full date for display
 * @param date - The date to format
 * @param isRTL - Whether to format in Arabic
 * @returns Full formatted date string (e.g., "الثلاثاء، 15 يناير 2026")
 */
export function formatFullDate(date: Date, isRTL: boolean = true): string {
    const dayName = getDayName(date, isRTL);
    const day = date.getDate();
    const month = getMonthName(date, isRTL);
    const year = date.getFullYear();

    if (isRTL) {
        return `${dayName}، ${day} ${month} ${year}`;
    }
    return `${dayName}, ${month} ${day}, ${year}`;
}

/**
 * Check if date is today
 * @param date - The date to check
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if date is in the past
 * @param date - The date to check
 */
export function isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
}

/**
 * Check if date is in the future (including today)
 * @param date - The date to check
 */
export function isFutureOrToday(date: Date): boolean {
    return !isPast(date);
}

/**
 * Get start of day
 * @param date - The date to get start of
 */
export function getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Add days to a date
 * @param date - The base date
 * @param days - Number of days to add
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Get difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 */
export function getDaysDifference(date1: Date, date2: Date): number {
    const d1 = getStartOfDay(date1);
    const d2 = getStartOfDay(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}
