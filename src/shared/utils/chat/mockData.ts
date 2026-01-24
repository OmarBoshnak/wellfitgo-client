/**
 * Chat Mock Data
 * @description Mock data for chat development without backend
 */

import { Message, Doctor, Conversation } from '@/src/shared/types/chat';

// ============================================================================
// Mock Doctor
// ============================================================================

export const mockDoctor: Doctor = {
    id: 'doctor_1',
    firstName: 'سارة',
    lastName: 'أحمد',
    fullName: 'د. سارة أحمد',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    specialization: 'أخصائية تغذية علاجية',
    isOnline: true,
    lastSeen: new Date().toISOString(),
};

// ============================================================================
// Mock Conversation
// ============================================================================

export const mockConversation: Conversation = {
    id: 'conv_1',
    doctorId: 'doctor_1',
    clientId: 'user_1',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
    isActive: true,
};

// ============================================================================
// Mock Messages
// ============================================================================

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;

export const mockMessages: Message[] = [
    // Day 1 - Initial consultation
    {
        id: 'msg_1',
        conversationId: 'conv_1',
        content: 'مرحباً! أنا د. سارة، سعيدة بتواصلك معي. كيف يمكنني مساعدتك اليوم؟',
        messageType: 'text',
        senderId: 'doctor_1',
        createdAt: new Date(now - 24 * hour).toISOString(),
        status: 'read',
        isRead: true,
    },
    {
        id: 'msg_2',
        conversationId: 'conv_1',
        content: 'أهلاً دكتورة! أحتاج مساعدة في وضع نظام غذائي لإنقاص الوزن',
        messageType: 'text',
        senderId: 'user_1',
        createdAt: new Date(now - 24 * hour + 5 * minute).toISOString(),
        status: 'read',
        isRead: true,
    },
    {
        id: 'msg_3',
        conversationId: 'conv_1',
        content: 'ممتاز! هل يمكنك إخباري بوزنك الحالي وطولك؟ وهل لديك أي أمراض مزمنة؟',
        messageType: 'text',
        senderId: 'doctor_1',
        createdAt: new Date(now - 24 * hour + 10 * minute).toISOString(),
        status: 'read',
        isRead: true,
    },
    {
        id: 'msg_4',
        conversationId: 'conv_1',
        content: 'وزني 85 كجم وطولي 170 سم. لا أعاني من أي أمراض مزمنة الحمد لله',
        messageType: 'text',
        senderId: 'user_1',
        createdAt: new Date(now - 24 * hour + 15 * minute).toISOString(),
        status: 'read',
        isRead: true,
    },
    // Image message example
    {
        id: 'msg_5',
        conversationId: 'conv_1',
        content: '',
        messageType: 'image',
        senderId: 'user_1',
        createdAt: new Date(now - 20 * hour).toISOString(),
        status: 'read',
        isRead: true,
        mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
        mediaWidth: 600,
        mediaHeight: 400,
    },
    {
        id: 'msg_6',
        conversationId: 'conv_1',
        content: 'هذه صورة وجبة الفطور التي تناولتها اليوم',
        messageType: 'text',
        senderId: 'user_1',
        createdAt: new Date(now - 20 * hour + minute).toISOString(),
        status: 'read',
        isRead: true,
    },
    {
        id: 'msg_7',
        conversationId: 'conv_1',
        content: 'وجبة رائعة! أحب أنك أضفت الخضروات. لكن حاول تقليل كمية الخبز قليلاً 👍',
        messageType: 'text',
        senderId: 'doctor_1',
        createdAt: new Date(now - 19 * hour).toISOString(),
        status: 'read',
        isRead: true,
    },
    // Voice message example
    {
        id: 'msg_8',
        conversationId: 'conv_1',
        content: '',
        messageType: 'voice',
        senderId: 'doctor_1',
        createdAt: new Date(now - 5 * hour).toISOString(),
        status: 'read',
        isRead: true,
        mediaUrl: 'https://example.com/audio/doctor-advice.m4a',
        mediaDuration: 45, // 45 seconds
    },
    // Recent messages
    {
        id: 'msg_9',
        conversationId: 'conv_1',
        content: 'شكراً على الرسالة الصوتية دكتورة! سأتبع النصائح',
        messageType: 'text',
        senderId: 'user_1',
        createdAt: new Date(now - 4 * hour).toISOString(),
        status: 'read',
        isRead: true,
    },
    {
        id: 'msg_10',
        conversationId: 'conv_1',
        content: 'ممتاز! لا تتردد في إرسال صور وجباتك اليومية لمتابعتك 💪',
        messageType: 'text',
        senderId: 'doctor_1',
        createdAt: new Date(now - 3 * hour).toISOString(),
        status: 'read',
        isRead: true,
    },
    // Today's messages
    {
        id: 'msg_11',
        conversationId: 'conv_1',
        content: 'صباح الخير دكتورة! هل يمكنني تناول الفاكهة بين الوجبات؟',
        messageType: 'text',
        senderId: 'user_1',
        createdAt: new Date(now - 30 * minute).toISOString(),
        status: 'delivered',
        isRead: false,
    },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a temporary ID for optimistic updates
 */
export const generateTempId = (): string => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Create an optimistic message for immediate UI feedback
 */
export const createOptimisticMessage = (
    input: {
        content: string;
        messageType: 'text' | 'image' | 'voice';
        conversationId: string;
        senderId: string;
        mediaUrl?: string;
        mediaDuration?: number;
        mediaWidth?: number;
        mediaHeight?: number;
        replyToId?: string;
        replyToContent?: string;
    }
): Message => {
    const tempId = generateTempId();
    return {
        id: tempId,
        tempId,
        conversationId: input.conversationId,
        content: input.content,
        messageType: input.messageType,
        senderId: input.senderId,
        createdAt: new Date().toISOString(),
        status: 'sending',
        isRead: false,
        isOptimistic: true,
        mediaUrl: input.mediaUrl,
        mediaDuration: input.mediaDuration,
        mediaWidth: input.mediaWidth,
        mediaHeight: input.mediaHeight,
        replyToId: input.replyToId,
        replyToContent: input.replyToContent,
    };
};

/**
 * Mock delay to simulate network requests
 */
export const mockDelay = (ms: number = 500): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock message sending (simulates backend response)
 */
export const mockSendMessage = async (
    message: Message
): Promise<Message> => {
    await mockDelay(800);

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
        throw new Error('Failed to send message');
    }

    // Return the message with a "real" ID and sent status
    return {
        ...message,
        id: `msg_${Date.now()}`,
        tempId: message.tempId,
        status: 'sent',
        isOptimistic: false,
    };
};

/**
 * Current user ID (mock)
 */
export const CURRENT_USER_ID = 'user_1';
