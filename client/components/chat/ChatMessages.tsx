"use client";

import React, { useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useConversationStore } from "@/stores/useConversationStore";
import { Check, CheckCheck } from "lucide-react";
import { formatDateTag, isSameDay } from "@/utils/dateTag";
import ThoughtLine from "@/components/chat/ThoughtLine";

export default function ChatMessages() {
  const messages = useConversationStore((s) => s.messages);
  const isTyping = useConversationStore((s) => s.isTyping);
  const { data: me } = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col gap-3 px-6 py-4 text-zinc-300 overflow-y-auto font-sans">
      {messages?.map((message, index) => {
        const isMe = message.senderId === me?.id;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateTag =
          !prevMessage || !isSameDay(message.createdAt, prevMessage.createdAt);
        return (
          <React.Fragment key={message.id}>
            {showDateTag && (
              <div className="flex justify-center my-3 select-none">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#101218] border border-zinc-800 text-zinc-400 shadow-sm">
                  {formatDateTag(message.createdAt)}
                </span>
              </div>
            )}
            <div
              key={message.id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-purple-900/70 text-white rounded-br-xs shadow-md shadow-purple-900/20"
                    : "bg-zinc-900/80 text-zinc-100 rounded-bl-xs border border-zinc-700/50"
                }`}
              >
                <p className="break-all">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[11px] text-zinc-400">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && message.status === "SENT" && (
                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  {isMe && message.status === "DELIVERED" && (
                    <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  {isMe && message.status === "READ" && (
                    <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {isTyping && (
        <div className="flex justify-start">
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-xs bg-zinc-800/90 border border-zinc-700/50">
            <ThoughtLine label="Typing…" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
