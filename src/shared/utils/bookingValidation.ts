/**
 * Booking Form Validation Utilities
 * @description Zod schemas and validation helpers for booking form
 */

import { z } from 'zod';
import { BookingFormData } from '@/src/shared/types/booking';
import { isEndTimeAfterStart } from './dateTime/timeSlots';
import { isPast } from './dateTime/dateHelpers';

// ============================================================================
// Arabic Error Messages
// ============================================================================

const BOOKING_ERRORS = {
    doctor: {
        required: 'يرجى اختيار الطبيب',
    },
    date: {
        required: 'يرجى اختيار التاريخ',
        past: 'لا يمكن اختيار تاريخ في الماضي',
    },
    time: {
        required: 'يرجى اختيار الوقت',
        invalid: 'وقت النهاية يجب أن يكون بعد وقت البداية',
        startRequired: 'يرجى اختيار وقت البداية',
        endRequired: 'يرجى اختيار وقت النهاية',
    },
    notes: {
        maxLength: 'الملاحظات يجب ألا تتجاوز 500 حرف',
    },
};

// ============================================================================
// Zod Schemas
// ============================================================================

/** Doctor ID validation schema */
export const doctorIdSchema = z
    .string()
    .min(1, BOOKING_ERRORS.doctor.required);

/** Notes validation schema */
export const notesSchema = z
    .string()
    .max(500, BOOKING_ERRORS.notes.maxLength)
    .optional();

/** Time string validation schema */
export const timeSchema = z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format');

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a single booking field
 * @param field - Field name to validate
 * @param value - Field value
 * @param context - Additional context (e.g., other field values)
 * @returns Error message or null if valid
 */
export function validateBookingField(
    field: string,
    value: unknown,
    context?: { startTime?: string; endTime?: string }
): string | null {
    try {
        switch (field) {
            case 'doctorId':
            case 'doctor':
                if (!value || value === '') {
                    return BOOKING_ERRORS.doctor.required;
                }
                doctorIdSchema.parse(value);
                break;

            case 'selectedDate':
            case 'date':
                if (!value) {
                    return BOOKING_ERRORS.date.required;
                }
                // Handle both Date objects and ISO strings
                const dateToCheck = value instanceof Date ? value : new Date(value as string);
                if (isPast(dateToCheck)) {
                    return BOOKING_ERRORS.date.past;
                }
                break;

            case 'startTime':
                if (!value || value === '') {
                    return BOOKING_ERRORS.time.startRequired;
                }
                timeSchema.parse(value);
                break;

            case 'endTime':
                if (!value || value === '') {
                    return BOOKING_ERRORS.time.endRequired;
                }
                timeSchema.parse(value);
                // Check if end time is after start time
                if (context?.startTime && !isEndTimeAfterStart(context.startTime, value as string)) {
                    return BOOKING_ERRORS.time.invalid;
                }
                break;

            case 'time':
                // Combined time validation
                if (context?.startTime && context?.endTime) {
                    if (!isEndTimeAfterStart(context.startTime, context.endTime)) {
                        return BOOKING_ERRORS.time.invalid;
                    }
                }
                break;

            case 'notes':
                if (value && typeof value === 'string') {
                    notesSchema.parse(value);
                }
                break;

            default:
                return null;
        }
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.issues[0]?.message || 'قيمة غير صالحة';
        }
        return 'حدث خطأ في التحقق';
    }
}

/**
 * Validate entire booking form and return all errors
 * @param formData - Complete booking form data
 * @returns Object with field names as keys and error messages as values
 */
export function validateBookingForm(
    formData: BookingFormData
): Record<string, string> {
    const errors: Record<string, string> = {};

    // Validate doctor selection
    const doctorError = validateBookingField('doctorId', formData.doctorId);
    if (doctorError) {
        errors.doctor = doctorError;
    }

    // Validate date
    const dateError = validateBookingField('date', formData.selectedDate);
    if (dateError) {
        errors.date = dateError;
    }

    // Validate start time
    const startTimeError = validateBookingField('startTime', formData.startTime);
    if (startTimeError) {
        errors.startTime = startTimeError;
    }

    // Validate end time
    const endTimeError = validateBookingField('endTime', formData.endTime, {
        startTime: formData.startTime,
    });
    if (endTimeError) {
        errors.endTime = endTimeError;
    }

    // Validate notes (optional but check max length)
    const notesError = validateBookingField('notes', formData.notes);
    if (notesError) {
        errors.notes = notesError;
    }

    return errors;
}

/**
 * Check if booking form has any validation errors
 * @param errors - Validation errors object
 * @returns True if there are errors
 */
export function hasBookingErrors(errors: Record<string, string | undefined>): boolean {
    return Object.values(errors).some((error) => error !== undefined && error !== null);
}

/**
 * Check if form is complete (all required fields filled)
 * @param formData - Booking form data
 * @returns True if form is complete
 */
export function isBookingFormComplete(formData: BookingFormData): boolean {
    return (
        formData.doctorId !== null &&
        formData.doctorId !== '' &&
        formData.selectedDate !== null &&
        formData.startTime !== '' &&
        formData.endTime !== '' &&
        isEndTimeAfterStart(formData.startTime, formData.endTime)
    );
}

/**
 * Calculate booking form progress
 * @param formData - Booking form data
 * @returns Progress percentage (0-100)
 */
export function calculateBookingProgress(formData: BookingFormData): number {
    let completed = 0;
    const total = 4; // doctor, date, start time, end time

    if (formData.doctorId) completed++;
    if (formData.selectedDate) completed++;
    if (formData.startTime) completed++;
    if (formData.endTime && isEndTimeAfterStart(formData.startTime, formData.endTime)) completed++;

    return Math.round((completed / total) * 100);
}
