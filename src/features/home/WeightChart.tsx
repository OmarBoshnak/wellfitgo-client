/**
 * WeightChart Component
 * @description Weekly weight visualization with line graph
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { WeightEntry } from '@/src/shared/types/home';

interface WeightChartProps {
    /** Weight data points */
    data: WeightEntry[];
    /** Chart height */
    height?: number;
    /** Show day labels */
    showLabels?: boolean;
    /** Show dots on data points */
    showDots?: boolean;
}

const DAYS_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

/**
 * WeightChart - Line chart for weekly weight data
 */
function WeightChart({
    data,
    height = 120,
    showLabels = true,
    showDots = true,
}: WeightChartProps) {
    const chartWidth = horizontalScale(280);
    const chartHeight = height;
    const paddingX = horizontalScale(20);
    const paddingY = verticalScale(20);

    const chartData = useMemo(() => {
        if (data.length === 0) return { path: '', dots: [], labels: [], min: 0, max: 0 };

        const weights = data.map(d => d.weight);
        const min = Math.min(...weights) - 0.5;
        const max = Math.max(...weights) + 0.5;
        const range = max - min || 1;

        const effectiveWidth = chartWidth - paddingX * 2;
        const effectiveHeight = chartHeight - paddingY * 2;

        const points = data.map((entry, index) => {
            const x = paddingX + (index / (data.length - 1 || 1)) * effectiveWidth;
            const y = paddingY + (1 - (entry.weight - min) / range) * effectiveHeight;
            return { x, y, weight: entry.weight, date: entry.date };
        });

        // Create smooth curve path
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        // Create labels
        const labels = data.map((entry, index) => {
            const date = new Date(entry.date);
            return {
                x: paddingX + (index / (data.length - 1 || 1)) * effectiveWidth,
                text: DAYS_AR[date.getDay()],
            };
        });

        return { path, dots: points, labels, min, max };
    }, [data, chartWidth, chartHeight, paddingX, paddingY]);

    if (data.length === 0) {
        return (
            <View style={[styles.container, { height }]}>
                <Text style={styles.emptyText}>لا توجد بيانات</Text>
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.container, { height: height + (showLabels ? 30 : 0) }]}
            accessibilityLabel={`رسم بياني للوزن الأسبوعي، أدنى وزن ${chartData.min.toFixed(1)} كجم، أعلى وزن ${chartData.max.toFixed(1)} كجم`}
        >
            <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                    <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={gradients.primary[0]} />
                        <Stop offset="100%" stopColor={gradients.primary[1]} />
                    </LinearGradient>
                    <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={gradients.primary[0]} stopOpacity={0.2} />
                        <Stop offset="100%" stopColor={gradients.primary[0]} stopOpacity={0} />
                    </LinearGradient>
                </Defs>

                {/* Grid lines */}
                <Line
                    x1={paddingX}
                    y1={chartHeight - paddingY}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY}
                    stroke={colors.border}
                    strokeWidth={1}
                />

                {/* Area fill */}
                <Path
                    d={`${chartData.path} L ${chartData.dots[chartData.dots.length - 1]?.x} ${chartHeight - paddingY} L ${paddingX} ${chartHeight - paddingY} Z`}
                    fill="url(#areaGradient)"
                />

                {/* Line */}
                <Path
                    d={chartData.path}
                    stroke="url(#chartGradient)"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Dots */}
                {showDots && chartData.dots.map((dot, index) => (
                    <React.Fragment key={index}>
                        <Circle
                            cx={dot.x}
                            cy={dot.y}
                            r={6}
                            fill={colors.white}
                            stroke={colors.primaryDark}
                            strokeWidth={2}
                        />
                        <Circle
                            cx={dot.x}
                            cy={dot.y}
                            r={3}
                            fill={colors.primaryDark}
                        />
                    </React.Fragment>
                ))}

                {/* Day labels */}
                {showLabels && chartData.labels.map((label, index) => (
                    <SvgText
                        key={index}
                        x={label.x}
                        y={chartHeight - 5}
                        fill={colors.textSecondary}
                        fontSize={ScaleFontSize(10)}
                        textAnchor="middle"
                    >
                        {label.text}
                    </SvgText>
                ))}
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default memo(WeightChart);
