/**
 * Profile Data Utilities
 * @description Mock data and helper functions for profile
 */

import {
    Profile,
    Subscription,
    CoachPlan,
    Coach,
    ProfileSettings,
    WeightProgress,
    WeightEntry,
    DEFAULT_PROFILE_SETTINGS,
} from '@/src/shared/types/profile';

// ============================================================================
// Mock Data
// ============================================================================

/** Mock profile data */
export const mockProfile: Profile = {
    id: '1',
    firstName: 'أحمد',
    lastName: 'حسن',
    email: 'ahmed.hassan@example.com',
    phone: '+201234567890',
    avatarUrl: undefined,
    gender: 'male',
    age: 28,
    height: 180,
    startWeight: 95,
    currentWeight: 88,
    targetWeight: 80,
    dateOfBirth: '1997-05-15',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now(),
};

/** Mock coach data */
export const mockCoach: Coach = {
    id: 'coach-1',
    name: 'Sarah Ahmed',
    nameAr: 'سارة أحمد',
    avatarUrl: undefined,
    specialty: 'Weight Loss',
    specialtyAr: 'خسارة الوزن',
};

/** Mock coach plan */
export const mockCoachPlan: CoachPlan = {
    id: 'plan-1',
    name: 'Premium Weight Loss Plan',
    nameAr: 'خطة خسارة الوزن المميزة',
    coach: mockCoach,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    durationDays: 30,
    currentDay: 14,
    completedDays: 12,
};

/** Mock subscription */
export const mockSubscription: Subscription = {
    id: 'sub-1',
    planName: 'Premium Plan',
    planNameAr: 'الخطة المميزة',
    status: 'active',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    price: 299,
    currency: 'EGP',
    cancelAtPeriodEnd: false,
};

/** Mock settings */
export const mockSettings: ProfileSettings = {
    ...DEFAULT_PROFILE_SETTINGS,
};

