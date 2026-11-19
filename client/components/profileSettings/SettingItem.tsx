"use client";

import React from "react";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const SettingItem = ({
  icon: Icon,
  label,
  value,
  onClick,
  action,
  className = "",
}: SettingItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-4 bg-[#101218]/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 w-full transition hover:border-zinc-700 hover:bg-[#141720] cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <Icon className="bg-zinc-800 p-2 rounded-full size-9 text-zinc-400 shrink-0" />
        <div className="flex flex-col items-start min-w-0 font-sans">
          <p className="block font-interference text-xs uppercase tracking-wider text-zinc-400">{label}</p>
          {value !== undefined && value !== null && (
            <p className="text-zinc-200 text-sm truncate mt-0.5">{value}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
};

export default SettingItem;
