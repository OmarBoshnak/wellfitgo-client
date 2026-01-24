/**
 * Time Slots Utilities
 * @description Time slot generation and validation for booking system
 */

import { TimeSlot } from '@/src/shared/types/booking';

/**
 * Generate time slots for a given range
 * @param startHour - Starting hour (24-hour format)
 * @param endHour - Ending hour (24-hour format)
 * @param intervalMinutes - Interval between slots in minutes
 * @returns Array of TimeSlot objects
 */
export function generateTimeSlots(
    startHour: number = 8,
    endHour: number = 20,
    intervalMinutes: number = 30
): TimeSlot[] {
    const slots: TimeSlot[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const label = formatTimeDisplay(value, false);
            const labelAr = formatTimeDisplay(value, true);

            slots.push({ value, label, labelAr });
        }
    }

    // Add the final slot at endHour:00 if not already included
    const finalSlot = `${endHour.toString().padStart(2, '0')}:00`;
    if (!slots.some(slot => slot.value === finalSlot)) {
        slots.push({
            value: finalSlot,
            label: formatTimeDisplay(finalSlot, false),
            labelAr: formatTimeDisplay(finalSlot, true),
        });
    }

    return slots;
}

/**
 * Format time for display
 * @param time - Time in HH:mm format
 * @param isRTL - Whether to format in Arabic
 * @returns Formatted time string (e.g., "12:30 م" or "12:30 PM")
 */
export function formatTimeDisplay(time: string, isRTL: boolean = true): string {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    if (isRTL) {
        const period = isPM ? 'م' : 'ص';
        return `${displayHour}:${minute} ${period}`;
    }

    const period = isPM ? 'PM' : 'AM';
    return `${displayHour}:${minute} ${period}`;
}

/**
 * Parse time string to minutes since midnight
 * @param time - Time in HH:mm format
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Check if end time is after start time
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns True if end time is after start time
 */
export function isEndTimeAfterStart(startTime: string, endTime: string): boolean {
    return timeToMinutes(endTime) > timeToMinutes(startTime);
}

/**
 * Get duration between two times in minutes
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Duration in minutes (negative if end is before start)
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
    return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Format duration for display
 * @param minutes - Duration in minutes
 * @param isRTL - Whether to format in Arabic
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number, isRTL: boolean = true): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (isRTL) {
        if (hours === 0) {
            return `${mins} دقيقة`;
        }
        if (mins === 0) {
            return hours === 1 ? 'ساعة واحدة' : `${hours} ساعات`;
        }
        return `${hours} ساعة و ${mins} دقيقة`;
    }

    if (hours === 0) {
        return `${mins} min`;
    }
    if (mins === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return `${hours}h ${mins}m`;
}

/**
 * Get the next available time slot after current time
 * @param slots - Array of time slots
 * @returns The next available time slot value or first slot if all passed
 */
export function getNextAvailableSlot(slots: TimeSlot[]): string {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of slots) {
        if (timeToMinutes(slot.value) > currentMinutes) {
            return slot.value;
        }
    }

    // If all slots have passed, return the first slot (for next day)
    return slots[0]?.value || '12:00';
}

/**
 * Filter available end times based on selected start time
 * @param slots - All time slots
 * @param startTime - Selected start time
 * @returns Array of valid end time slots
 */
export function getValidEndTimes(slots: TimeSlot[], startTime: string): TimeSlot[] {
    const startMinutes = timeToMinutes(startTime);
    return slots.filter(slot => timeToMinutes(slot.value) > startMinutes);
}
