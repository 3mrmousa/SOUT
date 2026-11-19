"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/features/clientIndex";
import { socket } from "@/lib/socket";
import { useConversationStore } from "@/stores/useConversationStore";

export const Sessions = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearChat = useConversationStore((s) => s.clearChat);

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isLogoutAllLoading, setIsLogoutAllLoading] = useState(false);

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

  const handleLogoutAll = async () => {
    setIsLogoutAllLoading(true);
    try {
      await authClient.logoutAll();
      socket.disconnect();
      clearChat();
      queryClient.clear();
      toast.success("Logged out from all devices");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to log out from all devices",
      );
    } finally {
      setIsLogoutAllLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="space-y-1">
        <h2 className="font-raster text-xl font-normal text-white">
          Sessions
        </h2>
        <p className="text-xs text-zinc-400">
          Sign out of your current session or revoke access from all devices.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLogoutLoading || isLogoutAllLoading}
          className="h-10 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-sm font-medium text-zinc-200 hover:text-white flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {isLogoutLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>Log Out</span>
        </button>

        <button
          type="button"
          onClick={handleLogoutAll}
          disabled={isLogoutLoading || isLogoutAllLoading}
          className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          {isLogoutAllLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>Log Out All Devices</span>
        </button>
      </div>
    </div>
  );
};

