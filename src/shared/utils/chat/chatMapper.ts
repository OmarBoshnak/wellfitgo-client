import type { Message, MessageStatus } from '@/src/shared/types/chat';

type BackendMessage = {
  _id?: string;
  id?: string;
  conversationId?: string;
  senderId?: string;
  senderRole?: 'doctor' | 'client';
  content?: string;
  messageType?: 'text' | 'voice' | 'image' | 'document';
  mediaUrl?: string;
  mediaDuration?: number;
  mediaWidth?: number;
  mediaHeight?: number;
  replyToId?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  isReadByClient?: boolean;
  isReadByDoctor?: boolean;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const getReadState = (message: BackendMessage): boolean => {
  if (message.senderRole === 'client') {
    return Boolean(message.isReadByDoctor ?? message.isRead);
  }
  if (message.senderRole === 'doctor') {
    return Boolean(message.isReadByClient ?? message.isRead);
  }
  return Boolean(message.isRead);
};

const getStatus = (message: BackendMessage, isFromCurrentUser: boolean): MessageStatus => {
  const isRead = getReadState(message);
  if (isFromCurrentUser) {
    return isRead ? 'read' : 'sent';
  }
  return isRead ? 'read' : 'delivered';
};

export const mapBackendMessage = (message: BackendMessage, currentUserId?: string): Message => {
  const senderId = message.senderId || '';
  const resolvedId = message._id || message.id || '';
  const isFromCurrentUser = currentUserId ? senderId === currentUserId : false;
  const status = getStatus(message, isFromCurrentUser);
  const isRead = getReadState(message);

  return {
    id: resolvedId,
    conversationId: message.conversationId || '',
    content: message.content || '',
    messageType: (message.messageType || 'text') as Message['messageType'],
    senderId,
    senderRole: message.senderRole,
    createdAt: message.createdAt || new Date().toISOString(),
    updatedAt: message.updatedAt,
    status,
    isRead,
    isEdited: message.isEdited,
    isDeleted: message.isDeleted,
    mediaUrl: message.mediaUrl,
    mediaDuration: message.mediaDuration,
    mediaWidth: message.mediaWidth,
    mediaHeight: message.mediaHeight,
    replyToId: message.replyToId,
  };
};
