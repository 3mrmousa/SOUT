"use client";

import { conversationClient } from "@/features/clientIndex";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModal({ isOpen, onClose }: AddModalProps) {
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleClose = () => {
    setError(null);
    setUsername("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanUsername = username.replace(/^@/, "").trim();
    if (!cleanUsername) {
      setError("Username cannot be empty");
      return;
    }

    setIsPending(true);

    try {
      await conversationClient.createConversation({
        recipientUsername: cleanUsername,
      });

      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      toast.success(`Added @${username}`);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
      toast.error(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-[#101218] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex justify-between">
            <p className="text-lg font-medium text-purple-500">Add Contact</p>
            <button onClick={handleClose}>
              <X className="w-6 h-6 cursor-pointer text-red-500" />
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            You can add a contact by entering their username.
            <br />
            It should start with @
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 my-4"
        >
          <input
            type="text"
            autoFocus
            className="w-full border border-zinc-800 rounded-lg px-2 py-2
             text-white bg-zinc-900 outline-none focus:border-purple-600
             focus:bg-zinc-800"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="absolute w-12 h-7 flex items-center justify-center 
            right-2 top-1/2 -translate-y-1/2 bg-purple-700 text-white rounded-lg
            cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-5 h-5 text-zinc-100 " />
            )}
          </button>
        </form>

        {error && (
          <p className="text-sm w-fit mx-auto text-red-500 bg-red-400/10 p-2 rounded-lg text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
