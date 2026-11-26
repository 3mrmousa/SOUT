"use client";

import { useConversationStore } from "@/stores/useConversationStore";
import Avatar from "@/components/Avatar";

export default function ChatProfile() {
  const selectedConversation = useConversationStore(
    (s) => s.selectedConversation,
  );
  const recipient = selectedConversation?.recipient;
  const onlineUsers = useConversationStore((s) => s.onlineUsers);
  const isOnline = recipient ? onlineUsers.includes(recipient.id) : false;

  if (!recipient) return null;

  return (
    <div className="relative h-full hidden md:flex flex-col shrink-0 md:w-64 lg:w-72 border-l border-[#1f2937] bg-[#101218] p-6 items-center text-center overflow-y-auto overflow-x-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-48 overflow-hidden pointer-events-none select-none z-0"
      >
        {recipient.image?.secure_url ? (
          <img
            src={recipient.image.secure_url}
            alt=""
            className="w-full h-full object-cover blur-2xl opacity-30 scale-150 transform-gpu"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-b from-purple-600/25 via-purple-900/10 to-transparent blur-xl" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#101218]/40 to-[#101218]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="relative mb-3">
          <Avatar
            src={recipient.image?.secure_url}
            name={recipient.name}
            size="lg"
            className="ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/30"
          />
          <span
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-500"} ring-4 ring-[#101218]`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>

        <h3 className="font-raster font-normal text-xl text-zinc-100 truncate w-full">
          {recipient.name}
        </h3>
        <p className="font-interference text-xs text-zinc-400">
          @{recipient.username}
        </p>

        {isOnline ? (
          <div className="font-interference inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        ) : (
          <div className="font-interference inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>Offline</span>
          </div>
        )}

        {recipient.bio && (
          <div className="font-sans w-full mt-5 p-3 rounded-xl bg-zinc-900/50 border border-[#1f2937] text-left">
            <p className="font-interference text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              Bio
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {recipient.bio}
            </p>
          </div>
        )}

        <div className="font-sans w-full mt-4 pt-4 border-t border-[#1f2937] text-left">
          <p className="font-interference text-zinc-500 uppercase tracking-wider text-[10px]">
            Member Since
          </p>
          <p className="text-zinc-300 text-sm mt-0.5">
            {recipient.createdAt
              ? new Date(recipient.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "October 2026"}
          </p>
        </div>
      </div>
    </div>
  );
}
