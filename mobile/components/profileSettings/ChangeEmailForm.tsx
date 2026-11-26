"use client";

import React, { useState } from "react";
import { Loader2, Mail, X } from "lucide-react";
import { SafeUser, userClient } from "@/features/clientIndex";
import toast from "react-hot-toast";

interface ChangeEmailFormProps {
  user?: SafeUser | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ChangeEmailForm = ({
  user,
  onClose,
  onSuccess,
}: ChangeEmailFormProps) => {
  const [newEmail, setNewEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsEmailLoading(true);
      const res = await userClient.changeEmailRequest({
        currentEmail: user!.email,
        newEmail,
      });
      toast.success(res.message || "OTP was sent to your current email!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err.message || err.msg || "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md bg-[#101218] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Change Email</h2>
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

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="newEmail"
            className="block text-xs font-medium text-zinc-300"
          >
            New Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="newEmail"
              type="email"
              required
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
            />
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
            disabled={isEmailLoading}
            className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-sm font-medium text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isEmailLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Change Email"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeEmailForm;
