"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Settings,
  Copy,
  Check,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Avatar from "@/components/Avatar";
import TopNav from "@/components/TopNav";
import toast from "react-hot-toast";
import DynamicBackground from "@/components/background/DynamicBackground";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isPending } = useCurrentUser();
  const [copiedField, setCopiedField] = useState<"email" | "username" | null>(
    null,
  );

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (!user) {
    return null;
  }

  const joinedDate = user.createdAt ? new Date(user.createdAt) : null;
  const joinedMonth = joinedDate
    ? joinedDate.toLocaleDateString("en-US", { month: "long" })
    : null;
  const joinedYear = joinedDate ? joinedDate.getFullYear() : null;

  const handleCopy = (
    text: string,
    field: "email" | "username",
    label: string,
  ) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${label} copied`);
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <DynamicBackground />
      <div className="w-full max-w-4xl relative z-10 space-y-4">
        <TopNav href="/chat" backLabel="Messages" title="My Profile" />

        <div className="bg-[#101218]/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-42 overflow-hidden pointer-events-none select-none z-0"
          >
            {user.image?.secure_url ? (
              <img
                src={user.image.secure_url}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-30 scale-150 transform-gpu"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-b from-purple-600/25 via-purple-900/10 to-transparent blur-xl" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#101218]/40 to-[#101218]" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                <Avatar
                  src={user.image?.secure_url || user.profileImage?.secure_url}
                  name={user.name || user.username}
                  size="xl"
                  shape="xl"
                  fallback="initial"
                  className="w-full h-full"
                />
              </div>
              <div>
                <h1 className="font-raster text-3xl sm:text-4xl font-normal text-white tracking-tight">
                  {user.name}
                </h1>
                <p className="text-sm font-interference text-zinc-400 mt-1">
                  <span className="text-purple-400">@</span>
                  {user.username}
                </p>
              </div>
            </div>

            <Link
              href="/profile/settings"
              className="absolute top-0 right-0 p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/60 transition-colors self-end sm:self-start"
              title="Profile Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-7 font-sans">
            <div className="md:col-span-2 flex flex-col justify-between p-5 rounded-2xl bg-[#0c0e14] border border-zinc-800/80 hover:border-zinc-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-interference uppercase tracking-[0.15em] text-zinc-500">
                  [BIO]
                </span>
                <Link
                  href="/profile/settings"
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <span>Edit</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4">
                {user.bio ? (
                  <p className="border-l-2 border-purple-500/60 pl-3.5 my-2 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words font-sans">
                    {user.bio}
                  </p>
                ) : (
                  <Link
                    href="/profile/settings"
                    className="inline-block border-l-2 border-zinc-800 hover:border-purple-500/60 pl-3.5 my-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-sans"
                  >
                    No bio yet — add one in settings
                  </Link>
                )}
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col justify-between p-5 rounded-2xl bg-[#0c0e14] border border-zinc-800/80 hover:border-zinc-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-interference uppercase tracking-[0.15em] text-zinc-500">
                  [JOINED]
                </span>
                <Calendar className="w-4 h-4 text-zinc-600" />
              </div>

              {joinedMonth && joinedYear ? (
                <div className="mt-4">
                  <p className="font-raster text-2xl font-normal text-zinc-100 tracking-tight">
                    {joinedMonth}
                  </p>
                  <p className="text-xs font-interference text-purple-400 mt-0.5">
                    {joinedYear}
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="font-raster text-2xl font-normal text-zinc-100 tracking-tight">
                    Recently
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(user.username, "username", "Username")}
              className="md:col-span-1 flex flex-col justify-between p-5 rounded-2xl bg-[#0c0e14] border border-zinc-800/80 hover:border-zinc-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors cursor-pointer group text-left"
              title="Copy username"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-interference uppercase tracking-[0.15em] text-zinc-500">
                  [USERNAME]
                </span>
                {copiedField === "username" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                )}
              </div>

              <p className="text-base font-interference text-zinc-100 truncate mt-4 w-full">
                <span className="text-purple-400">@</span>
                {user.username}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(user.email, "email", "Email")}
              className="md:col-span-2 flex flex-col justify-between p-5 rounded-2xl bg-[#0c0e14] border border-zinc-800/80 hover:border-zinc-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors cursor-pointer group text-left"
              title="Copy email address"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-interference uppercase tracking-[0.15em] text-zinc-500">
                  [EMAIL ADDRESS]
                </span>
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                )}
              </div>

              <p className="text-base font-sans font-medium text-zinc-100 truncate mt-4 w-full">
                {user.email}
              </p>
            </button>
          </div>

          <div className="mt-7 pt-5 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified SOUT Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}
