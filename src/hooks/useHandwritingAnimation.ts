import { useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.ts";

type Drawable = { index: number; length: number };

type Heart = { life: number; x: number; y: number; vx: number; vy: number };

type Options = {
  enabled: boolean;
  layoutToken: string;
  strokeCount: number;
  progressRef: RefObject<number>;
  wakeRef: RefObject<(() => void) | null>;
  pathRefs: RefObject<(SVGPathElement | null)[]>;
  penRef: RefObject<SVGGElement | null>;
  heartRefs: RefObject<(SVGPathElement | null)[]>;
  onCompleteChange?: (complete: boolean) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function unit(seed: number) {
  const value = Math.sin(seed * 91.7) * 10000;
  return value - Math.floor(value);
}

export function useHandwritingAnimation({
  enabled,
  layoutToken,
  strokeCount,
  progressRef,
  wakeRef,
  pathRefs,
  penRef,
  heartRefs,
  onCompleteChange,
}: Options) {
  const onCompleteRef = useRef(onCompleteChange);
  const drawableRef = useRef<Drawable[]>([]);
  const totalRef = useRef(0);
  const widthRef = useRef(480);
  const sim = useRef({
    smooth: 0,
    angle: -46,
    penX: 0,
    penY: 0,
    placed: false,
    airborne: 0,
    lift: 0,
    lastActive: -1,
    complete: false,
  });
  const hearts = useRef<Heart[]>([
    { life: 0, x: 0, y: 0, vx: 0, vy: 0 },
    { life: 0, x: 0, y: 0, vx: 0, vy: 0 },
    { life: 0, x: 0, y: 0, vx: 0, vy: 0 },
  ]);

  useIsomorphicLayoutEffect(() => {
    onCompleteRef.current = onCompleteChange;
    const drawable: Drawable[] = [];
    let total = 0;
    for (let index = 0; index < strokeCount; index += 1) {
      const el = pathRefs.current[index];
      if (!el) continue;
      let length = 0;
      try {
        length = el.getTotalLength();
      } catch {
        length = 0;
      }
      el.style.strokeDasharray = `${length} ${length}`;
      el.style.strokeDashoffset = enabled ? `${length}` : "0";
      el.setAttribute("fill-opacity", enabled ? "0" : "1");
      delete el.dataset.fill;
      if (length > 0.5) {
        drawable.push({ index, length });
        total += length;
      }
    }
    drawableRef.current = drawable;
    totalRef.current = total;
    sim.current.lastActive = -1;
    const svg = pathRefs.current[0]?.ownerSVGElement;
    if (svg && svg.viewBox.baseVal.width > 0) {
      widthRef.current = svg.viewBox.baseVal.width;
    }
    wakeRef.current?.();
  }, [enabled, layoutToken, onCompleteChange, pathRefs, strokeCount, wakeRef]);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    onCompleteRef.current = onCompleteChange;
    let frame = 0;
    let stopped = false;

    const paintHearts = () => {
      hearts.current.forEach((heart, index) => {
        const el = heartRefs.current[index];
        if (!el) return;
        if (heart.life <= 0) {
          el.setAttribute("opacity", "0");
          return;
        }
        heart.life -= 0.012;
        heart.x += heart.vx;
        heart.y += heart.vy;
        const scale = 0.7 + (1 - Math.max(heart.life, 0)) * 0.4;
        el.setAttribute(
          "transform",
          `translate(${heart.x.toFixed(2)} ${heart.y.toFixed(2)}) scale(${scale.toFixed(3)})`,
        );
        el.setAttribute("opacity", Math.max(heart.life, 0).toFixed(3));
      });
    };

    const step = () => {
      const state = sim.current;
      const target = clamp(progressRef.current / 0.93, 0, 1);
      const delta = target - state.smooth;
      if (Math.abs(delta) < 0.0002) state.smooth = target;
      else {
        const amount = Math.abs(delta);
        const gain = amount > 0.08 ? 0.5 : amount > 0.02 ? 0.32 : 0.18;
        state.smooth += delta * gain;
      }

      const items = drawableRef.current;
      const total = totalRef.current;
      if (total <= 0 || items.length === 0) {
        const fallbackDone = progressRef.current > 0.9;
        if (fallbackDone !== state.complete) {
          state.complete = fallbackDone;
          onCompleteRef.current?.(fallbackDone);
        }
        return Math.abs(target - state.smooth) > 0.0002;
      }

      const finished = state.smooth > 0.997;
      if (finished) state.lift = Math.min(1, state.lift + 0.02);
      else state.lift = Math.max(0, state.lift - 0.1);
      const showEnding = finished && state.lift > 0.62;
      if (showEnding !== state.complete) {
        state.complete = showEnding;
        onCompleteRef.current?.(showEnding);
      }

      let distance = state.smooth * total;
      const firstLength = items[0]?.length ?? 2.8;
      if (target < 0.008) distance = Math.max(distance, Math.min(2.8, firstLength));

      let consumed = 0;
      let activeSlot = items.length - 1;
      let local = items[activeSlot]?.length ?? 0;
      if (distance < total) {
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          if (!item) continue;
          if (consumed + item.length >= distance) {
            activeSlot = index;
            local = distance - consumed;
            break;
          }
          consumed += item.length;
        }
      }

      const previous = state.lastActive;
      const from = previous < 0 ? 0 : Math.min(previous, activeSlot);
      const to = previous < 0 ? activeSlot : Math.max(previous, activeSlot);
      for (let slot = from; slot <= to; slot += 1) {
        const item = items[slot];
        if (!item) continue;
        const el = pathRefs.current[item.index];
        if (!el) continue;
        const drawn = slot < activeSlot ? item.length : slot === activeSlot ? clamp(local, 0, item.length) : 0;
        el.style.strokeDashoffset = String(item.length - drawn);
        const ratio = drawn / item.length;
        const fill = ratio >= 0.995 ? 1 : ratio > 0.84 ? (ratio - 0.84) / 0.16 : 0;
        const key = fill.toFixed(2);
        if (el.dataset.fill !== key) {
          el.setAttribute("fill-opacity", fill.toFixed(3));
          el.dataset.fill = key;
        }
      }

      const active = items[activeSlot];
      const activeEl = active ? pathRefs.current[active.index] : null;
      if (active && activeEl) {
        const drawn = clamp(local, 0.01, active.length);
        const behind = activeEl.getPointAtLength(Math.max(0, drawn - 1.4));
        const ahead = activeEl.getPointAtLength(Math.min(active.length, drawn + 1.4));
        const point = activeEl.getPointAtLength(Math.min(drawn, active.length));
        const rawAngle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * (180 / Math.PI);
        if (Number.isFinite(rawAngle)) {
          const influenced = -46 + clamp(rawAngle, -80, 80) * 0.16;
          state.angle += (influenced - state.angle) * 0.12;
          state.angle = clamp(state.angle, -62, -30);
        }

        const jump = state.placed ? Math.hypot(point.x - state.penX, point.y - state.penY) : 0;
        if (jump > 42) state.airborne = 1;
        if (state.airborne > 0.05) {
          state.penX += (point.x - state.penX) * 0.3;
          state.penY += (point.y - state.penY) * 0.3;
          state.airborne *= 0.88;
        } else {
          state.penX = point.x;
          state.penY = point.y;
          state.airborne = 0;
        }
        state.placed = true;

        const pen = penRef.current;
        if (pen) {
          const scale = clamp(widthRef.current / 680, 0.52, 0.86);
          const lift = state.lift * 28 + state.airborne * 14;
          pen.setAttribute(
            "transform",
            `translate(${state.penX.toFixed(2)} ${(state.penY - lift).toFixed(2)}) rotate(${state.angle.toFixed(2)}) scale(${scale.toFixed(3)})`,
          );
          pen.setAttribute("opacity", (1 - state.lift * 0.4).toFixed(3));
        }

        if (previous >= 0 && activeSlot > previous && activeSlot % (widthRef.current < 700 ? 12 : 7) === 0) {
          const heart = hearts.current.find((item) => item.life <= 0);
          if (heart) {
            heart.life = 1;
            heart.x = point.x;
            heart.y = point.y - 4;
            heart.vx = (unit(activeSlot) - 0.5) * 0.4;
            heart.vy = -0.32;
          }
        }
      }

      state.lastActive = activeSlot;
      paintHearts();

      const heartsAlive = hearts.current.some((heart) => heart.life > 0);
      return (
        Math.abs(target - state.smooth) > 0.0002 ||
        (finished && state.lift < 1) ||
        (!finished && state.lift > 0) ||
        state.airborne > 0.05 ||
        heartsAlive
      );
    };

    const loop = () => {
      if (stopped) return;
      if (step()) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (stopped) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };

    wakeRef.current = wake;
    wake();
    return () => {
      stopped = true;
      if (wakeRef.current === wake) wakeRef.current = null;
      cancelAnimationFrame(frame);
    };
  }, [enabled, heartRefs, layoutToken, onCompleteChange, pathRefs, penRef, progressRef, wakeRef]);
}
