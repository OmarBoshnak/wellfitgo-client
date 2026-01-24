/**
 * Media Utilities Barrel Export
 * @description Centralized exports for all media utilities
 */

// Image Picker
export {
    requestMediaLibraryPermission,
    requestCameraPermission,
    pickImageFromLibrary,
    takePhoto,
    compressImage,
    pickAndCompressImage,
    getImageDimensions,
    calculateDisplayDimensions,
    formatFileSize,
} from './imagePicker';
export type { ImagePickerResult, CompressionOptions } from './imagePicker';

// Audio Recorder
export {
    requestMicrophonePermission,
    setAudioModeForRecording,
    setAudioModeForPlayback,
    AudioRecorderManager,
    AudioPlayerManager,
    formatDuration,
    generateWaveformBars,
    audioRecorder,
    audioPlayer,
} from './audioRecorder';
export type { AudioRecorderResult, AudioPlaybackState } from './audioRecorder';

// Media Cache
export {
    isMediaCached,
    getCachedMediaUri,
    cacheMedia,
    cacheLocalMedia,
    removeCachedMedia,
    clearMediaCache,
    getCacheStats,
    formatCacheSize,
} from './mediaCache';
export type { CacheEntry, CacheStats } from './mediaCache';