/** Mock weight history */
export const mockWeightHistory: WeightEntry[] = [
    { date: '2024-01-01', weight: 95, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    { date: '2024-01-08', weight: 93.5, timestamp: Date.now() - 23 * 24 * 60 * 60 * 1000 },
    { date: '2024-01-15', weight: 91.8, timestamp: Date.now() - 16 * 24 * 60 * 60 * 1000 },
    { date: '2024-01-22', weight: 90.2, timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000 },
    { date: '2024-01-29', weight: 88.5, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { date: '2024-01-31', weight: 88, timestamp: Date.now() },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch mock profile data (simulates API call)
 */
export const fetchMockProfileData = async (): Promise<{
    profile: Profile;
    subscription: Subscription;
    coachPlan: CoachPlan;
    settings: ProfileSettings;
}> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
        profile: mockProfile,
        subscription: mockSubscription,
        coachPlan: mockCoachPlan,
        settings: mockSettings,
    };
};

/**
 * Calculate weight progress
 */
export const calculateWeightProgress = (profile: Profile): WeightProgress => {
    const { startWeight, currentWeight, targetWeight } = profile;
    const totalToLose = startWeight - targetWeight;
    const totalLost = startWeight - currentWeight;
    const remainingToGoal = Math.max(currentWeight - targetWeight, 0);

    // Calculate progress percentage
    let progressPercentage = 0;
    if (totalToLose > 0) {
        progressPercentage = Math.min(Math.round((totalLost / totalToLose) * 100), 100);
    }

    // Determine trend from history
    const history = Array.isArray(profile.weightHistory)
        ? [...profile.weightHistory].sort((a, b) => a.timestamp - b.timestamp)
        : [];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (history.length >= 2) {
        const last = history[history.length - 1].weight;
        const prev = history[history.length - 2].weight;
        if (last < prev - 0.2) trend = 'down';
        else if (last > prev + 0.2) trend = 'up';
    }

    return {
        startWeight,
        currentWeight,
        targetWeight,
        totalToLose: Math.max(totalToLose, 0),
        totalLost: Math.max(totalLost, 0),
        remainingToGoal,
        progressPercentage: Math.max(progressPercentage, 0),
        trend,
        history,
    };
};

/**
 * Calculate BMI
 */
export const calculateBMI = (
    weight: number,
    heightCm: number
): { value: number; category: 'underweight' | 'normal' | 'overweight' | 'obese' } => {
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    let category: 'underweight' | 'normal' | 'overweight' | 'obese';
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else category = 'obese';

    return {
        value: Math.round(bmi * 10) / 10,
        category,
    };
};

/**
 * Convert weight between units
 */
export const convertWeight = (
    weight: number,
    from: 'kg' | 'lb',
    to: 'kg' | 'lb'
): number => {
    if (from === to) return weight;
    if (from === 'kg' && to === 'lb') return Math.round(weight * 2.20462 * 10) / 10;
    return Math.round((weight / 2.20462) * 10) / 10;
};

/**
 * Convert height between units
 */
export const convertHeight = (
    height: number,
    from: 'cm' | 'ft',
    to: 'cm' | 'ft'
): number => {
    if (from === to) return height;
    if (from === 'cm' && to === 'ft') return Math.round((height / 30.48) * 10) / 10;
    return Math.round(height * 30.48);
};

/**
 * Format height for display
 */
export const formatHeight = (heightCm: number, unit: 'metric' | 'imperial'): string => {
    if (unit === 'metric') {
        return `${heightCm} سم`;
    }
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
};

/**
 * Format weight for display
 */
export const formatWeight = (weightKg: number, unit: 'metric' | 'imperial'): string => {
    if (unit === 'metric') {
        return `${weightKg} كجم`;
    }
    const lbs = convertWeight(weightKg, 'kg', 'lb');
    return `${lbs} lb`;
};

/**
 * Get subscription status label
 */
export const getSubscriptionStatusLabel = (
    status: Subscription['status'],
    isRTL: boolean
): { label: string; color: string } => {
    const labels = {
        active: { ar: 'نشط', en: 'Active', color: '#22C55E' },
        inactive: { ar: 'غير نشط', en: 'Inactive', color: '#9CA3AF' },
        trial: { ar: 'تجريبي', en: 'Trial', color: '#3B82F6' },
        expired: { ar: 'منتهي', en: 'Expired', color: '#EF4444' },
        cancelled: { ar: 'ملغي', en: 'Cancelled', color: '#F59E0B' },
    };

    const statusInfo = labels[status];
    return {
        label: isRTL ? statusInfo.ar : statusInfo.en,
        color: statusInfo.color,
    };
};

/**
 * Calculate days remaining until a date
 */
export const getDaysRemaining = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string, isRTL: boolean): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', options);
};

/**
 * Get gender label
 */
export const getGenderLabel = (gender: 'male' | 'female', isRTL: boolean): string => {
    if (isRTL) {
        return gender === 'male' ? 'ذكر' : 'أنثى';
    }
    return gender === 'male' ? 'Male' : 'Female';
};

/**
 * Validate profile update
 */
export const validateProfileUpdate = (
    update: Partial<Profile>
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (update.age !== undefined && (update.age < 13 || update.age > 120)) {
        errors.push('العمر يجب أن يكون بين 13 و 120 سنة');
    }

    if (update.height !== undefined && (update.height < 100 || update.height > 250)) {
        errors.push('الطول يجب أن يكون بين 100 و 250 سم');
    }

    if (update.currentWeight !== undefined && (update.currentWeight < 30 || update.currentWeight > 300)) {
        errors.push('الوزن يجب أن يكون بين 30 و 300 كجم');
    }

    if (update.targetWeight !== undefined && (update.targetWeight < 30 || update.targetWeight > 300)) {
        errors.push('الوزن المستهدف يجب أن يكون بين 30 و 300 كجم');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
