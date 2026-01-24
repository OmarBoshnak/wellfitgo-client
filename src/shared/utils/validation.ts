/**
 * Health Form Validation Utilities
 * @description Zod schemas and validation helpers for health form
 */

import { z } from 'zod';

// ============================================================================
// Validation Patterns
// ============================================================================

/** Arabic and English letters with spaces */
const NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s]+$/;

/** Egyptian phone number: starts with 01, 10-11 digits total */
const EGYPT_PHONE_REGEX = /^(01)[0-9]{9}$/;

/** International phone: 8-15 digits */
const INTERNATIONAL_PHONE_REGEX = /^[0-9]{8,15}$/;

// ============================================================================
// Arabic Error Messages
// ============================================================================

const ERRORS = {
    firstName: {
        required: 'الاسم الأول مطلوب',
        min: 'الاسم الأول يجب أن يكون حرفين على الأقل',
        max: 'الاسم الأول يجب ألا يتجاوز 50 حرفاً',
        pattern: 'الاسم يجب أن يحتوي على حروف فقط',
    },
    lastName: {
        required: 'اسم العائلة مطلوب',
        min: 'اسم العائلة يجب أن يكون حرفين على الأقل',
        max: 'اسم العائلة يجب ألا يتجاوز 50 حرفاً',
        pattern: 'اسم العائلة يجب أن يحتوي على حروف فقط',
    },
    phone: {
        required: 'رقم الهاتف مطلوب',
        egyptInvalid: 'رقم الهاتف المصري يجب أن يبدأ بـ 01 ويتكون من 10-11 رقم',
        internationalInvalid: 'رقم الهاتف يجب أن يكون 8-15 رقماً',
    },
    age: {
        required: 'العمر مطلوب',
        min: 'العمر يجب أن يكون 16 سنة على الأقل',
        max: 'العمر يجب أن يكون أقل من 80 سنة',
        invalid: 'العمر يجب أن يكون رقماً صحيحاً',
    },
    height: {
        required: 'الطول مطلوب',
        minCm: 'الطول يجب أن يكون 100 سم على الأقل',
        maxCm: 'الطول يجب ألا يتجاوز 250 سم',
        minFt: 'الطول يجب أن يكون 3.3 قدم على الأقل',
        maxFt: 'الطول يجب ألا يتجاوز 8.2 قدم',
    },
    weight: {
        required: 'الوزن مطلوب',
        minKg: 'الوزن يجب أن يكون 30 كجم على الأقل',
        maxKg: 'الوزن يجب ألا يتجاوز 300 كجم',
        minLb: 'الوزن يجب أن يكون 66 رطل على الأقل',
        maxLb: 'الوزن يجب ألا يتجاوز 660 رطل',
    },
    gender: {
        required: 'يرجى اختيار الجنس',
    },
    goal: {
        required: 'يرجى اختيار هدفك',
    },
};

// ============================================================================
// Zod Schemas
// ============================================================================

/** First name validation schema */
export const firstNameSchema = z
    .string()
    .min(1, ERRORS.firstName.required)
    .min(2, ERRORS.firstName.min)
    .max(50, ERRORS.firstName.max)
    .regex(NAME_REGEX, ERRORS.firstName.pattern);

/** Last name validation schema */
export const lastNameSchema = z
    .string()
    .min(1, ERRORS.lastName.required)
    .min(2, ERRORS.lastName.min)
    .max(50, ERRORS.lastName.max)
    .regex(NAME_REGEX, ERRORS.lastName.pattern);

/** Age validation schema */
export const ageSchema = z
    .number()
    .min(16, ERRORS.age.min)
    .max(80, ERRORS.age.max);

/** Height validation schema (cm) */
export const heightCmSchema = z
    .number()
    .min(100, ERRORS.height.minCm)
    .max(250, ERRORS.height.maxCm);

/** Height validation schema (ft) */
export const heightFtSchema = z
    .number()
    .min(3.3, ERRORS.height.minFt)
    .max(8.2, ERRORS.height.maxFt);

/** Weight validation schema (kg) */
export const weightKgSchema = z
    .number()
    .min(30, ERRORS.weight.minKg)
    .max(300, ERRORS.weight.maxKg);

/** Weight validation schema (lb) */
export const weightLbSchema = z
    .number()
    .min(66, ERRORS.weight.minLb)
    .max(660, ERRORS.weight.maxLb);

/** Gender validation schema */
export const genderSchema = z.enum(['male', 'female']);

/** Goal validation schema */
export const goalSchema = z.enum(
    ['lose_weight', 'gain_muscle', 'maintain', 'improve_health']
);

