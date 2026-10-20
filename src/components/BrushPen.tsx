import type { RefObject } from "react";

type BrushPenProps = {
  penRef: RefObject<SVGGElement | null>;
};

export function BrushPen({ penRef }: BrushPenProps) {
  return (
    <g ref={penRef} opacity="0" pointerEvents="none" aria-hidden="true" data-pen>
      <defs>
        <linearGradient id="pen-wood" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4e1d2a" />
          <stop offset="0.38" stopColor="#8a3b4d" />
          <stop offset="0.62" stopColor="#6b2737" />
          <stop offset="1" stopColor="#3c1520" />
        </linearGradient>
        <linearGradient id="pen-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f3e2bc" />
          <stop offset="0.5" stopColor="#d8bd8a" />
          <stop offset="1" stopColor="#b59460" />
        </linearGradient>
      </defs>
      <path d="M0 0C1.7-7 2.5-15 1.25-22C0.35-22-0.35-22-1.25-22C-2.5-15-1.7-7 0 0Z" fill="#2a1218" />
      <path d="M0 0C0.75-6.5 0.85-13 0.15-19" fill="none" stroke="#D8BD8A" strokeWidth="0.45" opacity="0.85" />
      <rect x="-2.35" y="-28.2" width="4.7" height="7" rx="0.7" fill="url(#pen-gold)" />
      <path
        d="M-2.55-27.4C-3.5-54-3.7-76-2.15-86.2C-1-90 1-90 2.15-86.2C3.7-76 3.5-54 2.55-27.4Z"
        fill="url(#pen-wood)"
      />
      <path
        d="M-1.05-34C-1.55-56-1.4-76-0.55-84"
        fill="none"
        stroke="rgba(255,236,214,0.35)"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <circle cx="0" cy="-87.4" r="2.2" fill="url(#pen-gold)" />
      <circle cx="0" cy="0.35" r="1.05" fill="#6B2737" />
    </g>
  );
}
