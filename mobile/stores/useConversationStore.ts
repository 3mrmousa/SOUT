import { create } from "zustand";
import { Conversation, conversationClient } from "@/features/clientIndex";
import { MediaCategory, Message, messageClient } from "@/features/clientIndex";
import { socket } from "@/lib/socket";
import toast from "react-hot-toast";

function getMediaCategory(mime: string): MediaCategory {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
}

function createTempMessage(
  conversationId: string,
  content: string,
  files: File[],
): Message {
  const tempId = `temp-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    id: tempId,
    conversationId,
    senderId: "me",
    content: content.trim() || undefined,
    media:
      files.length > 0
        ? files.map((file, i) => ({
            url: URL.createObjectURL(file),
            key: `${tempId}-${i}`,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            category: getMediaCategory(file.type),
          }))
        : undefined,
    status: "SENT",
    createdAt: now,
    updatedAt: now,
  };
}

interface ConversationStore {
  selectedConversation: Conversation | null;
  messages: Message[] | null;
  onlineUsers: string[];
  isLoading: boolean;
  isTyping: boolean;
  isRecording: boolean;
  openChat: (recipientUsername: string) => Promise<void>;
  clearChat: () => void;
  sendMessage: (content?: string, files?: File[]) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  onRecording: () => void;
  onStopRecording: () => void;
  initSocketListeners: () => () => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  selectedConversation: null,
  messages: null,
  onlineUsers: [],
  isLoading: false,
  isTyping: false,
  isRecording: false,
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("lastActiveChat");
      }
      set({ isLoading: false, selectedConversation: null, messages: null });
    }
  },
  clearChat: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lastActiveChat");
    }
    set({ selectedConversation: null, messages: null });
  },
  sendMessage: async (content: string = "", files: File[] = []) => {
    const { selectedConversation } = get();
    if (
      !selectedConversation?.recipient ||
      (!content.trim() && files.length === 0)
    ) {
      return;
    }

    // 1. Show temporary message immediately
    const tempMsg = createTempMessage(selectedConversation.id, content, files);
    set((s) => ({ messages: [...(s.messages || []), tempMsg] }));

    // 2. Build FormData to send to the server
    const formData = new FormData();
    formData.append("conversationId", selectedConversation.id);
    formData.append("recipientId", selectedConversation.recipient.id);
    if (content.trim()) formData.append("content", content.trim());
    files.forEach((file) => formData.append("files", file));

    try {
      // 3. Upload & swap temp message with the real message (keep local preview URLs)
      const res = await messageClient.sendMessage(formData);
      const realMsg = res.data?.message;
      if (!realMsg) return;

      set((s) => ({
        messages: (s.messages || []).map((m) =>
          m.id === tempMsg.id
            ? { ...realMsg, media: tempMsg.media ?? realMsg.media }
            : m,
        ),
      }));
    } catch (error) {
      // 4. Remove temp message if upload fails
      tempMsg.media?.forEach((m) => URL.revokeObjectURL(m.url));
      set((s) => ({
        messages: (s.messages || []).filter((m) => m.id !== tempMsg.id),
      }));
      toast.error("Message not sent");
    }
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
  onRecording: () => {
    const { selectedConversation } = get();
    if (!selectedConversation) return;
    socket.emit("recording", {
      conversationId: selectedConversation.id,
      recipientId: selectedConversation.recipient?.id,
    });
  },
  onStopRecording: () => {
    const { selectedConversation } = get();
    if (!selectedConversation) return;
    socket.emit("stop_recording", {
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
        const isFromMe = selectedConversation.recipient?.id !== msg.senderId;
        const hasPendingTemp =
          isFromMe && messages?.some((m) => m.id.startsWith("temp-"));

        if (!hasPendingTemp && !messages?.some((m) => m.id === msg.id)) {
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

    const handleUserRecording = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      const { selectedConversation } = get();
      if (selectedConversation?.id === conversationId) {
        set({ isRecording: true });
      }
    };

    const handleUserStopRecording = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      const { selectedConversation } = get();
      if (selectedConversation?.id === conversationId) {
        set({ isRecording: false });
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

    socket.on("user_recording", handleUserRecording);
    socket.on("user_stop_recording", handleUserStopRecording);

    return () => {
      socket.off("new_message", handleMessage);

      socket.off("message_sent", handleMessage);
      socket.off("message_delivered", handleDelivered);
      socket.off("messages_read", handleMessagesRead);

      socket.off("get_online_users", handleGetOnlineUsers);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("user_recording", handleUserRecording);
      socket.off("user_stop_recording", handleUserStopRecording);
    };
  },
}));
