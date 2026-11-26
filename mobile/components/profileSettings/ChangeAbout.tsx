"use client";

import React, { useEffect, useState } from "react";
import { Loader2, User, X } from "lucide-react";
import { SafeUser, userClient } from "@/features/clientIndex";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ChangeAboutProps {
  user?: SafeUser | null;
  onClose?: () => void;
}

export const ChangeAbout = ({ user, onClose }: ChangeAboutProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const cleanName = name.trim();
  const cleanBio = bio.trim();

  const isUnchanged =
    cleanName === (user?.name || "").trim() &&
    cleanBio === (user?.bio || "").trim();

  const isSubmitDisabled = isLoading || isUnchanged || cleanName.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsLoading(true);
    try {
      const res = await userClient.updateProfile({
        name: cleanName,
        bio: cleanBio,
      });

      toast.success(res.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      onClose?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
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
          <h2 className="text-base font-semibold text-white">Profile Info</h2>
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

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-zinc-300"
            >
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="bio"
                className="block text-xs font-medium text-zinc-300"
              >
                About (Bio)
              </label>
              <span className="text-[11px] text-zinc-500">{bio.length}/160</span>
            </div>
            <textarea
              id="bio"
              rows={3}
              maxLength={160}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself..."
              className="w-full p-3.5 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
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
              disabled={isSubmitDisabled}
              className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-sm font-medium text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeAbout;
