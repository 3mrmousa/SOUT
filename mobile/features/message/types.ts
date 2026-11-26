import type { ApiResponse } from "../auth/types";

export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "SENDING";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  media?: ChatMediaItem[];
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}
export type ChatMediaItem = {
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: MediaCategory;
};

export type MediaCategory = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

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
