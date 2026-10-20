import { useEffect, useRef, type RefObject } from "react";

export function useScrollProgress(
  trackRef: RefObject<HTMLElement | null>,
  sceneRef: RefObject<HTMLElement | null>,
  wakeRef: RefObject<(() => void) | null>,
  active: boolean,
) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let previous = -1;

    const update = () => {
      const track = trackRef.current;
      if (!track) return;
      const total = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), Math.max(total, 0));
      const next = total <= 0 ? 0 : scrolled / total;
      progressRef.current = next;
      const scene = sceneRef.current;
      if (scene) {
        scene.style.setProperty("--p", next.toFixed(4));
        scene.dataset.progress = next.toFixed(3);
      }
      if (Math.abs(next - previous) > 0.00001) {
        previous = next;
        wakeRef.current?.();
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active, sceneRef, trackRef, wakeRef]);

  return progressRef;
}
