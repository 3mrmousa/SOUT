"use client";

const HERO_SPECS = [
  {
    tag: "[ STORAGE ]",
    value: "Voice & R2",
    sub: "Audio, Video & Docs",
    accent: "text-purple-400",
  },
  {
    tag: "[ SECURITY ]",
    value: "HttpOnly",
    sub: "Rotating JWT + OTP",
    accent: "text-[#e945f5]",
  },
  {
    tag: "[ PRESENCE ]",
    value: "Live Sync",
    sub: "Typing & Read Ticks",
    accent: "text-emerald-400",
  },
];

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center mt-5 px-4">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 bg-black rounded-2xl px-3 py-1.5">
          <span className="bg-blue-400 w-2 h-2 rounded-full animate-ping" />
          <p className="font-interference uppercase tracking-[0.15em] text-[11px]">
            [ SOUT // REAL-TIME COMMUNICATION ]
          </p>
        </div>
        <h1 className="w-full max-w-2xl text-center text-2xl md:text-6xl leading-tight font-raster font-normal tracking-tight">
          Fast, private messaging — built for{" "}
          <span className="text-[#C084FC]">real-time.</span>
        </h1>
        <p className="font-base text-white/80 max-w-xl text-center">
          Instant chats, voice notes, and media sharing powered by Socket.IO,
          Redis, and Cloudflare R2.
        </p>

        <div className="w-full max-w-3xl mt-4 grid grid-cols-1 sm:grid-cols-3 bg-[#101218]/90 backdrop-blur-xl border border-[#1f2937] rounded-2xl divide-y sm:divide-y-0 sm:divide-x shadow-2xl shadow-purple-600/10 overflow-hidden">
          {HERO_SPECS.map((item) => (
            <div
              key={item.tag}
              className="flex flex-col items-start gap-1.5 px-6 py-5"
            >
              <span
                className={`font-interference text-[10px] uppercase tracking-[0.15em] ${item.accent}`}
              >
                {item.tag}
              </span>
              <span className="font-sans text-2xl font-bold tracking-tight text-white">
                {item.value}
              </span>
              <span className="font-sans text-xs text-zinc-400">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
