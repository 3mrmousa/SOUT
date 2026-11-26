"use client";

import React, { useState } from "react";
import { KeyRound, Loader2, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/features/clientIndex";

interface ForgotPasswordOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onSuccess?: () => void;
}

export function ForgotPasswordOTPModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: ForgotPasswordOTPModalProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const targetEmail = (
    email ||
    (typeof window !== "undefined"
      ? localStorage.getItem("forgotPasswordEmail")
      : "") ||
    ""
  )
    .trim()
    .toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetEmail) {
      toast.error("Email not found. Please request a new verification code.");
      onClose();
      return;
    }

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.verifyForgotPassword({
        email: targetEmail,
        otp: cleanOtp,
      });
      toast.success(res.message || "OTP verified successfully!");
      setOtp("");
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid or expired OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#101218] border border-[#1f2937] rounded-2xl p-6 sm:p-7 shadow-2xl relative space-y-5 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <h2 className="text-xl font-bold text-white">
            Enter Verification Code
          </h2>
          <p className="text-xs text-zinc-400">
            {targetEmail ? (
              <>
                Code sent to{" "}
                <span className="text-purple-400 font-medium">
                  {targetEmail}
                </span>
              </>
            ) : (
              "Enter the 6-digit code sent to your email"
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              6-Digit OTP
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="••••••"
                className="w-full h-11 pl-10 pr-4 text-center tracking-[0.3em] font-mono rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.trim().length !== 6}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] font-medium text-sm text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Verify OTP</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordOTPModal;
