"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, X } from "lucide-react";
import { userClient } from "@/features/clientIndex";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ChangePasswordProps {
  onClose?: () => void;
}

export const ChangePassword = ({ onClose }: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await userClient.changePassword({
        newPassword,
        oldPassword: currentPassword,
      });
      toast.success(res.message || "password updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      onClose?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#101218] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Change Password
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="currentPassword"
              className="block text-xs font-medium text-zinc-300"
            >
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="block text-xs font-medium text-zinc-300"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-sm font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-sm font-medium text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isPasswordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>

        <p className="text-center font-light text-sm text-red-500">
          This will logout you from all sessions
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
