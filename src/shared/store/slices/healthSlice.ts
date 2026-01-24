/**
 * Health Form Redux Slice
 * @description State management for health history form with validation and persistence
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    HealthFormData,
    ValidationErrors,
    HealthFormState,
    DEFAULT_HEALTH_FORM_DATA,
} from '@/src/shared/types/health';
import { validateField, calculateProgress } from '@/src/shared/utils/validation';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = '@wellfitgo/health_form';

// ============================================================================
// Initial State
// ============================================================================

const initialState: HealthFormState = {
    formData: { ...DEFAULT_HEALTH_FORM_DATA },
    validation: {},
    progress: 0,
    isComplete: false,
    isDirty: false,
    currentStep: 1,
    totalSteps: 2,
};

// ============================================================================
// Slice
// ============================================================================

const healthSlice = createSlice({
    name: 'health',
    initialState,
    reducers: {
        /**
         * Update a single form field
         */
        updateFormField: (
            state,
            action: PayloadAction<{ field: keyof HealthFormData; value: unknown }>
        ) => {
            const { field, value } = action.payload;
            (state.formData as Record<string, unknown>)[field] = value;
            state.isDirty = true;
            state.progress = calculateProgress(state.formData as Record<string, unknown>);
            state.isComplete = state.progress === 100;
        },

        /**
         * Update multiple form fields at once
         */
        updateFormFields: (
            state,
            action: PayloadAction<Partial<HealthFormData>>
        ) => {
            state.formData = { ...state.formData, ...action.payload };
            state.isDirty = true;
            state.progress = calculateProgress(state.formData as Record<string, unknown>);
            state.isComplete = state.progress === 100;
        },

        /**
         * Set validation error for a field
         */
        setValidationError: (
            state,
            action: PayloadAction<{ field: string; error: string | undefined }>
        ) => {
            const { field, error } = action.payload;
            if (error) {
                state.validation[field] = error;
            } else {
                delete state.validation[field];
            }
        },

        /**
         * Set multiple validation errors
         */
        setValidationErrors: (
            state,
            action: PayloadAction<ValidationErrors>
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
         * Validate a single field and update validation state
         */
        validateFormField: (
            state,
            action: PayloadAction<{ field: string; options?: { unit?: string; countryCode?: string } }>
        ) => {
            const { field, options } = action.payload;
            const value = (state.formData as Record<string, unknown>)[field];
            const error = validateField(field, value, options);

            if (error) {
                state.validation[field] = error;
            } else {
                delete state.validation[field];
            }
        },

        /**
         * Set current form step
         */
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },

        /**
         * Go to next step
         */
        nextStep: (state) => {
            if (state.currentStep < state.totalSteps) {
                state.currentStep += 1;
            }
        },

        /**
         * Go to previous step
         */
        previousStep: (state) => {
            if (state.currentStep > 1) {
                state.currentStep -= 1;
            }
        },

        /**
         * Mark form as complete
         */
        markComplete: (state) => {
            state.isComplete = true;
        },

        /**
         * Reset form to initial state
         */
        resetForm: () => initialState,

        /**
         * Load saved form data from storage
         */
        loadSavedForm: (
            state,
            action: PayloadAction<Partial<HealthFormData>>
        ) => {
            state.formData = { ...DEFAULT_HEALTH_FORM_DATA, ...action.payload };
            state.progress = calculateProgress(state.formData as Record<string, unknown>);
            state.isComplete = state.progress === 100;
        },
    },
});

// ============================================================================
// Selectors
// ============================================================================

export const selectHealthFormData = (state: { health: HealthFormState }) =>
    state.health.formData;

export const selectHealthValidation = (state: { health: HealthFormState }) =>
    state.health.validation;

export const selectHealthProgress = (state: { health: HealthFormState }) =>
    state.health.progress;

export const selectHealthCurrentStep = (state: { health: HealthFormState }) =>
    state.health.currentStep;

export const selectHealthIsComplete = (state: { health: HealthFormState }) =>
    state.health.isComplete;

export const selectHealthIsDirty = (state: { health: HealthFormState }) =>
    state.health.isDirty;

export const selectFieldError = (field: string) => (state: { health: HealthFormState }) =>
    state.health.validation[field];

// ============================================================================
// Async Thunks (for persistence)
// ============================================================================

/**
 * Save form data to AsyncStorage
 */
export const saveFormToStorage = () => async (
    _dispatch: unknown,
    getState: () => { health: HealthFormState }
) => {
    try {
        const { formData } = getState().health;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving health form to storage:', error);
    }
};

/**
 * Load form data from AsyncStorage
 */
export const loadFormFromStorage = () => async (
    dispatch: { (action: PayloadAction<Partial<HealthFormData>>): void }
) => {
    try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const formData = JSON.parse(savedData) as Partial<HealthFormData>;
            dispatch(healthSlice.actions.loadSavedForm(formData));
        }
    } catch (error) {
        console.error('Error loading health form from storage:', error);
    }
};

/**
 * Clear saved form data from AsyncStorage
 */
export const clearFormStorage = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing health form storage:', error);
    }
};

// ============================================================================
// Exports
// ============================================================================

export const {
    updateFormField,
    updateFormFields,
    setValidationError,
    setValidationErrors,
    clearValidationError,
    clearAllValidationErrors,
    validateFormField,
    setCurrentStep,
    nextStep,
    previousStep,
    markComplete,
    resetForm,
    loadSavedForm,
} = healthSlice.actions;

export default healthSlice.reducer;
