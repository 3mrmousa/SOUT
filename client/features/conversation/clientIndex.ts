import { client } from "@/lib/client";
import type {
  Conversation,
  CreateConversationInput,
  ApiResponse,
  SafeUser,
} from "./types";

export * from "./types";

export const conversationClient = {
  getMyConversations: () =>
    client<ApiResponse<{ conversations: Conversation[] }>>("/conversations", {
      method: "GET",
    }),

  getMyContacts: () =>
    client<ApiResponse<{ contacts: SafeUser[] }>>("/conversations/contacts", {
      method: "GET",
    }),

  createConversation: (data: CreateConversationInput) =>
    client<ApiResponse<{ conversation: Conversation }>>("/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getConversationByRecipient: (recipientUsername: string) =>
    client<ApiResponse<{ conversation: Conversation }>>(
      `/conversations/recipient/${encodeURIComponent(recipientUsername.replace(/^@/, "").trim())}`,
      {
        method: "GET",
      },
    ),

  getConversationById: (id: string) =>
    client<ApiResponse<{ conversation: Conversation }>>(`/conversations/${id}`, {
      method: "GET",
    }),
};

export default conversationClient;
