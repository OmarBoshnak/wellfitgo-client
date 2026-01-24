/**
 * ProfileScreen
 * @description Main profile screen - clean orchestrator with modular components
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, RefreshControl, Alert, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { isRTL, profileTranslations } from '@/src/shared/core/constants/translation';
import { EditModalType } from '@/src/shared/types/profile';

// Hooks
import {
    useProfile,
    useSubscription,
    useSettings,
    useAvatarUpload,
    useProfileActions,
} from '@/src/hooks/profile';

// Components
import {
    ProfileHeader,
    WeightProgress,
    PlanSummary,
    SubscriptionCard,
    PersonalInfo,
    NotificationSettings,
    SupportOptions,
    ProfileActions,
    EditModals,
    ProfileLoadingSkeleton,
} from '@/src/features/profile';

/**
 * ProfileScreen - User profile and settings
 */
export default function ProfileScreen() {
    const router = useRouter();
    const t = profileTranslations;
    const [refreshing, setRefreshing] = useState(false);
    const [editModal, setEditModal] = useState<EditModalType>(null);

    // Hooks
    const {
        profile,
        weightProgress,
        isLoading,
        error,
        refresh,
        updateField,
    } = useProfile();

    const {
        subscription,
        handleUpgrade,
        handleManage,
    } = useSubscription();

    const {
        notifications,
        toggleNotification,
    } = useSettings();

    const {
        isUploading,
        uploadProgress,
        pickFromLibrary,
        takePhotoFromCamera,
        removeAvatar,
    } = useAvatarUpload();

    const {
        isLoggingOut,
        handleLogout,
        handleDeleteAccount,
    } = useProfileActions();

    // Handlers
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handleAvatarPress = useCallback(() => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [t.cancel, t.takePhoto, t.chooseFromLibrary, t.removePhoto],
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 3,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        await takePhotoFromCamera();
                    } else if (buttonIndex === 2) {
                        await pickFromLibrary();
                    } else if (buttonIndex === 3) {
                        await removeAvatar();
                    }
                }
            );
        } else {
            Alert.alert(
                t.changePhoto,
                '',
                [
                    { text: t.cancel, style: 'cancel' },
                    {
                        text: t.takePhoto,
                        onPress: async () => await takePhotoFromCamera(),
                    },
                    {
                        text: t.chooseFromLibrary,
                        onPress: async () => await pickFromLibrary(),
                    },
                    {
                        text: t.removePhoto,
                        style: 'destructive',
                        onPress: async () => await removeAvatar(),
                    },
                ]
            );
        }
    }, [t, takePhotoFromCamera, pickFromLibrary, removeAvatar]);

    const handleEditPress = useCallback(() => {
        // Navigate to full edit profile screen (future)
        Alert.alert('تعديل الملف الشخصي', 'سيتم إضافة شاشة التعديل الكامل قريباً');
    }, []);

    const handleViewWeightHistory = useCallback(() => {
        // Navigate to weight history screen (future)
        Alert.alert('سجل الوزن', 'سيتم إضافة شاشة سجل الوزن قريباً');
    }, []);

    const handleMessageCoach = useCallback(() => {
        router.push('/(app)/(tabs)/chat');
    }, [router]);

    const handleViewPlan = useCallback(() => {
        router.push('/(app)/(tabs)/meals');
    }, [router]);

    const handleHelpCenter = useCallback(() => {
        Alert.alert('مركز المساعدة', 'سيتم إضافة مركز المساعدة قريباً');
    }, []);

    const handleWhatsApp = useCallback(() => {
        Alert.alert('واتساب', 'سيتم فتح واتساب');
    }, []);

    const handleEmail = useCallback(() => {
        Alert.alert('البريد الإلكتروني', 'سيتم فتح البريد');
    }, []);

    const handleOpenEditModal = useCallback((type: EditModalType) => {
        setEditModal(type);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditModal(null);
    }, []);

    const handleSaveField = useCallback(
        async (field: string, value: string | number) => {
            await updateField(field as keyof typeof profile, value);
        },
        [updateField, profile]
    );

    // Show loading skeleton on initial load
    if (isLoading && !profile) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ProfileLoadingSkeleton />
            </SafeAreaView>
        );
    }

    // Guard for missing profile
    if (!profile) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ProfileLoadingSkeleton />
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
                {/* Profile Header */}
                <ProfileHeader
                    profile={profile}
                    subscription={subscription}
                    onAvatarPress={handleAvatarPress}
                    onEditPress={handleEditPress}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                />

                {/* Weight Progress */}
                {weightProgress && (
                    <WeightProgress
                        progress={weightProgress}
                        onViewHistory={handleViewWeightHistory}
                    />
                )}

                {/* Plan Summary */}
                <PlanSummary
                    plan={null} // Will be populated when coachPlan is available
                    onMessageCoach={handleMessageCoach}
                    onViewPlan={handleViewPlan}
                />

                {/* Subscription Card */}
                <SubscriptionCard
                    subscription={subscription}
                    onManage={handleManage}
                    onUpgrade={handleUpgrade}
                />

                {/* Personal Info */}
                <PersonalInfo
                    profile={profile}
                    onEditGender={() => handleOpenEditModal('gender')}
                    onEditAge={() => handleOpenEditModal('age')}
                    onEditHeight={() => handleOpenEditModal('height')}
                />

                {/* Notification Settings */}
                <NotificationSettings
                    settings={notifications}
                    onToggle={toggleNotification}
                />

                {/* Support Options */}
                <SupportOptions
                    onHelpCenter={handleHelpCenter}
                    onWhatsApp={handleWhatsApp}
                    onEmail={handleEmail}
                />

                {/* Profile Actions */}
                <ProfileActions
                    onLogout={handleLogout}
                    onDeleteAccount={handleDeleteAccount}
                    isLoggingOut={isLoggingOut}
                />
            </Animated.ScrollView>

            {/* Edit Modals */}
            <EditModals
                visible={editModal}
                profile={profile}
                onClose={handleCloseEditModal}
                onSave={handleSaveField}
            />
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
