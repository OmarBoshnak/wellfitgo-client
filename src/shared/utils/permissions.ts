/**
 * App Permissions Utility
 * @description Centralized permission handling for the app
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert, Linking } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'limited';

export interface PermissionResult {
    status: PermissionStatus;
    canAskAgain: boolean;
}

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Show alert to user to enable permissions in settings
 */
const showSettingsAlert = (permissionType: 'camera' | 'photos' | 'microphone') => {
    const messages = {
        camera: 'Camera access is needed to take photos. Please enable it in your device settings.',
        photos: 'Photo library access is needed to select images. Please enable it in your device settings.',
        microphone: 'Microphone access is needed to record voice messages. Please enable it in your device settings.'
    };

    Alert.alert(
        'Permission Required',
        messages[permissionType],
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: () => {
                    if (Platform.OS === 'ios') {
                        Linking.openURL('app-settings:');
                    } else {
                        Linking.openSettings();
                    }
                },
            },
        ]
    );
};

/**
 * Request media library permissions with better handling
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
        // Check current permission status first
        const currentStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log('Current media library permission status:', currentStatus);

        if (currentStatus.status === 'granted') {
            return true;
        }

        if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
            showSettingsAlert('photos');
            return false;
        }

        // Request permission
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Permission request result:', permissionResult);

        if (permissionResult.status === 'granted') {
            return true;
        }

        if (permissionResult.status === 'denied') {
            showSettingsAlert('photos');
        }

        return false;
    } catch (error) {
        console.error('Error requesting media library permission:', error);
        return false;
    }
};

/**
 * Request camera permissions with better handling
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    try {
        // Check current permission status first
        const currentStatus = await ImagePicker.getCameraPermissionsAsync();
        console.log('Current camera permission status:', currentStatus);

        if (currentStatus.status === 'granted') {
            return true;
        }

        if (currentStatus.status === 'denied' && !currentStatus.canAskAgain) {
            showSettingsAlert('camera');
            return false;
        }

        // Request permission
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission request result:', permissionResult);

        if (permissionResult.status === 'granted') {
            return true;
        }

        if (permissionResult.status === 'denied') {
            showSettingsAlert('camera');
        }

        return false;
    } catch (error) {
        console.error('Error requesting camera permission:', error);
        return false;
    }
};

/**
 * Check if media library permission is granted
 */
export const checkMediaLibraryPermission = async (): Promise<boolean> => {
    try {
        const status = await ImagePicker.getMediaLibraryPermissionsAsync();
        return status.status === 'granted';
    } catch (error) {
        console.error('Error checking media library permission:', error);
        return false;
    }
};

/**
 * Check if camera permission is granted
 */
export const checkCameraPermission = async (): Promise<boolean> => {
    try {
        const status = await ImagePicker.getCameraPermissionsAsync();
        return status.status === 'granted';
    } catch (error) {
        console.error('Error checking camera permission:', error);
        return false;
    }
};

/**
 * Request all necessary permissions for the chat feature
 */
export const requestChatPermissions = async (): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
}> => {
    const [camera, mediaLibrary] = await Promise.all([
        requestCameraPermission(),
        requestMediaLibraryPermission(),
    ]);

    return { camera, mediaLibrary };
};
