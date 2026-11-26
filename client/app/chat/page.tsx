"use client";

import { MessageSquarePlus, PanelLeftOpen } from "lucide-react";
import { useConversationStore } from "@/stores/useConversationStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatProfile from "@/components/chat/ChatProfile";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function MessagesPage() {
  const { isOpen: isSidebarOpen, open: openSidebar } = useSidebarStore();
  const selectedConversation = useConversationStore(
    (s) => s.selectedConversation,
  );
  const openChat = useConversationStore((s) => s.openChat);
  const initSocketListeners = useConversationStore(
    (s) => s.initSocketListeners,
  );

  useEffect(() => {
    const lastChat =
      typeof window !== "undefined"
        ? localStorage.getItem("lastActiveChat")
        : null;
    if (lastChat) {
      openChat(lastChat);
    }
  }, [openChat]);

  useEffect(() => {
    const cleanup = initSocketListeners();
    return cleanup;
  }, [initSocketListeners]);

  useEffect(() => {
    if (!selectedConversation?.id || !selectedConversation?.recipient?.id) {
      return;
    }

    socket.emit("mark_as_read", {
      conversationId: selectedConversation.id,
      senderId: selectedConversation.recipient.id,
    });
  }, [selectedConversation?.id, selectedConversation?.recipient?.id]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 relative">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={openSidebar}
            title="Open sidebar (Ctrl+B)"
            className="absolute top-3 left-3 p-2 rounded-xl bg-[#101218] border border-[#1f2937] text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-lg transition cursor-pointer"
          >
            <PanelLeftOpen className="w-5 h-5 text-purple-400" />
          </button>
        )}
        <div className="text-center font-sans">
          <MessageSquarePlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-raster text-2xl font-normal text-zinc-200">
            No active conversations
          </p>
          <p className="text-sm text-zinc-500 mt-1 font-sans">
            Select a contact to start chatting
          </p>
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={openSidebar}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>Open Contacts</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col w-full h-full">
      <ChatHeader />

      <div className="flex-1 flex text-zinc-400 overflow-hidden min-h-0">
        <div className="relative flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-[#0b0d12]">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.06),transparent_60%)]"
          />

          <div className="relative z-10 flex flex-col flex-1 min-w-0 h-full">
            <ChatMessages />
            <ChatInput />
          </div>
        </div>

        <ChatProfile />
      </div>
    </div>
  );
}
