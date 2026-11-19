"use client";

import React from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "full" | "xl" | "lg";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  shape?: AvatarShape;
  fallback?: "image" | "initial";
  className?: string;
  imageClassName?: string;
}

const sizeConfig: Record<
  AvatarSize,
  { container: string; text: string; iconPadding: string }
> = {
  sm: {
    container: "w-8 h-8",
    text: "text-xs",
    iconPadding: "p-1.5",
  },
  md: {
    container: "w-9 h-9",
    text: "text-sm",
    iconPadding: "p-1.5",
  },
  lg: {
    container: "w-20 h-20",
    text: "text-2xl",
    iconPadding: "p-3",
  },
  xl: {
    container: "w-28 h-28",
    text: "text-4xl",
    iconPadding: "p-4",
  },
};

const shapeConfig: Record<AvatarShape, string> = {
  full: "rounded-full",
  xl: "rounded-xl",
  lg: "rounded-lg",
};

export default function Avatar({
  src,
  name,
  size = "md",
  shape = "xl",
  fallback = "image",
  className = "",
  imageClassName = "",
}: AvatarProps) {
  const { container, text, iconPadding } = sizeConfig[size] || sizeConfig.md;
  const roundedClass = shapeConfig[shape] || "rounded-full";

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-hidden bg-purple-600/20 border border-purple-500/30 ${roundedClass} ${container} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name || "User Avatar"}
          className={`w-full h-full object-cover ${roundedClass} ${imageClassName}`}
        />
      ) : fallback === "initial" ? (
        <span className={`font-semibold text-purple-300 uppercase ${text}`}>
          {(name?.trim()?.[0] || "U").toUpperCase()}
        </span>
      ) : (
        <img
          src="/default-avatar.svg"
          alt={name || "User Avatar"}
          className={`w-full h-full object-contain ${iconPadding} ${imageClassName}`}
        />
      )}
    </div>
  );
}

