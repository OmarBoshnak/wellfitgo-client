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
        text: 'Dedicated Nutrition Coach',
        textAr: 'أخصائي تغذية مخصص لمتابعتك',
        included: true,
    },
    {
        id: 'meals',
        text: 'Personalized Meal Plans',
        textAr: 'خطط وجبات مصممة حسب حالتك',
        included: true,
    },
    {
        id: 'tracking',
        text: 'Smart Progress Tracking',
        textAr: 'تتبع ذكي لتقدمك الصحي',
        included: true,
    },
    {
        id: 'support',
        text: 'Priority 24/7 Support',
        textAr: 'دعم فني وأخصائي على مدار اليوم',
        included: true,
    },
    {
        id: 'call',
        text: 'Live Consultations',
        textAr: 'استشارات مباشرة مع الأخصائي',
        included: true,
    },
    {
        id: 'recipes',
        text: 'Curated Healthy Recipes',
        textAr: 'وصفات صحية مختارة بعناية',
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
        savings: 'Save 15%',
        savingsAr: 'وفر 15%',
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: false,
    },
    {
        id: '2-months',
        name: '2 Months',
        nameAr: 'شهرين',
        duration: 2,
        durationLabel: 'months',
        durationLabelAr: 'أشهر',
        price: 595,
        originalPrice: 800,
        pricePerMonth: 298,
        savings: 'Save 26%',
        savingsAr: 'وفر 26%',
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
        price: 850,
        originalPrice: 1200,
        pricePerMonth: 283,
        savings: 'Save 29%',
        savingsAr: 'وفر 29%',
        badge: 'most-popular',
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: true,
    },
    {
        id: '4-months',
        name: '4 Months',
        nameAr: '4 أشهر',
        duration: 4,
        durationLabel: 'months',
        durationLabelAr: 'أشهر',
        price: 1148,
        originalPrice: 1600,
        pricePerMonth: 287,
        savings: 'Save 28%',
        savingsAr: 'وفر 28%',
        currency: 'EGP',
        currencyAr: 'ج.م',
        features: planFeatures,
        isPopular: false,
    },
    {
        id: '6-months',
        name: '6 Months',
        nameAr: '6 أشهر',
        duration: 6,
        durationLabel: 'months',
        durationLabelAr: 'أشهر',
        price: 1530,
        originalPrice: 2400,
        pricePerMonth: 255,
        savings: 'Save 36%',
        savingsAr: 'وفر 36%',
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
