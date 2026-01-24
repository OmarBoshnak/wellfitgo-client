/**
 * useChatPermissions Hook
 * @description Subscription-based permission checks for chat features
 */

import { useMemo } from 'react';
import type { ChatPermissions, SubscriptionTier } from '@/src/shared/types/chat';

// ============================================================================
// Constants
// ============================================================================

const PERMISSION_CONFIG: Record<SubscriptionTier, Omit<ChatPermissions, 'tier' | 'messagesRemaining'>> = {
    free: {
        canSendMessages: true,
        canSendVoice: false,
        canSendImages: true,
        messageLimit: 10,
    },
    basic: {
        canSendMessages: true,
        canSendVoice: true,
        canSendImages: true,
        messageLimit: 100,
    },
    premium: {
        canSendMessages: true,
        canSendVoice: true,
        canSendImages: true,
        messageLimit: -1, // Unlimited
    },
};

// ============================================================================
// Types
// ============================================================================

export interface UseChatPermissionsProps {
    tier?: SubscriptionTier;
    messagesSentToday?: number;
}

export interface UseChatPermissionsReturn extends ChatPermissions {
    // Additional helpers
    isLimitReached: boolean;
    shouldShowUpgradeBanner: boolean;
    upgradeMessage: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useChatPermissions(
    props: UseChatPermissionsProps = {}
): UseChatPermissionsReturn {
    const { tier = 'free', messagesSentToday = 0 } = props;

    const permissions = useMemo((): UseChatPermissionsReturn => {
        const config = PERMISSION_CONFIG[tier];
        const messagesRemaining = config.messageLimit === -1
            ? -1
            : Math.max(0, config.messageLimit - messagesSentToday);

        const isLimitReached = config.messageLimit !== -1 && messagesRemaining <= 0;

        // Show upgrade banner when:
        // - Free tier with less than 3 messages remaining
        // - Basic tier with less than 10 messages remaining
        const shouldShowUpgradeBanner =
            (tier === 'free' && messagesRemaining <= 3 && messagesRemaining > 0) ||
            (tier === 'basic' && messagesRemaining <= 10 && messagesRemaining > 0) ||
            isLimitReached;

        // Generate upgrade message based on situation
        let upgradeMessage = '';
        if (isLimitReached) {
            upgradeMessage = tier === 'free'
                ? 'لقد وصلت للحد الأقصى من الرسائل اليومية. قم بالترقية لإرسال المزيد!'
                : 'لقد وصلت للحد الأقصى من الرسائل. قم بالترقية للباقة المميزة!';
        } else if (shouldShowUpgradeBanner) {
            upgradeMessage = `متبقي ${messagesRemaining} رسائل فقط اليوم. قم بالترقية للحصول على رسائل غير محدودة!`;
        }

        return {
            ...config,
            tier,
            messagesRemaining,
            isLimitReached,
            shouldShowUpgradeBanner,
            upgradeMessage,
            // Override canSendMessages if limit reached
            canSendMessages: config.canSendMessages && !isLimitReached,
        };
    }, [tier, messagesSentToday]);

    return permissions;
}

export default useChatPermissions;
