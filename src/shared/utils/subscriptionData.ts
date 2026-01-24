/**
 * Subscription Data
 * @description Mock data for subscription plans and features
 */

import { SubscriptionPlan, PlanFeature, SocialProofData } from '@/src/shared/types/subscription';

/**
 * Common features available across all plans
 */
export const planFeatures: PlanFeature[] = [
    {
        id: 'coach',
        text: 'Personal Coach',
        textAr: 'مدرب شخصي',
        included: true,
    },
    {
        id: 'meals',
        text: 'Custom Meal Plans',
        textAr: 'خطط وجبات مخصصة',
        included: true,
    },
    {
        id: 'tracking',
        text: 'Progress Tracking',
        textAr: 'تتبع التقدم',
        included: true,
    },
    {
        id: 'support',
        text: '24/7 Support',
        textAr: 'دعم على مدار الساعة',
        included: true,
    },
    {
        id: 'video',
        text: 'Video Consultations',
        textAr: 'استشارات فيديو',
        included: true,
    },
    {
        id: 'recipes',
        text: 'Healthy Recipes',
        textAr: 'وصفات صحية',
        included: true,
    },
];

/**
 * Available subscription plans
 */
export const subscriptionPlans: SubscriptionPlan[] = [
    {
        id: '1-month',
        name: '1 Month',
        nameAr: 'شهر واحد',
        duration: 1,
        durationLabel: 'month',
        durationLabelAr: 'شهر',
        price: 340,
        originalPrice: 400,
        pricePerMonth: 340,
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: false,
    },
    {
        id: '3-months',
        name: '3 Months',
        nameAr: '3 أشهر',
        duration: 3,
        durationLabel: 'months',
        durationLabelAr: 'أشهر',
        price: 800,
        originalPrice: 1020,
        pricePerMonth: 267,
        savings: 'Save 22%',
        savingsAr: 'وفر 22%',
        badge: 'most-popular',
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: true,
    },
    {
        id: '12-months',
        name: '12 Months',
        nameAr: '12 شهر',
        duration: 12,
        durationLabel: 'months',
        durationLabelAr: 'شهر',
        price: 2400,
        originalPrice: 4080,
        pricePerMonth: 200,
        savings: 'Save 41%',
        savingsAr: 'وفر 41%',
        badge: 'best-value',
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: false,
    },
];

/**
 * Social proof data
 */
export const socialProofData: SocialProofData = {
    avatarColors: ['#5073FE', '#02C3CD', '#FF6B6B', '#FFD93D', '#6BCB77'],
    userCount: 2847,
    message: '+2,000 people joined this month',
    messageAr: '+2,000 شخص انضموا هذا الشهر',
};

/**
 * Get plan by ID
 */
export function getPlanById(id: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find((plan) => plan.id === id);
}

/**
 * Get default selected plan (most popular)
 */
export function getDefaultPlan(): SubscriptionPlan | undefined {
    return subscriptionPlans.find((plan) => plan.isPopular) || subscriptionPlans[0];
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, isRTL: boolean = true): string {
    if (isRTL) {
        return `${price} ج.م`;
    }
    return `${price} EGP`;
}

/**
 * Format price per month
 */
export function formatPricePerMonth(price: number, isRTL: boolean = true): string {
    if (isRTL) {
        return `${price} ج.م/شهر`;
    }
    return `${price} EGP/month`;
}

/**
 * Simulate subscription purchase
 */
export async function purchaseSubscription(
    planId: string,
    delayMs: number = 1500
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                subscriptionId: `sub_${Date.now()}_${planId}`,
            });
        }, delayMs);
    });
}
