"use client";

import { ArrowUpRight } from "lucide-react";

const TECH_STACK = [
  "Next.js 16",
  "Express 5",
  "PostgreSQL",
  "Redis",
  "Socket.IO",
  "Cloudflare R2",
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1f2937] bg-[#0b0d12]/80 backdrop-blur-md mt-20">
      <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-semibold tracking-wide text-white">
            SOUT
          </span>
        </div>

        <p className="font-interference text-[11px] uppercase tracking-[0.12em] text-zinc-500 text-center">
          {TECH_STACK.join("  •  ")}
        </p>

        <a
          href="https://github.com/3mrmousa/SOUT"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-sans text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
        >
          <span>GitHub</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </footer>
  );
}
