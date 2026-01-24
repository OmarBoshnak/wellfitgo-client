/**
 * Booking Redux Slice
 * @description State management for booking call form with validation
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    BookingFormData,
    BookingFormState,
    BookingValidationErrors,
    DEFAULT_BOOKING_FORM_DATA,
} from '@/src/shared/types/booking';
import { calculateBookingProgress } from '@/src/shared/utils/bookingValidation';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = '@wellfitgo/booking_form';

// ============================================================================
// Initial State
// ============================================================================

const initialState: BookingFormState = {
    formData: { ...DEFAULT_BOOKING_FORM_DATA },
    validation: {},
    isSubmitting: false,
    isComplete: false,
    isDirty: false,
};

// ============================================================================
// Slice
// ============================================================================

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        /**
         * Set selected doctor ID
         */
        setSelectedDoctor: (state, action: PayloadAction<string | null>) => {
            state.formData.doctorId = action.payload;
            state.isDirty = true;
        },

        /**
         * Set selected date (expects ISO string)
         */
        setSelectedDate: (state, action: PayloadAction<string>) => {
            state.formData.selectedDate = action.payload;
            state.isDirty = true;
        },

        /**
         * Set start time
         */
        setStartTime: (state, action: PayloadAction<string>) => {
            state.formData.startTime = action.payload;
            state.isDirty = true;
        },

        /**
         * Set end time
         */
        setEndTime: (state, action: PayloadAction<string>) => {
            state.formData.endTime = action.payload;
            state.isDirty = true;
        },

        /**
         * Set notes
         */
        setNotes: (state, action: PayloadAction<string>) => {
            state.formData.notes = action.payload;
            state.isDirty = true;
        },

        /**
         * Update entire form data
         */
        updateFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
            state.formData = { ...state.formData, ...action.payload };
            state.isDirty = true;
        },

        /**
         * Set validation error for a field
         */
        setValidationError: (
            state,
            action: PayloadAction<{ field: string; error: string }>
        ) => {
            const { field, error } = action.payload;
            state.validation[field] = error;
        },

        /**
         * Set multiple validation errors
         */
        setValidationErrors: (
            state,
            action: PayloadAction<BookingValidationErrors>
        ) => {
            state.validation = action.payload;
        },

        /**
         * Clear validation error for a field
         */
        clearValidationError: (state, action: PayloadAction<string>) => {
            delete state.validation[action.payload];
        },

        /**
         * Clear all validation errors
         */
        clearAllValidationErrors: (state) => {
            state.validation = {};
        },

        /**
         * Set submitting state
         */
        setSubmitting: (state, action: PayloadAction<boolean>) => {
            state.isSubmitting = action.payload;
        },

        /**
         * Mark booking as complete
         */
        markComplete: (state) => {
            state.isComplete = true;
            state.isSubmitting = false;
        },

        /**
         * Reset booking form to initial state
         */
        resetBooking: () => initialState,

        /**
         * Load saved form data from storage
         */
        loadSavedForm: (
            state,
            action: PayloadAction<Partial<BookingFormData>>
        ) => {
            state.formData = {
                ...DEFAULT_BOOKING_FORM_DATA,
                ...action.payload,
                // Ensure date is a valid ISO string
                selectedDate: action.payload.selectedDate
                    ? action.payload.selectedDate
                    : new Date().toISOString(),
            };
        },
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectBookingFormData = (state: { booking: BookingFormState }) =>
    state.booking.formData;

export const selectBookingValidation = (state: { booking: BookingFormState }) =>
    state.booking.validation;

export const selectBookingIsSubmitting = (state: { booking: BookingFormState }) =>
    state.booking.isSubmitting;

export const selectBookingIsComplete = (state: { booking: BookingFormState }) =>
    state.booking.isComplete;

export const selectBookingIsDirty = (state: { booking: BookingFormState }) =>
    state.booking.isDirty;

export const selectBookingFieldError = (field: string) => (state: { booking: BookingFormState }) =>
    state.booking.validation[field];

export const selectBookingProgress = (state: { booking: BookingFormState }) =>
    calculateBookingProgress(state.booking.formData);

// ============================================================================
// Async Thunks (for persistence)
// ============================================================================

/**
 * Save form data to AsyncStorage
 */
export const saveBookingToStorage = () => async (
    _dispatch: unknown,
    getState: () => { booking: BookingFormState }
) => {
    try {
        const { formData } = getState().booking;
        // formData.selectedDate is already an ISO string, no conversion needed
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving booking form to storage:', error);
    }
};

/**
 * Load form data from AsyncStorage
 */
export const loadBookingFromStorage = () => async (
    dispatch: { (action: PayloadAction<Partial<BookingFormData>>): void }
) => {
    try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const formData = JSON.parse(savedData) as Partial<BookingFormData>;
            dispatch(bookingSlice.actions.loadSavedForm(formData));
        }
    } catch (error) {
        console.error('Error loading booking form from storage:', error);
    }
};

/**
 * Clear saved form data from AsyncStorage
 */
export const clearBookingStorage = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing booking form storage:', error);
    }
};

// ============================================================================
// Exports
// ============================================================================

export const {
    setSelectedDoctor,
    setSelectedDate,
    setStartTime,
    setEndTime,
    setNotes,
    updateFormData,
    setValidationError,
    setValidationErrors,
    clearValidationError,
    clearAllValidationErrors,
    setSubmitting,
    markComplete,
    resetBooking,
    loadSavedForm,
} = bookingSlice.actions;

export default bookingSlice.reducer;
