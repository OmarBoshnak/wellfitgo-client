/**
 * VoiceMessageBubble Component
 * @description Voice message player with waveform visualization, speed control, and status indicators
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, ScaleFontSize, verticalScale } from '@/src/shared/core/utils/scaling';
import type { Message } from '@/src/shared/types/chat';
import { audioPlayer, formatDuration, generateWaveformBars } from '@/src/shared/utils/media';
import { useAppSelector } from '@/src/shared/store';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';

// Playback speed options
const SPEED_OPTIONS = [1, 1.5, 2] as const;
type PlaybackSpeed = typeof SPEED_OPTIONS[number];

// Backend URL for transforming localhost URLs
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wellfitgo-backend-97b72a680866.herokuapp.com';

/**
 * Transform localhost URLs to actual backend URL for device playback
 */
const transformAudioUrl = (url: string): string => {
    if (!url) return url;

    // If URL contains localhost or 127.0.0.1, replace with actual backend
    if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
        // Extract the path after the port
        const pathMatch = url.match(/(?:localhost|127\.0\.0\.1):\d+(\/.*)/);
        if (pathMatch && pathMatch[1]) {
            const path = pathMatch[1];
            // Ensure BACKEND_URL doesn't have trailing slash
            const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
            return `${baseUrl}${path}`;
        }
    }

    return url;
};

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
    const [loadError, setLoadError] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const progressWidth = useSharedValue(0);
    const isActiveRef = React.useRef(false);
    const loadTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get auth token for authenticated audio download
    const token = useAppSelector(selectToken);

    // Message status helpers
    const isSending = message.isOptimistic && message.status === 'sending';
    const isFailed = message.status === 'failed';

    /**
     * Handle speed toggle
     */
    const handleSpeedToggle = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPlaybackSpeed(current => {
            const currentIndex = SPEED_OPTIONS.indexOf(current);
            const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
            const newSpeed = SPEED_OPTIONS[nextIndex];

            // Update player rate if currently playing
            if (isPlaying && audioPlayer.currentUri) {
                audioPlayer.setRate(newSpeed);
            }

            return newSpeed;
        });
    }, [isPlaying]);

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

        if (isLoading) {
            console.log('[VoiceMessageBubble] Already loading, ignoring press');
            return;
        }

        if (isPlaying) {
            console.log('[VoiceMessageBubble] Pausing playback');
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
            }
            await audioPlayer.pause();
            setIsPlaying(false);
        } else {
            // Transform URL for device playback (replace localhost with actual backend)
            let playUrl = transformAudioUrl(message.mediaUrl);
            console.log('[VoiceMessageBubble] Starting playback from URL:', playUrl);

            setIsLoading(true);
            setLoadError(false);
            isActiveRef.current = true;

            // Set timeout for loading (15 seconds - increased for download)
            loadTimeoutRef.current = setTimeout(() => {
                console.error('[VoiceMessageBubble] Audio loading timeout');
                setIsLoading(false);
                setLoadError(true);
                setIsPlaying(false);
                isActiveRef.current = false;
                audioPlayer.unload();
            }, 15000);

            try {
                // iOS FIX: Download remote audio to local cache first
                // expo-audio hangs when streaming remote audio on iOS
                if (playUrl.startsWith('http')) {
                    console.log('[VoiceMessageBubble] Downloading audio for iOS playback...');

                    // Create a unique filename based on the URL
                    const urlHash = playUrl.split('/').pop() || message.id;
                    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
                    const localPath = `${cacheDir}voice_${urlHash}.m4a`;

                    // Check if already cached
                    const fileInfo = await FileSystem.getInfoAsync(localPath);

                    if (fileInfo.exists) {
                        console.log('[VoiceMessageBubble] Using cached audio file:', localPath);
                        playUrl = localPath;
                    } else {
                        console.log('[VoiceMessageBubble] Downloading to:', localPath);
                        try {
                            // Download with Authorization header for authenticated endpoints
                            const downloadResult = await FileSystem.downloadAsync(playUrl, localPath, {
                                headers: token ? {
                                    'Authorization': `Bearer ${token}`,
                                } : undefined,
                            });

                            if (downloadResult.status !== 200) {
                                console.error('[VoiceMessageBubble] Download failed with status:', downloadResult.status);
                                throw new Error(`Download failed with status ${downloadResult.status}`);
                            }

                            console.log('[VoiceMessageBubble] Download complete, status:', downloadResult.status);

                            playUrl = downloadResult.uri;
                            console.log('[VoiceMessageBubble] Local URI:', playUrl);
                        } catch (downloadError: any) {
                            console.error('[VoiceMessageBubble] Download failed:', downloadError?.message);
                            throw new Error(`Failed to download audio: ${downloadError?.message}`);
                        }
                    }
                }

                await audioPlayer.loadAndPlay(playUrl, (status) => {
                    // Clear timeout on first status update (means audio started loading)
                    if (loadTimeoutRef.current && status.isLoaded) {
                        clearTimeout(loadTimeoutRef.current);
                        loadTimeoutRef.current = null;
                    }

                    // Check if we are still the active player
                    if (!isActiveRef.current) return;

                    // Compare with current playUrl (could be local cached path)
                    if (audioPlayer.currentUri !== playUrl) {
                        setIsPlaying(false);
                        isActiveRef.current = false;
                        return;
                    }

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

                // Clear timeout if load succeeded
                if (loadTimeoutRef.current) {
                    clearTimeout(loadTimeoutRef.current);
                    loadTimeoutRef.current = null;
                }

                setIsPlaying(true);
                setLoadError(false);
            } catch (error) {
                console.error('[VoiceMessageBubble] Failed to play audio:', error);

                // Clear timeout
                if (loadTimeoutRef.current) {
                    clearTimeout(loadTimeoutRef.current);
                    loadTimeoutRef.current = null;
                }

                // Reset state
                setIsPlaying(false);
                setProgress(0);
                progressWidth.value = 0;
                isActiveRef.current = false;
                setLoadError(true);
            } finally {
                setIsLoading(false);
            }
        }
    }, [message.mediaUrl, message.id, isPlaying, isLoading, progressWidth, token]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear timeout
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
            }
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
                disabled={isLoading || isSending}
                accessibilityLabel={isPlaying ? 'إيقاف التشغيل' : 'تشغيل الرسالة الصوتية'}
                accessibilityRole="button"
            >
                {isLoading || isSending ? (
                    <Ionicons name="hourglass" size={20} color={primaryColor} />
                ) : loadError || isFailed ? (
                    <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
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

            {/* Duration and Speed Control */}
            <View style={styles.controlsContainer}>
                {/* Duration */}
                <Text style={[styles.duration, { color: textColor }]}>
                    {formatDuration(message.mediaDuration || 0)}
                </Text>

                {/* Speed Control Button */}
                <TouchableOpacity
                    style={[styles.speedButton, { backgroundColor: secondaryColor }]}
                    onPress={handleSpeedToggle}
                    accessibilityLabel={`سرعة التشغيل ${playbackSpeed}x`}
                    accessibilityRole="button"
                >
                    <Text style={[styles.speedText, { color: textColor }]}>
                        {playbackSpeed}x
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Status Indicator */}
            {(isSending || isFailed) && (
                <View style={styles.statusContainer}>
                    {isSending && (
                        <Ionicons name="time-outline" size={12} color={textColor} />
                    )}
                    {isFailed && (
                        <TouchableOpacity accessibilityLabel="فشل الإرسال - اضغط للإعادة">
                            <Ionicons name="refresh" size={14} color="#ff6b6b" />
                        </TouchableOpacity>
                    )}
                </View>
            )}
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
        gap: horizontalScale(8),
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
    controlsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: verticalScale(2),
    },
    duration: {
        fontSize: ScaleFontSize(11),
        fontWeight: '500',
        minWidth: horizontalScale(35),
        textAlign: 'center',
    },
    speedButton: {
        paddingHorizontal: horizontalScale(6),
        paddingVertical: verticalScale(2),
        borderRadius: horizontalScale(8),
        minWidth: horizontalScale(30),
        alignItems: 'center',
    },
    speedText: {
        fontSize: ScaleFontSize(9),
        fontWeight: '600',
    },
    statusContainer: {
        position: 'absolute',
        bottom: verticalScale(-2),
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(2),
    },
});

VoiceMessageBubble.displayName = 'VoiceMessageBubble';

export default VoiceMessageBubble;
