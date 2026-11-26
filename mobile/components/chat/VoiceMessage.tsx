"use client";

import { useRef, useState } from "react";
import { Check, Mic, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useConversationStore } from "@/stores/useConversationStore";

export default function VoiceMessage({
  sendMessage,
}: {
  sendMessage: (text: string, file: File[]) => Promise<void>;
}) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const onRecording = useConversationStore((s) => s.onRecording);
  const onStopRecording = useConversationStore((s) => s.onStopRecording);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      onRecording();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopAndSendVoice = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    if (timerRef.current) clearInterval(timerRef.current);

    recorder.onstop = async () => {
      const baseMime = recorder.mimeType.split(";")[0] || "audio/webm";
      const ext = baseMime === "audio/mp4" ? "m4a" : "webm";

      const audioBlob = new Blob(audioChunksRef.current, { type: baseMime });

      const voiceFile = new File([audioBlob], `voice-${Date.now()}.${ext}`, {
        type: baseMime,
      });

      recorder.stream.getTracks().forEach((track) => track.stop());

      onStopRecording();
      setIsRecording(false);
      setRecordingSeconds(0);

      if (audioBlob.size > 0) {
        try {
          await sendMessage("", [voiceFile]);
        } catch {
          toast.error("Failed to send voice message");
        }
      }
    };

    recorder.stop();
  };

  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timerRef.current) clearInterval(timerRef.current);

    recorder.onstop = () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
      audioChunksRef.current = [];
      onStopRecording();
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    recorder.stop();
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  if (!isRecording) {
    return (
      <button
        type="button"
        onClick={startRecording}
        title="Record voice message"
        aria-label="Record voice message"
        className="w-11 h-11 shrink-0 rounded-xl bg-[#101218] border border-zinc-800 text-zinc-400 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
      >
        <Mic className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3.5 h-11 rounded-xl bg-[#101218] border border-purple-500/40 text-zinc-200">
      {/* Pulsing recording dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>

      {/* Timer */}
      <span className="font-interference text-xs tracking-wider text-zinc-200 min-w-10">
        {formatTime(recordingSeconds)}
      </span>

      {/* Cancel button */}
      <button
        type="button"
        onClick={cancelRecording}
        title="Cancel recording"
        aria-label="Cancel recording"
        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Send voice button */}
      <button
        type="button"
        onClick={stopAndSendVoice}
        title="Send voice message"
        aria-label="Send voice message"
        className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
}
