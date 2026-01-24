/**
 * Meal Date Formatting
 * @description Localized date formatting utilities for meals screen
 */

// ============================================================================
// Constants
// ============================================================================

const MONTH_NAMES = {
    en: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const WEEKDAY_NAMES = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const WEEKDAY_SHORT = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
};

const RELATIVE_DAYS = {
    en: { today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow' },
    ar: { today: 'اليوم', yesterday: 'أمس', tomorrow: 'غداً' },
};

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format date for meal card header
 * Example: "Thursday, January 15" or "الخميس، 15 يناير"
 */
export function formatMealDate(date: Date, isArabic: boolean = false): string {
    const day = date.getDate();
    const month = date.getMonth();
    const weekday = date.getDay();

    const weekdayName = isArabic ? WEEKDAY_NAMES.ar[weekday] : WEEKDAY_NAMES.en[weekday];
    const monthName = isArabic ? MONTH_NAMES.ar[month] : MONTH_NAMES.en[month];

    if (isArabic) {
        return `${weekdayName}، ${day} ${monthName}`;
    }
    return `${weekdayName}, ${monthName} ${day}`;
}

/**
 * Format date for day navigator
 * Example: "Today - Thursday" or "اليوم - الخميس"
 */
export function formatDayNavigator(date: Date, isArabic: boolean = false): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const weekdayName = isArabic
        ? WEEKDAY_NAMES.ar[date.getDay()]
        : WEEKDAY_NAMES.en[date.getDay()];

    const relative = isArabic ? RELATIVE_DAYS.ar : RELATIVE_DAYS.en;

    if (diffDays === 0) {
        return isArabic ? `${relative.today} - ${weekdayName}` : `${relative.today} - ${weekdayName}`;
    } else if (diffDays === -1) {
        return isArabic ? `${relative.yesterday} - ${weekdayName}` : `${relative.yesterday} - ${weekdayName}`;
    } else if (diffDays === 1) {
        return isArabic ? `${relative.tomorrow} - ${weekdayName}` : `${relative.tomorrow} - ${weekdayName}`;
    }

    return formatMealDate(date, isArabic);
}

/**
 * Format date for calendar header
 * Example: "January 2024" or "يناير 2024"
 */
export function formatCalendarHeader(month: number, year: number, isArabic: boolean = false): string {
    const monthName = isArabic ? MONTH_NAMES.ar[month] : MONTH_NAMES.en[month];
    return `${monthName} ${year}`;
}

/**
 * Format time for meal display
 * Example: "8:00 AM" or "8:00 ص"
 */
export function formatMealTime(time: string, isArabic: boolean = false): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const isPM = hours >= 12;
    const displayHour = hours % 12 || 12;

    const suffix = isArabic
        ? (isPM ? 'م' : 'ص')
        : (isPM ? 'PM' : 'AM');

    return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/**
 * Format short date
 * Example: "Jan 15" or "15 يناير"
 */
export function formatShortDate(date: Date, isArabic: boolean = false): string {
    const day = date.getDate();
    const month = date.getMonth();

    const monthName = isArabic ? MONTH_NAMES.ar[month] : MONTH_NAMES.en[month].substring(0, 3);

    if (isArabic) {
        return `${day} ${monthName}`;
    }
    return `${monthName} ${day}`;
}

/**
 * Get relative day label
 * Example: "Today", "Yesterday", "Tomorrow", or null
 */
export function getRelativeDayLabel(date: Date, isArabic: boolean = false): string | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const relative = isArabic ? RELATIVE_DAYS.ar : RELATIVE_DAYS.en;

    switch (diffDays) {
        case 0: return relative.today;
        case -1: return relative.yesterday;
        case 1: return relative.tomorrow;
        default: return null;
    }
}

/**
 * Format weekday short name
 */
export function formatWeekdayShort(dayIndex: number, isArabic: boolean = false): string {
    return isArabic ? WEEKDAY_SHORT.ar[dayIndex] : WEEKDAY_SHORT.en[dayIndex];
}

/**
 * Format day number with ordinal suffix (English only)
 * Example: "15th"
 */
export function formatDayWithOrdinal(day: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = day % 100;

    return day + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

/**
 * Convert Arabic numerals to English
 */
export function arabicToEnglishNumerals(str: string): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, (d) => String(arabicNumerals.indexOf(d)));
}

/**
 * Convert English numerals to Arabic
 */
export function englishToArabicNumerals(num: number | string): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
}
