/**
 * HomeScreen
 * @description Main home screen - clean orchestrator with modular components
 */

import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { useHomeData } from '@/src/hooks/home';
import { useAppSelector } from '@/src/shared/store';
import {
    HomeHeader,
    WeightProgressCard,
    MealsCard,
    QuickActions,
    HomeErrorBoundary,
    HomeLoadingSkeleton,
} from '@/src/features/home';

/**
 * HomeScreen - Main dashboard showing user progress
 */
export default function HomeScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);



    // Get all home data from custom hook
    const {
        user,
        weightProgress,
        meals,
        nutrition,
        waterIntake,
        planProgress,
        greeting,
        isLoading,
        error,
        refresh,
        handleMealToggle,
        handleAddWater,
        handleRemoveWater,
    } = useHomeData();

    // Handlers
    const handleProfilePress = useCallback(() => {
        // TODO: Navigate to profile screen
        Alert.alert('الملف الشخصي', 'سيتم فتح الملف الشخصي قريباً');
    }, []);

    const handleNotificationPress = useCallback(() => {
        router.push('/(app)/notifications');
    }, [router]);

    const handleViewWeightDetails = useCallback(() => {
        // TODO: Navigate to weight details
        Alert.alert('تفاصيل الوزن', 'سيتم فتح تفاصيل الوزن قريباً');
    }, []);

    const handleViewAllMeals = useCallback(() => {
        // TODO: Navigate to meals screen
        Alert.alert('الوجبات', 'سيتم فتح شاشة الوجبات قريباً');
    }, []);

    const handleViewPlan = useCallback(() => {
        // TODO: Navigate to plan details
        Alert.alert('الخطة الغذائية', 'سيتم فتح تفاصيل الخطة قريباً');
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    // Show loading skeleton on initial load
    if (isLoading && !user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <HomeLoadingSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Animated.ScrollView
                entering={FadeIn.duration(400)}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primaryDark}
                        colors={[colors.primaryDark]}
                    />
                }
            >
                {/* Header */}
                <HomeHeader
                    userName={user ? `${user.firstName} ${user.lastName}` : 'مستخدم'}
                    userAvatar={user?.avatarUrl}
                    greeting={greeting}
                    onProfilePress={handleProfilePress}
                    onNotificationPress={handleNotificationPress}
                />

                {/* Weight Progress Section */}
                <HomeErrorBoundary
                    sectionName="تقدم الوزن"
                    onRetry={refresh}
                >
                    <WeightProgressCard
                        progress={weightProgress}
                        onViewDetails={handleViewWeightDetails}
                        isLoading={isLoading}
                    />
                </HomeErrorBoundary>

                {/* Meals Section */}
                <HomeErrorBoundary
                    sectionName="الوجبات"
                    onRetry={refresh}
                >
                    <MealsCard
                        meals={meals}
                        nutrition={nutrition}
                        onMealToggle={handleMealToggle}
                        onViewAll={handleViewAllMeals}
                        isLoading={isLoading}
                    />
                </HomeErrorBoundary>

                {/* Quick Actions Section */}
                <HomeErrorBoundary
                    sectionName="الإجراءات السريعة"
                    onRetry={refresh}
                >
                    <QuickActions
                        waterIntake={waterIntake}
                        planProgress={planProgress}
                        onAddWater={handleAddWater}
                        onRemoveWater={handleRemoveWater}
                        onViewPlan={handleViewPlan}
                    />
                </HomeErrorBoundary>
            </Animated.ScrollView>
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
        paddingBottom: 100, // Space for tab bar
    },
});
