import { client } from "@/lib/client";
import type {
  Message,
  SendMessageInput,
  GetMessagesQuery,
  ApiResponse,
} from "./types";

export * from "./types";

export const messageClient = {
  getMessages: (conversationId: string, query?: GetMessagesQuery) => {
    const searchParams = new URLSearchParams();
    if (query?.limit) searchParams.set("limit", query.limit.toString());
    if (query?.before) searchParams.set("before", query.before);

    const queryString = searchParams.toString();
    const endpoint = `/messages/${conversationId}${queryString ? `?${queryString}` : ""}`;

    return client<ApiResponse<{ messages: Message[] }>>(endpoint, {
      method: "GET",
    });
  },

  sendMessage: (data: SendMessageInput | FormData) =>
    client<ApiResponse<{ message: Message }>>("/messages", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
};

export default messageClient;
