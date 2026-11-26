"use client";

import React from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import LogoutButton from "./LogoutButton";
import Avatar from "@/components/Avatar";

export default function SidebarProfile() {
  const { data: me } = useCurrentUser();

  return (
    <div className="pt-2 border-t border-[#1f2937] flex items-center justify-between gap-1.5">
      <Link
        href="/profile"
        title="View Profile"
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800/60 transition min-w-0 flex-1 group"
      >
        <Avatar
          src={me?.image?.secure_url || me?.profileImage?.secure_url}
          name={me?.name}
          size="sm"
          fallback="image"
          className="ring-1 ring-purple-500/30 group-hover:ring-purple-500/60 transition"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition">
            {me?.name || "Profile"}
          </p>
          <p className="text-[11px] text-zinc-400 truncate">
            @{me?.username || "user"}
          </p>
        </div>
      </Link>

      <LogoutButton />
    </div>
  );
}
