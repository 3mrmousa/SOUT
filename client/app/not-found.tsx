import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DynamicBackground from "@/components/background/DynamicBackground";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-screen w-full bg-[#0b0d12] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <DynamicBackground />

      <div className="w-full max-w-md bg-[#101218]/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 opacity-40 blur-md group-hover:opacity-75 transition duration-300" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#0b0d12] border border-zinc-800 flex items-center justify-center p-1.5 shadow-inner overflow-hidden">
              <img
                src="/logo-icon.svg"
                alt="SOUT Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="font-interference text-[11px] uppercase tracking-[0.15em] text-purple-400">
              [ SOUT // 404 ]
            </p>
            <h1 className="font-raster text-4xl sm:text-5xl font-normal tracking-tight text-white">
              Page not found
            </h1>
            <p className="font-sans text-sm text-zinc-400 pt-1">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Messages</span>
        </Link>
      </div>
    </div>
  );
}

