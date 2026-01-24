/**
 * useAvatarUpload Hook
 * @description Avatar image selection and upload with preview
 */

import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppDispatch } from '@/src/shared/store';
import { setAvatarUrl } from '@/src/shared/store/slices/profileSlice';
import {
    pickImageFromLibrary,
    takePhoto,
    compressImage,
    ImagePickerResult,
} from '@/src/shared/utils/media/imagePicker';

/**
 * Avatar upload state
 */
interface AvatarUploadState {
    isUploading: boolean;
    uploadProgress: number;
    previewUri: string | null;
    error: string | null;
}

const initialState: AvatarUploadState = {
    isUploading: false,
    uploadProgress: 0,
    previewUri: null,
    error: null,
};

/**
 * Hook for avatar upload management
 */
export function useAvatarUpload() {
    const dispatch = useAppDispatch();
    const [state, setState] = useState<AvatarUploadState>(initialState);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    /**
     * Set error
     */
    const setError = useCallback((error: string | null) => {
        setState((prev) => ({
            ...prev,
            error,
            isUploading: false,
        }));
    }, []);

    /**
     * Simulate upload progress
     */
    const simulateUploadProgress = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    clearInterval(interval);
                    setState((prev) => ({ ...prev, uploadProgress: 100 }));
                    resolve();
                } else {
                    setState((prev) => ({ ...prev, uploadProgress: Math.min(progress, 95) }));
                }
            }, 200);
        });
    }, []);

    /**
     * Upload image to server (placeholder)
     */
    const uploadImage = useCallback(
        async (image: ImagePickerResult): Promise<string | null> => {
            try {
                // Compress image first
                const compressed = await compressImage(image.uri, {
                    maxWidth: 400,
                    maxHeight: 400,
                    quality: 0.8,
                    format: 'jpeg',
                });

                // Simulate upload progress
                await simulateUploadProgress();

                // API upload will go here
                // const response = await api.uploadAvatar(compressed.uri);
                // return response.url;

                // For now, return the local URI as mock
                console.log('Avatar uploaded:', compressed.uri);
                return compressed.uri;
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        },
        [simulateUploadProgress]
    );

    /**
     * Handle image selection from library
     */
    const pickFromLibrary = useCallback(async () => {
        try {
            setState({ ...initialState, isUploading: true });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await pickImageFromLibrary({
                allowsEditing: true,
                aspect: [1, 1], // Square for avatar
                quality: 0.8,
            });

            if (!result) {
                setState(initialState);
                return { success: false, cancelled: true };
            }

            // Set preview immediately
            setState((prev) => ({
                ...prev,
                previewUri: result.uri,
            }));

            // Upload
            const uploadedUrl = await uploadImage(result);

            if (uploadedUrl) {
                dispatch(setAvatarUrl(uploadedUrl));
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setState((prev) => ({
                    ...prev,
                    isUploading: false,
                    uploadProgress: 100,
                }));
                return { success: true, url: uploadedUrl };
            }

            throw new Error('Upload failed');
        } catch (error) {
            console.error('Pick from library error:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('حدث خطأ أثناء رفع الصورة');
            return { success: false, error: 'حدث خطأ أثناء رفع الصورة' };
        }
    }, [dispatch, uploadImage, setError]);

    /**
     * Handle taking photo with camera
     */
    const takePhotoFromCamera = useCallback(async () => {
        try {
            setState({ ...initialState, isUploading: true });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await takePhoto({
                allowsEditing: true,
                aspect: [1, 1], // Square for avatar
                quality: 0.8,
            });

            if (!result) {
                setState(initialState);
                return { success: false, cancelled: true };
            }

            // Set preview immediately
            setState((prev) => ({
                ...prev,
                previewUri: result.uri,
            }));

            // Upload
            const uploadedUrl = await uploadImage(result);

            if (uploadedUrl) {
                dispatch(setAvatarUrl(uploadedUrl));
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setState((prev) => ({
                    ...prev,
                    isUploading: false,
                    uploadProgress: 100,
                }));
                return { success: true, url: uploadedUrl };
            }

            throw new Error('Upload failed');
        } catch (error) {
            console.error('Take photo error:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('حدث خطأ أثناء رفع الصورة');
            return { success: false, error: 'حدث خطأ أثناء رفع الصورة' };
        }
    }, [dispatch, uploadImage, setError]);

    /**
     * Remove avatar
     */
    const removeAvatar = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // API call will go here
            // await api.removeAvatar();

            dispatch(setAvatarUrl(undefined));
            reset();

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true };
        } catch (error) {
            console.error('Remove avatar error:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, error: 'حدث خطأ أثناء إزالة الصورة' };
        }
    }, [dispatch, reset]);

    return {
        // State
        isUploading: state.isUploading,
        uploadProgress: state.uploadProgress,
        previewUri: state.previewUri,
        error: state.error,
        // Actions
        pickFromLibrary,
        takePhotoFromCamera,
        removeAvatar,
        reset,
    };
}

export default useAvatarUpload;
