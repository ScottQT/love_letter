import { memo, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Font } from "opentype.js";
import { useHandwritingAnimation } from "../hooks/useHandwritingAnimation.ts";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.ts";
import { layoutLetter } from "../lib/layoutHandwriting.ts";
import { getCachedHandwritingFont, loadHandwritingFont } from "../lib/loadFont.ts";
import { BrushPen } from "./BrushPen.tsx";

const HEART_PATH =
  "M0 1.5C-0.7 0.2-2.3 0.15-2.3-1.05C-2.3-2.05-1.25-2.35 0-1.25C1.25-2.35 2.3-2.05 2.3-1.05C2.3 0.15 0.7 0.2 0 1.5Z";

type HandwritingRendererProps = {
  message: string;
  signature: string;
  animate: boolean;
  progressRef: RefObject<number>;
  wakeRef: RefObject<(() => void) | null>;
  onCompleteChange?: (complete: boolean) => void;
};

function HandwritingRendererComponent({
  message,
  signature,
  animate,
  progressRef,
  wakeRef,
  onCompleteChange,
}: HandwritingRendererProps) {
  const [font, setFont] = useState<Font | null>(getCachedHandwritingFont);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const penRef = useRef<SVGGElement | null>(null);
  const heartRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    let active = true;
    loadHandwritingFont()
      .then((next) => {
        if (active) setFont(next);
      })
      .catch((error: unknown) => {
        document.documentElement.dataset.fontError = error instanceof Error ? error.message : String(error);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const host = frameRef.current;
    if (!host) return;
    let frame = 0;
    const measure = () => {
      const node = frameRef.current;
      if (!node) return;
      const width = Math.floor(node.clientWidth);
      const height = Math.floor(node.clientHeight);
      if (width < 40 || height < 40) return;
      setSize((current) => {
        if (current && Math.abs(current.width - width) < 4 && Math.abs(current.height - height) < 48) {
          return current;
        }
        return { width, height };
      });
    };
    measure();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(host);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const layout = useMemo(() => {
    if (!font || !size) return null;
    return layoutLetter(font, message, signature, size.width, size.height);
  }, [font, message, signature, size]);

  useEffect(() => {
    if (layout && layout.missing.length > 0) {
      console.warn("Handwriting font is missing glyphs:", layout.missing.join(" "));
    }
  }, [layout]);

  const missing = layout?.missing.length ?? 0;
  const ready = Boolean(layout) && missing === 0;
  const fallback = failed || missing > 0;
  const status = fallback ? "fallback" : ready ? "paths" : "loading";
  const layoutToken = layout
    ? `${layout.width}x${layout.height}:${layout.strokes.length}:${layout.fontSize}`
    : "empty";

  useHandwritingAnimation({
    enabled: animate && (ready || fallback),
    layoutToken,
    strokeCount: ready ? (layout?.strokes.length ?? 0) : 0,
    progressRef,
    wakeRef,
    pathRefs,
    penRef,
    heartRefs,
    onCompleteChange,
  });

  if (fallback) {
    const paragraphs = message.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
    return (
      <div
        ref={frameRef}
        className="font-hand h-full overflow-auto pr-1 text-[clamp(1rem,2.8vw,1.35rem)] leading-relaxed text-ink"
        data-handwriting="fallback"
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-[0.75em] whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
        <p className="mt-2 whitespace-pre-wrap text-right">{signature}</p>
      </div>
    );
  }

  return (
    <div ref={frameRef} className="h-full w-full overflow-hidden">
    <svg
      className="block h-full w-full overflow-hidden"
      viewBox={layout ? `0 0 ${layout.width} ${layout.height}` : "0 0 100 100"}
      preserveAspectRatio="xMinYMin meet"
      role="presentation"
      aria-hidden="true"
      data-handwriting={status}
      data-font-size={layout?.fontSize ?? 0}
      data-strokes={layout?.strokes.length ?? 0}
    >
      {layout?.strokes.map((stroke, index) => (
        <path
          key={stroke.id}
          ref={(node) => {
            pathRefs.current[index] = node;
          }}
          d={stroke.d}
          fill={stroke.color}
          fillOpacity={animate ? 0 : 1}
          fillRule="evenodd"
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: "0 100000" }}
        />
      ))}
      {[0, 1, 2].map((index) => (
        <path
          key={`heart-${index}`}
          ref={(node) => {
            heartRefs.current[index] = node;
          }}
          d={HEART_PATH}
          fill={index === 1 ? "#C77979" : "#EBC8C8"}
          opacity="0"
          pointerEvents="none"
        />
      ))}
      {animate && ready ? <BrushPen penRef={penRef} /> : null}
    </svg>
    </div>
  );
}

export const HandwritingRenderer = memo(HandwritingRendererComponent);
