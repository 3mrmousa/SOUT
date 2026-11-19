import type { SafeUser, ApiResponse } from "../auth/types";

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  recipient: SafeUser | null;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
  } | null;
}

export interface CreateConversationInput {
  recipientUsername: string;
}
export type { SafeUser, ApiResponse };
