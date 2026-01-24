/**
 * VoiceRecorder Component
 * @description Voice recording interface with waveform and controls
 */

import React, { memo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { formatDuration, generateWaveformBars } from '@/src/shared/utils/media';

// ============================================================================
// Types
// ============================================================================

export interface VoiceRecorderProps {
    isVisible: boolean;
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    meteringValues: number[];
    onSend: () => void;
    onCancel: () => void;
    onPause: () => void;
    onResume: () => void;
}

// ============================================================================
// Component
// ============================================================================

const VoiceRecorder: React.FC<VoiceRecorderProps> = memo(({
    isVisible,
    isRecording,
    isPaused,
    duration,
    meteringValues,
    onSend,
    onCancel,
    onPause,
    onResume,
}) => {
    const isRTL = I18nManager.isRTL;
    const recordingPulse = useSharedValue(1);

    // Pulse animation for recording indicator
    useEffect(() => {
        if (isRecording && !isPaused) {
            recordingPulse.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1
            );
        } else {
            recordingPulse.value = withTiming(1, { duration: 200 });
        }
    }, [isRecording, isPaused, recordingPulse]);

    /**
     * Recording indicator animated style
     */
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: recordingPulse.value }],
    }));

    /**
     * Generate waveform bars
     */
    const waveformBars = generateWaveformBars(meteringValues, 35);

    if (!isVisible) return null;

    return (
        <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Cancel Button */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onCancel();
                    }}
                    accessibilityLabel="إلغاء التسجيل"
                    accessibilityRole="button"
                >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>

                {/* Waveform & Duration */}
                <View style={styles.waveformContainer}>
                    {/* Recording Indicator */}
                    <Animated.View style={[styles.recordingDot, pulseStyle]}>
                        <View style={[
                            styles.recordingDotInner,
                            isPaused && styles.recordingDotPaused
                        ]} />
                    </Animated.View>

                    {/* Waveform Visualization */}
                    <View style={styles.waveform}>
                        {waveformBars.map((height, index) => (
                            <Animated.View
                                key={index}
                                entering={FadeIn.delay(index * 10)}
                                style={[
                                    styles.waveformBar,
                                    {
                                        height: verticalScale(6 + height * 20),
                                        backgroundColor: isPaused
                                            ? colors.textSecondary
                                            : colors.primaryDark,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Duration */}
                    <Text style={styles.duration}>
                        {formatDuration(duration)}
                    </Text>
                </View>

                {/* Pause/Resume Button */}
                <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        isPaused ? onResume() : onPause();
                    }}
                    accessibilityLabel={isPaused ? 'استئناف التسجيل' : 'إيقاف مؤقت'}
                    accessibilityRole="button"
                >
                    <Ionicons
                        name={isPaused ? 'play' : 'pause'}
                        size={22}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>

                {/* Send Button */}
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        onSend();
                    }}
                    disabled={duration < 0.5}
                    accessibilityLabel="إرسال الرسالة الصوتية"
                    accessibilityRole="button"
                >
                    <Ionicons name="send" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
                {isPaused
                    ? 'التسجيل متوقف مؤقتاً'
                    : 'جاري التسجيل... اضغط على الإرسال عند الانتهاء'}
            </Text>
        </Animated.View>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(12),
        ...shadows.light,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    cancelButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveformContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: 20,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(10),
        gap: horizontalScale(8),
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
    },
    recordingDotPaused: {
        backgroundColor: colors.textSecondary,
    },
    waveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: verticalScale(30),
    },
    waveformBar: {
        width: 3,
        borderRadius: 1.5,
    },
    duration: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.textPrimary,
        minWidth: horizontalScale(40),
        textAlign: 'center',
    },
    pauseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    instructions: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: verticalScale(8),
    },
});

VoiceRecorder.displayName = 'VoiceRecorder';

export default VoiceRecorder;
