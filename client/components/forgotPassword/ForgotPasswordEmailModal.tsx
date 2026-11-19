"use client";

import React, { useState } from "react";
import { Mail, Loader2, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/features/clientIndex";

interface ForgotPasswordEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

export function ForgotPasswordEmailModal({
  isOpen,
  onClose,
  onSuccess,
}: ForgotPasswordEmailModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.requestForgotPassword({ email: cleanEmail });
      toast.success(res.message || "Reset code sent to your email!");
      if (typeof window !== "undefined") {
        localStorage.setItem("forgotPasswordEmail", cleanEmail);
      }
      setEmail("");
      if (onSuccess) {
        onSuccess(cleanEmail);
      } else {
        onClose();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset code",
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
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-zinc-400">
            Enter your email to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] font-medium text-sm text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Send Code</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordEmailModal;
