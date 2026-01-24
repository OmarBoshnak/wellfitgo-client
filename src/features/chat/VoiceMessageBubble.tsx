/**
 * VoiceMessageBubble Component
 * @description Voice message player with waveform visualization
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import type { Message } from '@/src/shared/types/chat';
import { audioPlayer, formatDuration, generateWaveformBars } from '@/src/shared/utils/media';

// ============================================================================
// Types
// ============================================================================

export interface VoiceMessageBubbleProps {
    message: Message;
    isUser: boolean;
    isRTL?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = memo(({
    message,
    isUser,
    isRTL = false,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const progressWidth = useSharedValue(0);

    // Generate waveform bars (mock data for now)
    const waveformBars = generateWaveformBars([], 25);

    /**
     * Handle play/pause
     */
    const handlePlayPause = useCallback(async () => {
        if (!message.mediaUrl) return;

        if (isPlaying) {
            await audioPlayer.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            try {
                await audioPlayer.loadAndPlay(message.mediaUrl, (status) => {
                    setProgress(status.progress);
                    progressWidth.value = status.progress * 100;
                    setIsPlaying(status.isPlaying);

                    if (!status.isLoaded || status.progress >= 1) {
                        setIsPlaying(false);
                        setProgress(0);
                        progressWidth.value = 0;
                    }
                });
                setIsPlaying(true);
            } catch (error) {
                console.error('Failed to play audio:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [message.mediaUrl, isPlaying, progressWidth]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            audioPlayer.unload();
        };
    }, []);

    /**
     * Progress bar animated style
     */
    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    const primaryColor = isUser ? colors.white : colors.primaryDark;
    const secondaryColor = isUser ? 'rgba(255,255,255,0.3)' : colors.primaryLightBg;
    const textColor = isUser ? colors.white : colors.textPrimary;

    return (
        <View style={styles.container}>
            {/* Play/Pause Button */}
            <TouchableOpacity
                style={[styles.playButton, { backgroundColor: secondaryColor }]}
                onPress={handlePlayPause}
                disabled={isLoading}
                accessibilityLabel={isPlaying ? 'إيقاف التشغيل' : 'تشغيل الرسالة الصوتية'}
                accessibilityRole="button"
            >
                {isLoading ? (
                    <Ionicons name="hourglass" size={20} color={primaryColor} />
                ) : (
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={20}
                        color={primaryColor}
                    />
                )}
            </TouchableOpacity>

            {/* Waveform */}
            <View style={styles.waveformContainer}>
                <View style={styles.waveform}>
                    {waveformBars.map((height, index) => (
                        <View
                            key={index}
                            style={[
                                styles.waveformBar,
                                {
                                    height: verticalScale(8 + height * 14),
                                    backgroundColor:
                                        index / waveformBars.length <= progress
                                            ? primaryColor
                                            : secondaryColor,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Progress overlay */}
                <Animated.View style={[styles.progressOverlay, progressStyle]} />
            </View>

            {/* Duration */}
            <Text style={[styles.duration, { color: textColor }]}>
                {formatDuration(message.mediaDuration || 0)}
            </Text>
        </View>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: horizontalScale(200),
        paddingVertical: verticalScale(4),
        gap: horizontalScale(10),
    },
    playButton: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveformContainer: {
        flex: 1,
        position: 'relative',
        height: verticalScale(30),
        justifyContent: 'center',
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    waveformBar: {
        width: 3,
        borderRadius: 1.5,
    },
    progressOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    duration: {
        fontSize: ScaleFontSize(11),
        fontWeight: '500',
        minWidth: horizontalScale(35),
        textAlign: 'center',
    },
});

VoiceMessageBubble.displayName = 'VoiceMessageBubble';

export default VoiceMessageBubble;
