"use client";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

export default function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
    setPlaying(!playing);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0b0d12]/70 border border-zinc-800 w-64 max-w-full">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 shrink-0 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition cursor-pointer"
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={progress}
          onChange={(e) => {
            const time = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = time;
            setProgress(time);
          }}
          className="w-full h-1.5 accent-purple-500 cursor-pointer"
        />
        <span className="text-[10px] font-interference text-zinc-400">
          {fmt(progress)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
