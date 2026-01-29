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
    const isActiveRef = React.useRef(false);

    // Generate waveform bars
    // Use message.meteringValues if available, otherwise generate a "visual" fallback pattern
    const waveformBars = React.useMemo(() => {
        if (message.meteringValues && message.meteringValues.length > 0) {
            return generateWaveformBars(message.meteringValues, 25);
        }
        // Fallback: generate a random-looking but consistent pattern based on message ID
        const seed = message.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const fallbackValues = Array.from({ length: 25 }, (_, i) => {
            // Sine wave + noise
            return 0.3 + (Math.sin(i * 0.5 + seed) * 0.2) + (Math.random() * 0.2);
        });
        return fallbackValues;
    }, [message.meteringValues, message.id]);

    /**
     * Handle play/pause
     */
    const handlePlayPause = useCallback(async () => {
        console.log('[VoiceMessageBubble] Play/pause pressed, mediaUrl:', message.mediaUrl);

        if (!message.mediaUrl) {
            console.error('[VoiceMessageBubble] No mediaUrl available');
            return;
        }

        if (isPlaying) {
            console.log('[VoiceMessageBubble] Pausing playback');
            await audioPlayer.pause();
            setIsPlaying(false);
        } else {
            console.log('[VoiceMessageBubble] Starting playback from MongoDB URL:', message.mediaUrl);
            setIsLoading(true);
            isActiveRef.current = true;
            try {
                await audioPlayer.loadAndPlay(message.mediaUrl, (status) => {
                    // Check if we are still the active player
                    if (!isActiveRef.current && status.isPlaying) {
                        // We were active, but now we are receiving updates. 
                        // If we are playing, it means we are still the player.
                        // But if currentUri doesn't match, we should stop.
                        if (audioPlayer.currentUri !== message.mediaUrl) {
                            setIsPlaying(false);
                            isActiveRef.current = false;
                            return;
                        }
                    }

                    // console.log('[VoiceMessageBubble] Status update received:', status);
                    setProgress(status.progress);
                    progressWidth.value = status.progress * 100;
                    setIsPlaying(status.isPlaying);

                    if (!status.isLoaded || status.progress >= 1) {
                        setIsPlaying(false);
                        setProgress(0);
                        progressWidth.value = 0;
                        if (status.progress >= 1) {
                            isActiveRef.current = false;
                        }
                    }
                });
                setIsPlaying(true);
            } catch (error) {
                console.error('[VoiceMessageBubble] Failed to play audio from MongoDB:', error);

                // Reset state
                setIsPlaying(false);
                setProgress(0);
                progressWidth.value = 0;
                isActiveRef.current = false;

                // Show user feedback about MongoDB audio issue
                // Could show a toast or inline error message
            } finally {
                setIsLoading(false);
            }
        }
    }, [message.mediaUrl, isPlaying, progressWidth]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Only unload if we are the one playing
            if (isActiveRef.current) {
                audioPlayer.unload();
            }
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
