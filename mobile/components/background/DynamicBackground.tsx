"use client";

import FloatingLines from "./FloatingLines";

export default function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden bg-[#0b0d12]"
    >
      <FloatingLines
        linesGradient={["#e945f5", "#ffffff"]}
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={10}
        lineDistance={6}
        bendStrength={-0.5}
        interactive
        clickSwirl
        lineStyle="solid"
        lineWidth={1}
        glow={1}
        brightness={1}
        animationSpeed={1}
        amplitude={1}
        depthOfField={0.5}
        edgeFade={0}
        bendRadius={5}
        parallax
        parallaxStrength={0.2}
        intro
        lightMode={false}
      />
    </div>
  );
}
