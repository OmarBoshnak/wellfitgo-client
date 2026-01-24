/**
 * MessageList Component
 * @description Scrollable message list with virtualization
 */

import React, { memo, useCallback, useRef, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    I18nManager,
    RefreshControl,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import type { Message } from '@/src/shared/types/chat';
import MessageBubble from './MessageBubble';

// ============================================================================
// Types
// ============================================================================

export interface MessageListProps {
    messages: Message[];
    onMessageLongPress: (message: Message) => void;
    onImagePress?: (imageUrl: string) => void;
    onLoadMore?: () => void;
    onRefresh?: () => void;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    isRefreshing?: boolean;
    hasMoreMessages?: boolean;
    isTyping?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ESTIMATED_ITEM_HEIGHT = 80;

// ============================================================================
// Component
// ============================================================================

const MessageList: React.FC<MessageListProps> = memo(({
    messages,
    onMessageLongPress,
    onImagePress,
    onLoadMore,
    onRefresh,
    isLoading = false,
    isLoadingMore = false,
    isRefreshing = false,
    hasMoreMessages = false,
    isTyping = false,
}) => {
    const flatListRef = useRef<FlatList>(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const isRTL = I18nManager.isRTL;

    /**
     * Render individual message
     */
    const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
        const isUser = item.senderId !== 'doctor_1'; // TODO: Use actual current user ID
        return (
            <MessageBubble
                message={item}
                isUser={isUser}
                onLongPress={onMessageLongPress}
                isRTL={isRTL}
                onImagePress={onImagePress}
                index={messages.length - 1 - index}
            />
        );
    }, [onMessageLongPress, onImagePress, isRTL, messages.length]);

    /**
     * Key extractor
     */
    const keyExtractor = useCallback((item: Message) => item.id, []);

    /**
     * Get item layout for performance
     */
    const getItemLayout = useCallback((data: ArrayLike<Message> | null | undefined, index: number) => ({
        length: ESTIMATED_ITEM_HEIGHT,
        offset: ESTIMATED_ITEM_HEIGHT * index,
        index,
    }), []);

    /**
     * Render date separator
     */
    const renderDateSeparator = (date: string) => (
        <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.dateLine} />
        </View>
    );

    /**
     * Render typing indicator
     */
    const renderTypingIndicator = () => (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.typingContainer}
        >
            <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotMiddle]} />
                <View style={styles.typingDot} />
            </View>
        </Animated.View>
    );

    /**
     * Render empty state
     */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>لا توجد رسائل بعد</Text>
            <Text style={styles.emptySubtitle}>ابدأ المحادثة مع طبيبك</Text>
        </View>
    );

    /**
     * Render footer (loading more / typing)
     */
    const renderFooter = () => (
        <View style={styles.footer}>
            {isLoadingMore && (
                <ActivityIndicator size="small" color={colors.primaryDark} />
            )}
        </View>
    );

    /**
     * Render header (typing indicator at bottom since list is inverted)
     */
    const renderHeader = () => (
        <>
            {isTyping && renderTypingIndicator()}
        </>
    );

    /**
     * Handle scroll
     */
    const handleScroll = useCallback((event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToBottom(offsetY > 300);
    }, []);

    /**
     * Scroll to bottom
     */
    const scrollToBottom = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    /**
     * Handle end reached
     */
    const handleEndReached = useCallback(() => {
        if (hasMoreMessages && !isLoadingMore && onLoadMore) {
            onLoadMore();
        }
    }, [hasMoreMessages, isLoadingMore, onLoadMore]);

    if (isLoading && messages.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryDark} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                inverted
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
                ListHeaderComponent={renderHeader}
                removeClippedSubviews={true}
                windowSize={15}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primaryDark}
                            colors={[colors.primaryDark]}
                        />
                    ) : undefined
                }
                {...({} as any)}
            />

            {/* Scroll to bottom button */}
            {showScrollToBottom && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.scrollToBottomContainer}
                >
                    <TouchableOpacity
                        style={styles.scrollToBottomButton}
                        onPress={scrollToBottom}
                        accessibilityLabel="الذهاب للرسائل الجديدة"
                        accessibilityRole="button"
                    >
                        <Ionicons name="chevron-down" size={24} color={colors.white} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: verticalScale(12),
    },
    footer: {
        height: verticalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(100),
    },
    emptyTitle: {
        fontSize: ScaleFontSize(18),
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: verticalScale(16),
    },
    emptySubtitle: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        marginTop: verticalScale(4),
    },
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(12),
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dateText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        paddingHorizontal: horizontalScale(12),
        fontWeight: '500',
    },
    typingContainer: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(8),
        alignItems: 'flex-start',
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(12),
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        gap: 4,
        ...shadows.light,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textSecondary,
        opacity: 0.6,
    },
    typingDotMiddle: {
        opacity: 0.8,
    },
    scrollToBottomContainer: {
        position: 'absolute',
        bottom: verticalScale(16),
        right: horizontalScale(16),
    },
    scrollToBottomButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
});

MessageList.displayName = 'MessageList';

export default MessageList;
