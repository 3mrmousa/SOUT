"use client";

import React, { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/clientIndex";
import toast from "react-hot-toast";
import { socket } from "@/lib/socket";
import { useConversationStore } from "@/stores/useConversationStore";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearChat = useConversationStore((s) => s.clearChat);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await authClient.logout();
      socket.disconnect();
      clearChat();
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to log out");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLogoutLoading}
      title="Log out"
      className="p-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer shrink-0"
    >
      {isLogoutLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </button>
  );
}
