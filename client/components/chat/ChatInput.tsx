"use client";

import React, { useRef, useState } from "react";
import { useConversationStore } from "@/stores/useConversationStore";
import SlingButton from "@/components/chat/SlingButton";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const sendMessage = useConversationStore((s) => s.sendMessage);
  const onTyping = useConversationStore((s) => s.onTyping);
  const onStopTyping = useConversationStore((s) => s.onStopTyping);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onStopTyping();
    sendMessage(input);
    setInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const msg = e.target.value.trim();
    setInput(e.target.value);
    if (!msg) {
      onStopTyping();
      return;
    }
    onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1500);
  };

  return (
    <div className="flex items-center gap-3 p-3 mb-5">
      <textarea
        value={input}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Message"
        rows={1}
        className="break-all w-full px-4 py-3 border rounded-xl bg-[#0b0d12] text-zinc-300 border-zinc-800 focus:outline-none focus:border-purple-600 resize-none"
      />
      <SlingButton
        onSend={handleSend}
        disabled={!input.trim()}
        padColor="#9333ea"
        iconColor="#ffffff"
        accentColor="#e945f5"
        wellColor="#161922"
        bandColor="#3f3f46"
        size={44}
      />
    </div>
  );
}
