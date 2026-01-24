/**
 * Chat Types
 * @description TypeScript interfaces for the chat system
 */

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message type enumeration
 */
export type MessageType = 'text' | 'image' | 'voice';

/**
 * Message delivery status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Individual message in a conversation
 */
export interface Message {
    id: string;
    conversationId: string;
    content: string;
    messageType: MessageType;
    senderId: string;
    createdAt: string;
    updatedAt?: string;
    status: MessageStatus;
    isRead: boolean;
    isEdited?: boolean;
    isDeleted?: boolean;
    // Media properties
    mediaUrl?: string;
    mediaDuration?: number; // For voice messages (seconds)
    mediaWidth?: number; // For images
    mediaHeight?: number; // For images
    mediaThumbnail?: string; // For images - low-res preview
    // Optimistic UI
    isOptimistic?: boolean;
    tempId?: string; // For matching optimistic updates
    // Reply feature
    replyToId?: string;
    replyToContent?: string;
    replyToSenderId?: string;
}

/**
 * Message input for creating new messages
 */
export interface MessageInput {
    content: string;
    messageType: MessageType;
    mediaUrl?: string;
    mediaDuration?: number;
    mediaWidth?: number;
    mediaHeight?: number;
    replyToId?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation between client and doctor
 */
export interface Conversation {
    id: string;
    doctorId: string;
    clientId: string;
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

// ============================================================================
// Doctor Types
// ============================================================================

/**
 * Doctor information for chat header
 */
export interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl?: string;
    specialization?: string;
    isOnline: boolean;
    lastSeen?: string;
}

// ============================================================================
// Chat State Types
// ============================================================================

/**
 * Connection status for real-time features
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

/**
 * Typing indicator state
 */
export interface TypingIndicator {
    conversationId: string;
    userId: string;
    isTyping: boolean;
    timestamp: string;
}

/**
 * Chat state for Redux
 */
export interface ChatState {
    messages: Message[];
    conversations: Conversation[];
    activeConversationId: string | null;
    currentDoctor: Doctor | null;
    // UI States
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
    // Real-time
    connectionStatus: ConnectionStatus;
    typingIndicators: TypingIndicator[];
    // Pagination
    hasMoreMessages: boolean;
    isLoadingMore: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * MessageBubble component props
 */
export interface MessageBubbleProps {
    message: Message;
    isUser: boolean;
    onLongPress: (message: Message) => void;
    isRTL: boolean;
    showAvatar?: boolean;
    onImagePress?: (imageUrl: string) => void;
}

/**
 * VoiceMessageBubble component props
 */
export interface VoiceMessageBubbleProps {
    message: Message;
    isUser: boolean;
    isRTL: boolean;
    onPlay: () => void;
    onPause: () => void;
    isPlaying: boolean;
    playbackProgress: number;
}

/**
 * ImageMessageBubble component props
 */
export interface ImageMessageBubbleProps {
    message: Message;
    isUser: boolean;
    isRTL: boolean;
    onPress: () => void;
    isLoading?: boolean;
}

/**
 * Message action types for action sheet
 */
export type MessageAction = 'reply' | 'edit' | 'delete' | 'copy' | 'forward';

/**
 * Subscription tier for permission checks
 */
export type SubscriptionTier = 'free' | 'basic' | 'premium';

/**
 * Chat permissions based on subscription
 */
export interface ChatPermissions {
    canSendMessages: boolean;
    canSendVoice: boolean;
    canSendImages: boolean;
    messageLimit: number;
    messagesRemaining: number;
    tier: SubscriptionTier;
}

// ============================================================================
// Voice Recording Types
// ============================================================================

/**
 * Voice recording state
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Voice recording data
 */
export interface VoiceRecordingData {
    state: RecordingState;
    duration: number; // seconds
    meteringValues: number[]; // For waveform visualization
    uri?: string;
}

// ============================================================================
// Socket Event Types
// ============================================================================

/**
 * Socket event payloads for real-time messaging
 */
export interface SocketEvents {
    'message:new': Message;
    'message:updated': Message;
    'message:deleted': { messageId: string; conversationId: string };
    'typing:start': TypingIndicator;
    'typing:stop': TypingIndicator;
    'user:online': { userId: string };
    'user:offline': { userId: string; lastSeen: string };
    'message:read': { messageId: string; readBy: string; readAt: string };
}