/** Complete health form schema */
export const healthFormSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    phoneNumber: z.string().min(8, ERRORS.phone.required),
    countryCode: z.string(),
    age: ageSchema,
    gender: genderSchema,
    height: z.number().min(1, ERRORS.height.required),
    heightUnit: z.enum(['cm', 'ft']),
    weight: z.number().min(1, ERRORS.weight.required),
    weightUnit: z.enum(['kg', 'lb']),
    goal: goalSchema,
    medicalConditions: z.array(z.string()),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate phone number based on country code
 * @param phone - Phone number without country code
 * @param countryCode - Country dial code (e.g., '+20')
 * @returns Error message or null if valid
 */
export function validatePhone(phone: string, countryCode: string): string | null {
    if (!phone || phone.length === 0) {
        return ERRORS.phone.required;
    }

    if (countryCode === '+20') {
        if (!EGYPT_PHONE_REGEX.test(phone)) {
            return ERRORS.phone.egyptInvalid;
        }
    } else {
        if (!INTERNATIONAL_PHONE_REGEX.test(phone)) {
            return ERRORS.phone.internationalInvalid;
        }
    }

    return null;
}

/**
 * Validate a single field
 * @param field - Field name to validate
 * @param value - Field value
 * @param options - Additional options (e.g., unit for height/weight)
 * @returns Error message or null if valid
 */
export function validateField(
    field: string,
    value: unknown,
    options?: { unit?: string; countryCode?: string }
): string | null {
    try {
        switch (field) {
            case 'firstName':
                firstNameSchema.parse(value);
                break;
            case 'lastName':
                lastNameSchema.parse(value);
                break;
            case 'age':
                if (value === null || value === undefined || value === '') {
                    return ERRORS.age.required;
                }
                ageSchema.parse(Number(value));
                break;
            case 'phoneNumber':
                return validatePhone(value as string, options?.countryCode || '+20');
            case 'height':
                if (value === null || value === undefined) {
                    return ERRORS.height.required;
                }
                if (options?.unit === 'ft') {
                    heightFtSchema.parse(Number(value));
                } else {
                    heightCmSchema.parse(Number(value));
                }
                break;
            case 'weight':
                if (value === null || value === undefined) {
                    return ERRORS.weight.required;
                }
                if (options?.unit === 'lb') {
                    weightLbSchema.parse(Number(value));
                } else {
                    weightKgSchema.parse(Number(value));
                }
                break;
            case 'gender':
                if (!value) return ERRORS.gender.required;
                genderSchema.parse(value);
                break;
            case 'goal':
                if (!value) return ERRORS.goal.required;
                goalSchema.parse(value);
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
 * Validate entire form and return all errors
 * @param formData - Complete form data object
 * @returns Object with field names as keys and error messages as values
 */
export function validateForm(
    formData: Record<string, unknown>
): Record<string, string> {
    const errors: Record<string, string> = {};

    const fieldsToValidate = [
        'firstName',
        'lastName',
        'phoneNumber',
        'age',
        'gender',
        'height',
        'weight',
        'goal',
    ];

    for (const field of fieldsToValidate) {
        const error = validateField(field, formData[field], {
            unit: field === 'height' ? (formData.heightUnit as string) :
                field === 'weight' ? (formData.weightUnit as string) : undefined,
            countryCode: formData.countryCode as string,
        });

        if (error) {
            errors[field] = error;
        }
    }

    return errors;
}

/**
 * Check if form has any validation errors
 * @param errors - Validation errors object
 * @returns True if there are errors
 */
export function hasErrors(errors: Record<string, string | undefined>): boolean {
    return Object.values(errors).some((error) => error !== undefined && error !== null);
}

/**
 * Calculate form completion progress
 * @param formData - Current form data
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(formData: Record<string, unknown>): number {
    const requiredFields = [
        'firstName',
        'lastName',
        'phoneNumber',
        'age',
        'gender',
        'height',
        'weight',
        'goal',
    ];

    let completed = 0;

    for (const field of requiredFields) {
        const value = formData[field];
        if (value !== null && value !== undefined && value !== '') {
            completed++;
        }
    }

    return Math.round((completed / requiredFields.length) * 100);
}

// ============================================================================
// Unit Conversion Utilities
// ============================================================================

/**
 * Convert height between cm and ft
 */
export function convertHeight(value: number, from: 'cm' | 'ft', to: 'cm' | 'ft'): number {
    if (from === to) return value;
    if (from === 'cm' && to === 'ft') {
        return Math.round((value / 30.48) * 10) / 10; // cm to ft
    }
    return Math.round(value * 30.48); // ft to cm
}

/**
 * Convert weight between kg and lb
 */
export function convertWeight(value: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
    if (from === to) return value;
    if (from === 'kg' && to === 'lb') {
        return Math.round(value * 2.20462); // kg to lb
    }
    return Math.round(value / 2.20462); // lb to kg
}

// ============================================================================
// Debounce Utility for Validation
// ============================================================================

/**
 * Create a debounced version of a function
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 */
export function debounce<T extends (...args: never[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}
