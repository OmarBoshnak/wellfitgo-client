/**
 * AttachmentMenu Component
 * @description Bottom sheet for selecting attachment type
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

// ============================================================================
// Types
// ============================================================================

export type AttachmentType = 'camera' | 'gallery' | 'document';

export interface AttachmentMenuProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (type: AttachmentType) => void;
}

// ============================================================================
// Component
// ============================================================================

const AttachmentMenu: React.FC<AttachmentMenuProps> = memo(({
    isVisible,
    onClose,
    onSelect,
}) => {
    /**
     * Handle selection
     */
    const handleSelect = useCallback((type: AttachmentType) => {
        Haptics.selectionAsync();
        onSelect(type);
        // Don't call onClose here - parent will handle modal closing
    }, [onSelect]);

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.backdrop}
            >
                <Pressable style={styles.backdropPress} onPress={onClose} />
            </Animated.View>

            {/* Menu Sheet */}
            <Animated.View
                entering={SlideInDown.springify().damping(18)}
                exiting={SlideOutDown.duration(150)}
                style={styles.sheet}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>إرفاق ملف</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {/* Camera */}
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleSelect('camera')}
                        accessibilityLabel="كاميرا"
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="camera" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.optionLabel}>كاميرا</Text>
                    </TouchableOpacity>

                    {/* Gallery */}
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleSelect('gallery')}
                        accessibilityLabel="معرض الصور"
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="images" size={24} color="#2E7D32" />
                        </View>
                        <Text style={styles.optionLabel}>صور</Text>
                    </TouchableOpacity>

                    {/* Document */}
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleSelect('document')}
                        accessibilityLabel="مستند"
                        accessibilityRole="button"
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                            <Ionicons name="document-text" size={24} color="#7B1FA2" />
                        </View>
                        <Text style={styles.optionLabel}>مستند</Text>
                    </TouchableOpacity>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    accessibilityLabel="إلغاء"
                    accessibilityRole="button"
                >
                    <Text style={styles.cancelLabel}>إلغاء</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropPress: {
        flex: 1,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: verticalScale(34),
        ...shadows.float,
    },
    header: {
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: verticalScale(24),
        paddingHorizontal: horizontalScale(16),
    },
    optionItem: {
        alignItems: 'center',
        gap: verticalScale(8),
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.light,
    },
    optionLabel: {
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
        fontWeight: '500',
    },
    cancelButton: {
        marginTop: verticalScale(8),
        marginHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(14),
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelLabel: {
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

AttachmentMenu.displayName = 'AttachmentMenu';

export default AttachmentMenu;
