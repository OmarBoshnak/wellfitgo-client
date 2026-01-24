/**
 * SubscriptionScreen
 * @description Premium subscription plan selection screen
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { verticalScale } from '@/src/shared/core/utils/scaling';

// Components
import {
    SubscriptionHeader,
    FreeCallBanner,
    PlanCard,
    PlanFeatures,
    SocialProof,
    SubscriptionFooter,
} from '@/src/features/subscription';

// Data
import {
    subscriptionPlans,
    planFeatures,
    socialProofData,
    getPlanById,
    getDefaultPlan,
    purchaseSubscription,
} from '@/src/shared/utils/subscriptionData';

/**
 * SubscriptionScreen - Main subscription flow orchestrator
 */
export default function SubscriptionScreen() {
    const router = useRouter();

    // State
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
        const defaultPlan = getDefaultPlan();
        return defaultPlan?.id || null;
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Get selected plan object
    const selectedPlan = useMemo(() => {
        return selectedPlanId ? getPlanById(selectedPlanId) : null;
    }, [selectedPlanId]);

    // Handlers
    const handlePlanSelect = useCallback((planId: string) => {
        setSelectedPlanId(planId);
    }, []);

    const handleContinue = useCallback(() => {
        if (!selectedPlanId || !selectedPlan) {
            Alert.alert('تنبيه', 'الرجاء اختيار خطة للمتابعة');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Navigate to payment screen with selected plan details
        router.push({
            pathname: '/(app)/payment',
            params: {
                planId: selectedPlan.id,
                price: selectedPlan.price.toString(),
            },
        } as never);
    }, [selectedPlanId, selectedPlan, router]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(app)/(tabs)' as never);
    }, [router]);

    const handleClose = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(app)/(tabs)' as never);
    }, [router]);

    const handleTermsPress = useCallback(() => {
        // TODO: Navigate to terms page or open URL
        Alert.alert('الشروط والأحكام', 'سيتم فتح صفحة الشروط والأحكام');
    }, []);

    const handlePrivacyPress = useCallback(() => {
        // TODO: Navigate to privacy page or open URL
        Alert.alert('سياسة الخصوصية', 'سيتم فتح صفحة سياسة الخصوصية');
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(300)}>
                <SubscriptionHeader
                    onClose={handleClose}
                    title="اختر خطتك"
                    subtitle="ابدأ رحلتك نحو حياة صحية أفضل"
                />
            </Animated.View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Free Call Banner */}
                <FreeCallBanner />

                {/* Plan Cards */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    {subscriptionPlans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isSelected={selectedPlanId === plan.id}
                            onSelect={() => handlePlanSelect(plan.id)}
                        />
                    ))}
                </Animated.View>

                {/* Features List */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <PlanFeatures features={planFeatures} columns={2} />
                </Animated.View>

                {/* Social Proof */}
                <SocialProof data={socialProofData} />

                {/* Bottom spacing for fixed footer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Footer */}
            <Animated.View entering={FadeIn.delay(300).duration(300)}>
                <SubscriptionFooter
                    onContinue={handleContinue}
                    onSkip={handleSkip}
                    onTermsPress={handleTermsPress}
                    onPrivacyPress={handlePrivacyPress}
                    isLoading={isProcessing}
                    disabled={!selectedPlanId}
                    selectedPlan={selectedPlan}
                />
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: verticalScale(8),
    },
    bottomSpacer: {
        height: verticalScale(20),
    },
});
