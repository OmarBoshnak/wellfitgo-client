/**
 * useSubscription Hook
 * @description Subscription data and management
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectSubscription,
    selectIsSubscriptionActive,
    selectSubscriptionDaysRemaining,
    setSubscription,
} from '@/src/shared/store/slices/profileSlice';
import { Subscription, SubscriptionStatus } from '@/src/shared/types/profile';
import { getDaysRemaining, formatDate, getSubscriptionStatusLabel } from '@/src/shared/utils/profileData';
import { isRTL } from '@/src/shared/core/constants/translation';

/**
 * Hook for subscription data and management
 */
export function useSubscription() {
    const dispatch = useAppDispatch();

    // Selectors
    const subscription = useAppSelector(selectSubscription);
    const isActive = useAppSelector(selectIsSubscriptionActive);
    const daysRemaining = useAppSelector(selectSubscriptionDaysRemaining);

    /**
     * Get formatted status information
     */
    const statusInfo = useMemo(() => {
        if (!subscription) return null;
        return getSubscriptionStatusLabel(subscription.status, isRTL);
    }, [subscription]);

    /**
     * Get formatted next billing date
     */
    const nextBillingFormatted = useMemo(() => {
        if (!subscription) return '';
        return formatDate(subscription.nextBillingDate, isRTL);
    }, [subscription]);

    /**
     * Get plan display name
     */
    const planDisplayName = useMemo(() => {
        if (!subscription) return '';
        return isRTL ? subscription.planNameAr : subscription.planName;
    }, [subscription]);

    /**
     * Check if subscription is expiring soon (within 7 days)
     */
    const isExpiringSoon = useMemo(() => {
        return daysRemaining > 0 && daysRemaining <= 7;
    }, [daysRemaining]);

    /**
     * Check if on trial
     */
    const isTrial = useMemo(() => {
        return subscription?.status === 'trial';
    }, [subscription]);

    /**
     * Get trial days remaining
     */
    const trialDaysRemaining = useMemo(() => {
        if (!isTrial || !subscription?.trialDaysRemaining) return 0;
        return subscription.trialDaysRemaining;
    }, [isTrial, subscription]);

    /**
     * Handle upgrade action (placeholder)
     */
    const handleUpgrade = useCallback(() => {
        // Navigate to subscription screen
        console.log('Navigate to upgrade screen');
    }, []);

    /**
     * Handle manage subscription (placeholder)
     */
    const handleManage = useCallback(() => {
        // Navigate to subscription management
        console.log('Navigate to manage subscription');
    }, []);

    /**
     * Handle cancel subscription (placeholder)
     */
    const handleCancel = useCallback(async () => {
        if (!subscription) return { success: false };

        try {
            // API call will go here
            // await api.cancelSubscription(subscription.id);
            console.log('Subscription cancelled');

            // Update local state
            dispatch(
                setSubscription({
                    ...subscription,
                    cancelAtPeriodEnd: true,
                })
            );

            return { success: true };
        } catch (err) {
            console.error('Error cancelling subscription:', err);
            return { success: false, error: 'حدث خطأ أثناء إلغاء الاشتراك' };
        }
    }, [dispatch, subscription]);

    return {
        // Data
        subscription,
        isActive,
        isTrial,
        isExpiringSoon,
        daysRemaining,
        trialDaysRemaining,
        statusInfo,
        planDisplayName,
        nextBillingFormatted,
        // Actions
        handleUpgrade,
        handleManage,
        handleCancel,
    };
}

export default useSubscription;
