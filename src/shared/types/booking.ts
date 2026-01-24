/**
 * Booking Form Data Types
 * @description Types and interfaces for booking call system
 */

/** Doctor information with bilingual names */
export interface Doctor {
    id: string;
    name: string;
    nameAr: string;
    specialty?: string;
    specialtyAr?: string;
    avatar?: string;
}

/** Time slot representation */
export interface TimeSlot {
    label: string;
    labelAr: string;
    value: string; // HH:mm format
}

/** Calendar day representation */
export interface CalendarDay {
    date: Date;
    dayNumber: number;
    dayName: string;
    dayNameAr: string;
    monthName: string;
    monthNameAr: string;
    isToday: boolean;
    isPast: boolean;
}

/** Complete booking form data */
export interface BookingFormData {
    doctorId: string | null;
    /** ISO date string for Redux serialization */
    selectedDate: string;
    startTime: string;
    endTime: string;
    notes: string;
}

/** Validation errors map */
export interface BookingValidationErrors {
    [field: string]: string | undefined;
}

/** Booking form state for Redux */
export interface BookingFormState {
    formData: BookingFormData;
    validation: BookingValidationErrors;
    isSubmitting: boolean;
    isComplete: boolean;
    isDirty: boolean;
}

/** Default booking form values */
export const DEFAULT_BOOKING_FORM_DATA: BookingFormData = {
    doctorId: null,
    selectedDate: new Date().toISOString(),
    startTime: '12:00',
    endTime: '12:30',
    notes: '',
};

/** Booking status */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/** Complete booking record */
export interface Booking {
    id: string;
    doctorId: string;
    userId: string;
    date: Date;
    startTime: string;
    endTime: string;
    notes: string;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
}
