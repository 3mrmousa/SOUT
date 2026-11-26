"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface TopNavProps {
  href?: string;
  backLabel?: string;
  title: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function TopNav({
  href = "/chat",
  backLabel = "Back",
  title,
  rightElement,
  className = "",
}: TopNavProps) {
  return (
    <div className={`flex items-center justify-between font-sans ${className}`}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#101218] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{backLabel}</span>
      </Link>

      {rightElement || (
        <span className="font-interference text-xs uppercase tracking-wider text-zinc-400">
          [ {title} ]
        </span>
      )}
    </div>
  );
}

export default TopNav;

