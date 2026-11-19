import type { ApiResponse } from "../auth/types";

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageInput {
  conversationId: string;
  recipientId: string;
  content: string;
}

export interface GetMessagesQuery {
  limit?: number;
  before?: string;
}

export type { ApiResponse };
