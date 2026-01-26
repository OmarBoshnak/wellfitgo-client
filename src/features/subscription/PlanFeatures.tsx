/**
 * PlanFeatures Component
 * @description Feature list with checkmarks for subscription plans
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { PlanFeature } from '@/src/shared/types/subscription';

interface PlanFeaturesProps {
    /** List of features to display */
    features: PlanFeature[];
    /** Number of columns (1 or 2) */
    columns?: 1 | 2;
    /** Section title */
    title?: string;
}

/**
 * Individual feature item
 */
const FeatureItem = memo(function FeatureItem({
    feature,
    index,
}: {
    feature: PlanFeature;
    index: number;
}) {
    return (
        <Animated.View
            entering={FadeInUp.delay(100 + index * 50).duration(300)}
            style={styles.featureItem}
        >
            <Text style={styles.featureText}>{feature.textAr}</Text>
            <View style={styles.checkContainer}>
                <LinearGradient
                    colors={gradients.primary}
                    style={styles.checkGradient}
                >
                    <Ionicons
                        name="checkmark"
                        size={horizontalScale(14)}
                        color={colors.white}
                    />
                </LinearGradient>
            </View>
        </Animated.View>
    );
});

/**
 * PlanFeatures - Features list with gradient checkmarks
 */
function PlanFeatures({
    features,
    columns = 2,
    title = 'ما مميزات الاشتراك مع WellFitGo',
}: PlanFeaturesProps) {
    // Split features into columns if needed
    const renderFeatures = () => {
        if (columns === 1) {
            return (
                <View style={styles.singleColumn}>
                    {features.map((feature, index) => (
                        <FeatureItem key={feature.id} feature={feature} index={index} />
                    ))}
                </View>
            );
        }

        // Two columns
        const midPoint = Math.ceil(features.length / 2);
        const leftColumn = features.slice(0, midPoint);
        const rightColumn = features.slice(midPoint);

        return (
            <View style={styles.twoColumns}>
                <View style={styles.column}>
                    {leftColumn.map((feature, index) => (
                        <FeatureItem key={feature.id} feature={feature} index={index} />
                    ))}
                </View>
                <View style={styles.column}>
                    {rightColumn.map((feature, index) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                            index={index + midPoint}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {renderFeatures()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: horizontalScale(20),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(20),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(16),
        textAlign: 'center',
    },
    singleColumn: {
        gap: verticalScale(12),
    },
    twoColumns: {
        flexDirection: 'row',
        gap: horizontalScale(16),
    },
    column: {
        flex: 1,
        gap: verticalScale(12),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(10),
    },
    checkContainer: {
        borderRadius: horizontalScale(10),
        overflow: 'hidden',
    },
    checkGradient: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
        fontSize: ScaleFontSize(13),
        fontWeight: '500',
        color: colors.textPrimary,
        textAlign: 'right'
    },
});

export default memo(PlanFeatures);
