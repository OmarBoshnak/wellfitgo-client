/**
 * Subscription Types
 * @description Types and interfaces for subscription system
 */

/** Badge types for subscription plans */
export type PlanBadge = 'best-value' | 'most-popular';

/** Feature item with bilingual support */
export interface PlanFeature {
    id: string;
    text: string;
    textAr: string;
    included: boolean;
}

/** Complete subscription plan */
export interface SubscriptionPlan {
    id: string;
    name: string;
    nameAr: string;
    duration: number; // months
    durationLabel: string;
    durationLabelAr: string;
    price: number;
    originalPrice?: number;
    pricePerMonth?: number;
    savings?: string;
    savingsAr?: string;
    badge?: PlanBadge;
    features: PlanFeature[];
    isPopular?: boolean;
    currency: string;
    currencyAr: string;
}

/** Subscription selection state */
export interface SubscriptionState {
    selectedPlanId: string | null;
    isProcessing: boolean;
    error: string | null;
}

/** Social proof data */
export interface SocialProofData {
    avatarColors: string[];
    userCount: number;
    message: string;
    messageAr: string;
}

/** Subscription screen props */
export interface SubscriptionScreenProps {
    onComplete?: () => void;
    onSkip?: () => void;
}
