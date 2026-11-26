import type { CSSProperties, FC, HTMLAttributes } from "react";

export type WaveName = "top" | "middle" | "bottom";

export interface WavePosition {
  x?: number;
  y?: number;
  rotate?: number;
}

export interface FloatingLinesProps extends HTMLAttributes<HTMLDivElement> {
  linesGradient?: string[];
  enabledWaves?: WaveName[];
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  animationSpeed?: number;
  amplitude?: number;
  lineWidth?: number;
  lineStyle?: "solid" | "dotted" | "dashed";
  glow?: number;
  brightness?: number;
  depthOfField?: number;
  edgeFade?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  clickSwirl?: boolean;
  intro?: boolean;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  backgroundColor?: string;
  lightMode?: boolean;
  opacity?: number;
  dpr?: number;
}

declare const FloatingLines: FC<FloatingLinesProps>;
export default FloatingLines;
