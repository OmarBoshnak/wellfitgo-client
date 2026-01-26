/**
 * Health Form Data Types
 * @description Types and interfaces for health history form
 */

/** Personal information data */
export interface PersonalInfoData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
    age: number | null;
}

/** Gender options */
export type Gender = 'male' | 'female';

/** Height unit options */
export type HeightUnit = 'cm' | 'ft';

/** Weight unit options */
export type WeightUnit = 'kg' | 'lb';

/** Fitness goal options */
export type FitnessGoal = 'weight_loss' | 'gain_muscle' | 'maintain' | 'improve_health';

/** Common medical conditions */
export const MEDICAL_CONDITIONS = [
    'diabetes',
    'hypertension',
    'heart_disease',
    'asthma',
    'thyroid',
    'cholesterol',
    'none',
] as const;

export type MedicalCondition = typeof MEDICAL_CONDITIONS[number];

/** Complete health form data */
export interface HealthFormData extends PersonalInfoData {
    gender: Gender | null;
    height: number | null;
    heightUnit: HeightUnit;
    weight: number | null;
    weightUnit: WeightUnit;
    goal: FitnessGoal | null;
    medicalConditions: MedicalCondition[];
}

/** Validation errors map */
export interface ValidationErrors {
    [field: string]: string | undefined;
}

/** Health form state for Redux */
export interface HealthFormState {
    formData: Partial<HealthFormData>;
    validation: ValidationErrors;
    progress: number;
    isComplete: boolean;
    isDirty: boolean;
    currentStep: number;
    totalSteps: number;
}

/** Goal option with metadata for display */
export interface GoalOption {
    value: FitnessGoal;
    labelAr: string;
    labelEn: string;
    icon: string;
}

/** Medical condition option with metadata */
export interface MedicalConditionOption {
    value: MedicalCondition;
    labelAr: string;
    labelEn: string;
}

/** Default form values */
export const DEFAULT_HEALTH_FORM_DATA: Partial<HealthFormData> = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+20',
    age: null,
    gender: null,
    height: null,
    heightUnit: 'cm',
    weight: null,
    weightUnit: 'kg',
    goal: null,
    medicalConditions: [],
};
