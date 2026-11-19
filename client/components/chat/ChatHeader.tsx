"use client";

import { useConversationStore } from "@/stores/useConversationStore";
import Avatar from "@/components/Avatar";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ChatHeader() {
  const { isOpen, toggle } = useSidebarStore();
  const selectedConversation = useConversationStore(
    (s) => s.selectedConversation,
  );
  const recipient = selectedConversation?.recipient;

  if (!recipient) return null;

  return (
    <div className="w-full flex items-center gap-2 px-4 py-2 border-b border-[#1f2937] bg-[#101218]">
      <button
        type="button"
        onClick={toggle}
        title={isOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer"
      >
        {isOpen ? (
          <PanelLeftClose className="w-5 h-5" />
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-purple-400" />
        )}
      </button>
      <Avatar
        src={recipient.image?.secure_url}
        name={recipient.name}
        size="md"
      />
      <p className="font-raster text-xl text-zinc-100 font-normal">
        {recipient.name}
      </p>
    </div>
  );
}
