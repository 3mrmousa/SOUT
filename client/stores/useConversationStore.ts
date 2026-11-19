import { create } from "zustand";
import { Conversation, conversationClient } from "@/features/clientIndex";
import { Message, messageClient } from "@/features/clientIndex";
import { socket } from "@/lib/socket";

interface ConversationStore {
  selectedConversation: Conversation | null;
  messages: Message[] | null;
  onlineUsers: string[];
  isLoading: boolean;
  isTyping: boolean;
  openChat: (recipientUsername: string) => Promise<void>;
  clearChat: () => void;
  sendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  initSocketListeners: () => () => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  selectedConversation: null,
  messages: null,
  onlineUsers: [],
  isLoading: false,
  isTyping: false,
  openChat: async (recipientUsername: string) => {
    set({ isLoading: true });
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("lastActiveChat", recipientUsername);
      }
      const res =
        await conversationClient.getConversationByRecipient(recipientUsername);
      if (res.data?.conversation) {
        set({ selectedConversation: res.data.conversation, isLoading: false });
      }
      const messageRes = await messageClient.getMessages(
        res.data!.conversation.id,
      );
      if (messageRes.data?.messages) {
        set({
          messages: messageRes.data.messages,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log("error opening chat");
      set({ isLoading: false, selectedConversation: null, messages: null });
    }
  },
  clearChat: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lastActiveChat");
    }
    set({ selectedConversation: null, messages: null });
  },
  sendMessage: (content: string) => {
    const { selectedConversation } = get();
    if (
      !selectedConversation ||
      !selectedConversation.recipient ||
      !content.trim()
    ) {
      return;
    }
    socket.emit("send_message", {
      conversationId: selectedConversation.id,
      recipientId: selectedConversation.recipient.id,
      content,
    });
  },
  onTyping: () => {
    const { selectedConversation } = get();
    if (!selectedConversation) return;
    socket.emit("typing", {
      conversationId: selectedConversation.id,
      recipientId: selectedConversation.recipient?.id,
    });
  },
  onStopTyping: () => {
    const { selectedConversation } = get();
    if (!selectedConversation) return;
    socket.emit("stop_typing", {
      conversationId: selectedConversation.id,
      recipientId: selectedConversation.recipient?.id,
    });
  },
  initSocketListeners: () => {
    const handleMessage = (msg: Message) => {
      const { selectedConversation, messages } = get();
      if (
        selectedConversation &&
        msg.conversationId === selectedConversation.id
      ) {
        if (!messages?.some((m) => m.id === msg.id)) {
          set({ messages: [...(messages || []), msg] });
        }
        if (selectedConversation.recipient?.id === msg.senderId) {
          socket.emit("mark_as_read", {
            conversationId: selectedConversation.id,
            senderId: msg.senderId,
          });
        }
      }
    };

    const handleDelivered = ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => {
      const { selectedConversation, messages } = get();
      if (selectedConversation?.id === conversationId && messages) {
        set({
          messages: messages.map((m) =>
            m.id === messageId ? { ...m, status: "DELIVERED" } : m,
          ),
        });
      }
    };

    const handleMessagesRead = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      const { selectedConversation, messages } = get();
      if (selectedConversation?.id === conversationId && messages) {
        set({
          messages: messages.map((m) =>
            m.status !== "READ" ? { ...m, status: "READ" } : m,
          ),
        });
      }
    };

    const handleGetOnlineUsers = (users: string[]) => {
      set({ onlineUsers: users });
    };

    const handleUserOnline = (data: { userId: string } | string) => {
      const userId = typeof data === "object" ? data.userId : data;
      if (!userId) return;
      const { onlineUsers } = get();
      if (!onlineUsers.includes(userId)) {
        set({ onlineUsers: [...onlineUsers, userId] });
      }
    };

    const handleUserOffline = (data: { userId: string } | string) => {
      const userId = typeof data === "object" ? data.userId : data;
      if (!userId) return;
      const { onlineUsers } = get();
      set({ onlineUsers: onlineUsers.filter((id) => id !== userId) });
    };

    const handleUserTyping = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      const { selectedConversation } = get();
      if (selectedConversation?.id === conversationId) {
        set({ isTyping: true });
      }
    };

    const handleUserStopTyping = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      const { selectedConversation } = get();
      if (selectedConversation?.id === conversationId) {
        set({ isTyping: false });
      }
    };

    socket.emit("get_online_users");

    socket.on("new_message", handleMessage);

    socket.on("message_sent", handleMessage);
    socket.on("message_delivered", handleDelivered);
    socket.on("messages_read", handleMessagesRead);

    socket.on("get_online_users", handleGetOnlineUsers);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("new_message", handleMessage);

      socket.off("message_sent", handleMessage);
      socket.off("message_delivered", handleDelivered);
      socket.off("messages_read", handleMessagesRead);

      socket.off("get_online_users", handleGetOnlineUsers);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  },
}));
