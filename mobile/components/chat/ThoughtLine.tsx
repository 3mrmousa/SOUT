"use client";

import "./ThoughtLine.css";

interface ThoughtLineProps {
  label?: string;
  className?: string;
}

export default function ThoughtLine({
  label = "Typing…",
  className = "",
}: ThoughtLineProps) {
  return (
    <div className={`thought-line ${className}`}>
      <span className="thought-line__shimmer">{label}</span>
    </div>
  );
}
