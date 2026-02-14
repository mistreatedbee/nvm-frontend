export type SenderRole = 'Customer' | 'Vendor' | 'Admin' | 'Bot' | 'System';

export interface ChatParticipant {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: { url?: string } | string;
}

export interface ChatOrderSummary {
  _id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
}

export interface Conversation {
  _id: string;
  type: 'general' | 'order' | 'support';
  participantIds: string[];
  customerId?: ChatParticipant | string;
  vendorUserId?: ChatParticipant | string;
  vendorId?: {
    _id: string;
    storeName?: string;
    logo?: { url?: string };
  } | string;
  orderId?: ChatOrderSummary | string;
  orderStatusSnapshot?: string | null;
  isEscalated?: boolean;
  escalationReason?: string;
  supportStatus?: 'Open' | 'In Progress' | 'Resolved';
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt?: string;
}

export interface ChatAttachment {
  public_id?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId?: ChatParticipant | string | null;
  senderRole: SenderRole;
  messageContent: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachment?: ChatAttachment;
  readAt?: string | null;
  createdAt: string;
}

export interface PagedConversationsResponse {
  success: boolean;
  total: number;
  currentPage: number;
  pages: number;
  data: Conversation[];
}

export interface PagedMessagesResponse {
  success: boolean;
  nextCursor: string | null;
  data: Message[];
}
