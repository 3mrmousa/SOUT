"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { SafeUser, userClient } from "@/features/clientIndex";
import toast from "react-hot-toast";

interface ChangeEmailVerifyNewProps {
  user?: SafeUser | null;
  onClose?: () => void;
}

export const ChangeEmailVerifyNew = ({
  user,
  onClose,
}: ChangeEmailVerifyNewProps) => {
  const [OTP, setOTP] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!OTP) {
      toast.error("Please enter OTP");
      return;
    }

    if (OTP.length !== 6 || isNaN(Number(OTP))) {
      toast.error("Please enter valid OTP");
      return;
    }

    try {
      setIsLoading(true);
      const res = await userClient.changeEmail({
        currentEmail: user!.email,
        otp: OTP,
      });
      toast.success(res.message || "Email changed successfully!");
      onClose?.();
    } catch (err: any) {
      toast.error(
        err.message || err.msg || "Failed to verify OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
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

      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="otp"
            className="block text-xs font-medium text-zinc-300"
          >
            Enter the 6-digit verification code sent to your new email
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            required
            maxLength={6}
            autoFocus
            value={OTP}
            onChange={(e) => setOTP(e.target.value.trim())}
            placeholder="••••••"
            className="w-full h-11 text-center text-lg tracking-[0.3em] font-mono rounded-xl bg-[#161922] border border-[#1f2937] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
          />
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
            disabled={isLoading}
            className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-sm font-medium text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeEmailVerifyNew;

