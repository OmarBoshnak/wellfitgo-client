/**
 * Profile Types
 * @description TypeScript interfaces for ProfileScreen data
 */

// ============================================================================
// Profile Types
// ============================================================================

/** User profile information */
export interface Profile {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    gender: 'male' | 'female';
    age: number;
    height: number; // in cm
    startWeight: number; // in kg
    currentWeight: number; // in kg
    targetWeight: number; // in kg
    dateOfBirth?: string; // ISO date string
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

/** Computed profile display values */
export interface ProfileDisplay {
    fullName: string;
    fullNameAr: string;
    initials: string;
    bmi: number;
    bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
}

// ============================================================================
// Subscription Types
// ============================================================================

/** Subscription status */
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';

/** Subscription information */
export interface Subscription {
    id: string;
    planName: string;
    planNameAr: string;
    status: SubscriptionStatus;
    startDate: string; // ISO date string
    nextBillingDate: string; // ISO date string
    endDate?: string; // ISO date string
    price: number;
    currency: string;
    cancelAtPeriodEnd?: boolean;
    trialDaysRemaining?: number;
}

// ============================================================================
// Coach Types
// ============================================================================

/** Coach information */
export interface Coach {
    id: string;
    name: string;
    nameAr: string;
    avatarUrl?: string;
    specialty?: string;
    specialtyAr?: string;
}

/** Plan assigned by coach */
export interface CoachPlan {
    id: string;
    name: string;
    nameAr: string;
    coach: Coach;
    startDate: string;
    durationDays: number;
    currentDay: number;
    completedDays: number;
}

// ============================================================================
// Settings Types
// ============================================================================

/** Notification settings */
export interface NotificationSettings {
    pushEnabled: boolean;
    mealReminders: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
    coachMessages: boolean;
}

/** App preferences */
export interface AppPreferences {
    language: 'ar' | 'en';
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
}

/** Complete profile settings */
export interface ProfileSettings {
    notifications: NotificationSettings;
    preferences: AppPreferences;
}

// ============================================================================
// Weight Progress Types
// ============================================================================

/** Weight entry for history */
export interface WeightEntry {
    date: string; // ISO date string
    weight: number; // in kg
    timestamp: number;
}

/** Weight progress with calculations */
export interface WeightProgress {
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    totalToLose: number;
    totalLost: number;
    remainingToGoal: number;
    progressPercentage: number;
    trend: 'up' | 'down' | 'stable';
    history: WeightEntry[];
}

// ============================================================================
// State Types
// ============================================================================

/** Profile Redux state */
export interface ProfileState {
    profile: Profile | null;
    subscription: Subscription | null;
    coachPlan: CoachPlan | null;
    settings: ProfileSettings;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    lastSync: number | null;
}

/** Avatar upload state */
export interface AvatarUploadState {
    isUploading: boolean;
    uploadProgress: number;
    previewUri: string | null;
    error: string | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

/** ProfileHeader props */
export interface ProfileHeaderProps {
    profile: Profile;
    subscription: Subscription | null;
    onAvatarPress: () => void;
    onEditPress: () => void;
    isRTL?: boolean;
    isUploading?: boolean;
    uploadProgress?: number;
}

/** WeightProgress component props */
export interface WeightProgressProps {
    progress: WeightProgress;
    unit?: 'kg' | 'lb';
    onViewHistory?: () => void;
    isRTL?: boolean;
}

/** PlanSummary props */
export interface PlanSummaryProps {
    plan: CoachPlan | null;
    onMessageCoach: () => void;
    onViewPlan: () => void;
    isRTL?: boolean;
}

/** SubscriptionCard props */
export interface SubscriptionCardProps {
    subscription: Subscription | null;
    onManage: () => void;
    onUpgrade: () => void;
    isRTL?: boolean;
}

/** PersonalInfo props */
export interface PersonalInfoProps {
    profile: Profile;
    onEditGender: () => void;
    onEditAge: () => void;
    onEditHeight: () => void;
    isRTL?: boolean;
}

/** NotificationSettings props */
export interface NotificationSettingsProps {
    settings: NotificationSettings;
    onToggle: (key: keyof NotificationSettings, value: boolean) => void;
    isRTL?: boolean;
}

/** SupportOptions props */
export interface SupportOptionsProps {
    onHelpCenter: () => void;
    onWhatsApp: () => void;
    onEmail: () => void;
    isRTL?: boolean;
}

/** ProfileActions props */
export interface ProfileActionsProps {
    onLogout: () => void;
    onDeleteAccount: () => void;
    isLoggingOut?: boolean;
    isRTL?: boolean;
}

/** Edit modal types */
export type EditModalType = 'gender' | 'age' | 'height' | 'weight' | null;

/** EditModals props */
export interface EditModalsProps {
    visible: EditModalType;
    profile: Profile;
    onClose: () => void;
    onSave: (field: string, value: string | number) => void;
    isRTL?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    pushEnabled: true,
    mealReminders: true,
    dailySummary: true,
    weeklyReport: false,
    coachMessages: true,
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
    language: 'ar',
    units: 'metric',
    theme: 'light',
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
    notifications: DEFAULT_NOTIFICATION_SETTINGS,
    preferences: DEFAULT_APP_PREFERENCES,
};

// ============================================================================
// Utility Types
// ============================================================================

/** Profile update payload */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'createdAt'>>;

/** Settings update payload */
export type SettingsUpdate = Partial<ProfileSettings>;

/** Notification settings update */
export type NotificationSettingsUpdate = Partial<NotificationSettings>;
