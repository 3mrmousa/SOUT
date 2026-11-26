import { server } from "@/lib/server";
import type {
  Conversation,
  CreateConversationInput,
  ApiResponse,
  SafeUser,
} from "./types";

export * from "./types";

export const conversationServer = {
  getMyConversations: () =>
    server<ApiResponse<{ conversations: Conversation[] }>>("/conversations", {
      method: "GET",
    }),

  getMyContacts: () =>
    server<ApiResponse<{ contacts: SafeUser[] }>>("/conversations/contacts", {
      method: "GET",
    }),

  createConversation: (data: CreateConversationInput) =>
    server<ApiResponse<{ conversation: Conversation }>>("/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getConversationByRecipient: (recipientUsername: string) =>
    server<ApiResponse<{ conversation: Conversation }>>(
      `/conversations/recipient/${encodeURIComponent(recipientUsername.replace(/^@/, "").trim())}`,
      {
        method: "GET",
      },
    ),

  getConversationById: (id: string) =>
    server<ApiResponse<{ conversation: Conversation }>>(`/conversations/${id}`, {
      method: "GET",
    }),
};

export default conversationServer;
