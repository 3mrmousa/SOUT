"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { authClient } from "@/features/clientIndex";
import OtpVerificationModal from "@/components/modals/OtpVerificationModal";
import toast from "react-hot-toast";
import DynamicBackground from "@/components/background/DynamicBackground";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpModelOpen, setIsOtpModelOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authClient.registerRequest(formData);
      toast.success(res.message || "Verification code sent to your email!");
      setIsOtpModelOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration request failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authClient.verifyRegister({
        email: formData.email,
        otp,
      });
      toast.success(res.message || "Account created successfully!");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid or expired OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden py-12">
      <DynamicBackground />

      <div className="w-full max-w-md bg-[#101218]/90 backdrop-blur-xl border border-[#1f2937] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 opacity-40 blur-md group-hover:opacity-75 transition duration-300" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#0b0d12] border border-[#1f2937] flex items-center justify-center p-1.5 shadow-inner overflow-hidden">
              <img
                src="/logo-icon.svg"
                alt="SOUT Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          <div>
            <p className="font-interference text-[11px] uppercase tracking-[0.15em] text-zinc-500 mb-1">
              [ SOUT // REGISTER ]
            </p>
            <h1 className="font-raster text-3xl sm:text-4xl font-normal tracking-tight text-white">
              Create an account
            </h1>
            <p className="font-sans text-xs text-zinc-400 mt-1">
              Join <span className="text-purple-400 font-medium">SOUT</span> to
              chat, connect, and collaborate
            </p>
          </div>
        </div>

        <form
          onSubmit={handleRegisterRequest}
          className="space-y-3.5 font-sans"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Amr Mousa"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username (letters, numbers, _)"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] font-medium text-sm text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed pt-0.5"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-[#1f2937]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {isOtpModelOpen && (
        <OtpVerificationModal
          onClose={() => setIsOtpModelOpen(false)}
          onVerify={handleOtpVerification}
          email={formData.email}
          otp={otp}
          setOtp={setOtp}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
