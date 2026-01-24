/**
 * SuccessImage Component
 * @description Hero image with optimized loading and fade-in animation
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';

interface SuccessImageProps {
    /** Image source URI or require */
    source?: string | number;
    /** Animation delay in ms */
    delay?: number;
}

// Placeholder image for success screen
const DEFAULT_SUCCESS_IMAGE = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80';

/**
 * SuccessImage - Hero image with soft shadow and rounded corners
 */
function SuccessImage({
    source = DEFAULT_SUCCESS_IMAGE,
    delay = 300,
}: SuccessImageProps) {
    return (
        <Animated.View
            entering={FadeIn.delay(delay).duration(600)}
            style={styles.container}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={typeof source === 'string' ? { uri: source } : source}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                    placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                />
                {/* Gradient overlay for depth */}
                <View style={styles.overlay} />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(20),
        marginVertical: verticalScale(16),
    },
    imageWrapper: {
        borderRadius: horizontalScale(24),
        overflow: 'hidden',
        ...shadows.light,
    },
    image: {
        width: '100%',
        aspectRatio: 4 / 3,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
});

export default memo(SuccessImage);
