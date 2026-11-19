"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, User, X } from "lucide-react";
import { SafeUser } from "@/features/clientIndex";
import { useDebounce } from "use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userClient } from "@/features/clientIndex";
import toast from "react-hot-toast";

interface ChangeUsernameProps {
  user?: SafeUser | null;
  onClose?: () => void;
}

export const ChangeUsername = ({ user, onClose }: ChangeUsernameProps) => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [debounceValue] = useDebounce(username, 500);
  const cleanUsername = debounceValue?.trim();
  const isSameAsOldUsername = cleanUsername === user?.username;
  const hasInvalidChars = !/^[a-zA-Z0-9_]*$/.test(cleanUsername);
  const isValidFormat = cleanUsername.length >= 3 && !hasInvalidChars;

  const { data, isFetching } = useQuery({
    queryKey: ["check-username", cleanUsername],
    queryFn: async () => {
      const res = await userClient.checkUsername(cleanUsername);
      return res.data;
    },
    enabled: isValidFormat && !isSameAsOldUsername,
    staleTime: 60 * 1000,
  });

  const isAvailable = isSameAsOldUsername ? null : data?.isAvailable;

  const isSubmitDisabled =
    isLoading ||
    isFetching ||
    isSameAsOldUsername ||
    !isValidFormat ||
    isAvailable !== true;

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsLoading(true);
    try {
      const res = await userClient.changeUsername({ username: cleanUsername });
      toast.success(res.message || "Username updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      onClose?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change username",
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
            Change Username
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

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-medium text-zinc-300"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#161922] border border-[#1f2937] text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-600 transition"
              />
              {isFetching ? (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-purple-400" />
              ) : isAvailable === true ? (
                <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              ) : isAvailable === false ? (
                <X className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              ) : null}
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
              disabled={isSubmitDisabled}
              className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-sm font-medium text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Change Username"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeUsername;
