/**
 * HomeErrorBoundary Component
 * @description Error boundary with retry for home sections
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onRetry?: () => void;
    sectionName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * HomeErrorBoundary - Error boundary for home screen sections
 */
class HomeErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('HomeErrorBoundary caught error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={styles.container}
                >
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={horizontalScale(48)}
                                color={colors.error}
                            />
                        </View>
                        <Text style={styles.title}>حدث خطأ</Text>
                        <Text style={styles.message}>
                            {this.props.sectionName
                                ? `تعذر تحميل ${this.props.sectionName}`
                                : 'تعذر تحميل هذا القسم'}
                        </Text>
                        <Pressable
                            onPress={this.handleRetry}
                            accessibilityRole="button"
                            accessibilityLabel="إعادة المحاولة"
                            style={styles.retryButton}
                        >
                            <Ionicons
                                name="refresh"
                                size={horizontalScale(18)}
                                color={colors.white}
                            />
                            <Text style={styles.retryText}>إعادة المحاولة</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(24),
        alignItems: 'center',
        ...shadows.light,
    },
    iconContainer: {
        width: horizontalScale(80),
        height: horizontalScale(80),
        borderRadius: horizontalScale(40),
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(8),
    },
    message: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: verticalScale(20),
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryDark,
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(12),
        borderRadius: horizontalScale(12),
        gap: horizontalScale(8),
    },
    retryText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.white,
    },
});

export default HomeErrorBoundary;
