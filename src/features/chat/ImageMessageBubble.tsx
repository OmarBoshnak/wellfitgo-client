/**
 * ImageMessageBubble Component
 * @description Image message with lazy loading and tap to expand
 */

import React, { memo, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';
import type { Message } from '@/src/shared/types/chat';
import { calculateDisplayDimensions } from '@/src/shared/utils/media';

// ============================================================================
// Types
// ============================================================================

export interface ImageMessageBubbleProps {
    message: Message;
    isUser: boolean;
    isRTL?: boolean;
    onPress?: () => void;
    isLoading?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_IMAGE_WIDTH = Dimensions.get('window').width * 0.6;
const MAX_IMAGE_HEIGHT = 250;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Component
// ============================================================================

const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = memo(({
    message,
    isUser,
    isRTL = false,
    onPress,
    isLoading = false,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const insets = useSafeAreaInsets();

    // Calculate display dimensions
    const imageDimensions = calculateDisplayDimensions(
        message.mediaWidth || 400,
        message.mediaHeight || 300,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT
    );

    /**
     * Handle image press
     */
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            setIsFullscreen(true);
        }
    };

    /**
     * Handle image error
     */
    const handleError = () => {
        setImageError(true);
    };

    if (!message.mediaUrl) {
        return null;
    }

    return (
        <>
            <TouchableOpacity
                style={[styles.container, imageDimensions]}
                activeOpacity={0.9}
                onPress={handlePress}
                accessibilityLabel="صورة - اضغط للتكبير"
                accessibilityRole="image"
            >
                {isLoading ? (
                    <View style={[styles.loadingContainer, imageDimensions]}>
                        <ActivityIndicator size="small" color={isUser ? colors.white : colors.primaryDark} />
                    </View>
                ) : imageError ? (
                    <View style={[styles.errorContainer, imageDimensions]}>
                        <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                    </View>
                ) : (
                    <Image
                        source={{ uri: message.mediaUrl }}
                        style={[styles.image, imageDimensions]}
                        contentFit="cover"
                        transition={200}
                        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                        onError={handleError}
                    />
                )}
            </TouchableOpacity>

            {/* Fullscreen Modal */}
            <Modal
                visible={isFullscreen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsFullscreen(false)}
            >
                <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles.closeButton, { top: insets.top + 10 }]}
                        onPress={() => setIsFullscreen(false)}
                        accessibilityLabel="إغلاق"
                        accessibilityRole="button"
                    >
                        <Ionicons name="close" size={28} color={colors.white} />
                    </TouchableOpacity>

                    {/* Fullscreen Image */}
                    <Image
                        source={{ uri: message.mediaUrl }}
                        style={styles.fullscreenImage}
                        contentFit="contain"
                        transition={300}
                    />
                </View>
            </Modal>
        </>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.bgSecondary,
    },
    image: {
        borderRadius: 12,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
});

ImageMessageBubble.displayName = 'ImageMessageBubble';

export default ImageMessageBubble;
