"use client";

import React from "react";
import { Loader2, X } from "lucide-react";

interface OtpVerificationModalProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  onClose: () => void;
  onVerify: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export default function OtpVerificationModal({
  email,
  otp,
  setOtp,
  onClose,
  onVerify,
  isLoading,
}: OtpVerificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#101218] border border-[#1f2937] rounded-2xl p-6 sm:p-7 shadow-2xl relative space-y-5 text-zinc-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <h2 className="text-xl font-bold text-white">Enter Verification Code</h2>
          <p className="text-xs text-zinc-400">
            We sent a verification code to{" "}
            <span className="text-purple-400 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={onVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 text-center">
              Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="••••••"
              className="w-full h-11 text-center text-lg tracking-[0.3em] font-mono rounded-xl bg-[#161922] border border-[#1f2937] text-white focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !otp.trim()}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] font-medium text-sm text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
