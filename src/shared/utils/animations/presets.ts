/**
 * Animation Presets
 * @description Reusable animation configurations for consistent UI
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeInRight,
    SlideInDown,
    SlideInRight,
    SlideOutDown,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';

// ============================================================================
// Spring Configurations
// ============================================================================

export const springConfigs = {
    /** Bouncy spring - great for checkboxes, toggles */
    bouncy: {
        damping: 12,
        stiffness: 200,
        mass: 0.8,
    },
    /** Smooth spring - great for page transitions */
    smooth: {
        damping: 20,
        stiffness: 150,
        mass: 1,
    },
    /** Stiff spring - great for subtle feedback */
    stiff: {
        damping: 25,
        stiffness: 300,
        mass: 0.5,
    },
    /** Gentle spring - great for cards, modals */
    gentle: {
        damping: 18,
        stiffness: 120,
        mass: 1,
    },
} as const;

// ============================================================================
// Animation Helpers
// ============================================================================

/**
 * Create a spring animation with preset
 */
export const springWithPreset = (
    toValue: number,
    preset: keyof typeof springConfigs = 'smooth'
) => {
    return withSpring(toValue, springConfigs[preset]);
};

/**
 * Create a bounce animation sequence
 */
export const bounceAnimation = (
    fromValue: number,
    toValue: number,
    overshoot: number = 1.1
) => {
    return withSequence(
        withSpring(toValue * overshoot, springConfigs.bouncy),
        withSpring(toValue, springConfigs.stiff)
    );
};

/**
 * Create a scale pulse animation
 */
export const scalePulse = (scale: number = 1.05) => {
    return withSequence(
        withSpring(scale, springConfigs.stiff),
        withSpring(1, springConfigs.smooth)
    );
};

// ============================================================================
// Entering Animations
// ============================================================================

export const enteringAnimations = {
    /** Fade in from bottom */
    fadeInUp: FadeInUp.duration(400).springify().damping(20),
    /** Fade in from top */
    fadeInDown: FadeInDown.duration(400).springify().damping(20),
    /** Fade in from right (RTL aware) */
    fadeInRight: FadeInRight.duration(400).springify().damping(20),
    /** Simple fade */
    fadeIn: FadeIn.duration(300),
    /** Slide from bottom */
    slideInBottom: SlideInDown.duration(400).springify().damping(18),
    /** Slide from right */
    slideInRight: SlideInRight.duration(400).springify().damping(18),
    /** Zoom in */
    zoomIn: ZoomIn.duration(300).springify().damping(20),
} as const;

export const exitingAnimations = {
    /** Slide to bottom */
    slideOutBottom: SlideOutDown.duration(300),
    /** Zoom out */
    zoomOut: ZoomOut.duration(200),
} as const;

// ============================================================================
// Staggered Animations
// ============================================================================

/**
 * Get staggered delay for list items
 * @param index - Item index
 * @param baseDelay - Base delay in ms (default 50)
 * @param maxDelay - Maximum delay cap (default 400)
 */
export const getStaggerDelay = (
    index: number,
    baseDelay: number = 50,
    maxDelay: number = 400
): number => {
    return Math.min(index * baseDelay, maxDelay);
};

/**
 * Create staggered fade in animation
 */
export const staggeredFadeInUp = (index: number, baseDelay: number = 50) => {
    return FadeInUp.delay(getStaggerDelay(index, baseDelay))
        .duration(400)
        .springify()
        .damping(20);
};

/**
 * Create staggered fade in from right animation
 */
export const staggeredFadeInRight = (index: number, baseDelay: number = 50) => {
    return FadeInRight.delay(getStaggerDelay(index, baseDelay))
        .duration(400)
        .springify()
        .damping(20);
};

// ============================================================================
// Haptic Feedback
// ============================================================================

/**
 * Trigger light haptic feedback
 */
export const hapticLight = async () => {
    if (Platform.OS !== 'web') {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
            // Haptics not available
        }
    }
};

/**
 * Trigger medium haptic feedback
 */
export const hapticMedium = async () => {
    if (Platform.OS !== 'web') {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
            // Haptics not available
        }
    }
};

/**
 * Trigger success haptic feedback
 */
export const hapticSuccess = async () => {
    if (Platform.OS !== 'web') {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
            // Haptics not available
        }
    }
};

/**
 * Trigger error haptic feedback
 */
export const hapticError = async () => {
    if (Platform.OS !== 'web') {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {
            // Haptics not available
        }
    }
};

/**
 * Trigger selection haptic feedback
 */
export const hapticSelection = async () => {
    if (Platform.OS !== 'web') {
        try {
            await Haptics.selectionAsync();
        } catch {
            // Haptics not available
        }
    }
};

// ============================================================================
// Timing Configurations
// ============================================================================

export const timingConfigs = {
    /** Quick timing - 150ms */
    quick: { duration: 150, easing: Easing.out(Easing.quad) },
    /** Normal timing - 250ms */
    normal: { duration: 250, easing: Easing.out(Easing.cubic) },
    /** Slow timing - 400ms */
    slow: { duration: 400, easing: Easing.out(Easing.cubic) },
} as const;

/**
 * Create a timing animation with preset
 */
export const timingWithPreset = (
    toValue: number,
    preset: keyof typeof timingConfigs = 'normal'
) => {
    return withTiming(toValue, timingConfigs[preset]);
};
