"use client";

import React, { useRef, useState } from "react";
import { useConversationStore } from "@/stores/useConversationStore";
import SlingButton from "@/components/chat/SlingButton";
import { Library, X } from "lucide-react";
import toast from "react-hot-toast";
import VoiceMessage from "./VoiceMessage";

export default function ChatInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const sendMessage = useConversationStore((s) => s.sendMessage);
  
  const onTyping = useConversationStore((s) => s.onTyping);
  const onStopTyping = useConversationStore((s) => s.onStopTyping);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_FILE_SIZE = 30 * 1024 * 1024;

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onStopTyping();

    const textToSend = input;
    const filesToSend = files;
    setFiles([]);
    setInput("");
    try {
      await sendMessage(textToSend, filesToSend);
    } catch (err: any) {
      toast.error(err.message || err.msg || "Failed to send message");
      setFiles(filesToSend);
      setInput(textToSend);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const msg = e.target.value.trim();
    setInput(e.target.value);
    if (!msg) {
      onStopTyping();
      return;
    }
    onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1500);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const validFiles = selected.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 30MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2 p-3 mb-5">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101218] border border-zinc-800 text-xs text-zinc-200 max-w-52"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <textarea
          value={input}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message"
          rows={1}
          className="break-all w-full px-4 py-3 border rounded-xl bg-[#0b0d12] text-zinc-300 border-zinc-800 focus:outline-none focus:border-purple-600 resize-none"
        />
        <button
          type="button"
          onClick={handleAttachmentClick}
          title="Attach files (max 5)"
          aria-label="Attach files"
          className="w-11 h-11 shrink-0 rounded-xl bg-[#101218] border border-zinc-800 text-zinc-400 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          <Library className="w-5 h-5" />
        </button>
        <VoiceMessage sendMessage={sendMessage} />
        <SlingButton
          onSend={handleSend}
          disabled={!input.trim() && files.length === 0}
          padColor="#9333ea"
          iconColor="#ffffff"
          accentColor="#e945f5"
          wellColor="#161922"
          bandColor="#3f3f46"
          size={44}
        />
      </div>

      <input
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
