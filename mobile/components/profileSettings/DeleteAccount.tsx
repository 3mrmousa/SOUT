"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { userClient } from "@/features/clientIndex";
import { socket } from "@/lib/socket";
import { useConversationStore } from "@/stores/useConversationStore";

export const DeleteAccount = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearChat = useConversationStore((s) => s.clearChat);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      const res = await userClient.deleteAccount({ password });
      socket.disconnect();
      clearChat();
      queryClient.clear();
      toast.success(res.message || "Account deleted");
      onClose();
      router.replace("/login");
      localStorage.removeItem("lastActiveChat");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#101218] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Delete Account</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
          Warning: This permanently deletes your account, messages, and media.
          This cannot be undone.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password to confirm"
            className="w-full h-11 px-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-medium text-white flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccount;
