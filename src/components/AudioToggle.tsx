import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { letterContent } from "../data/letterContent.ts";
import { createSoundtrack } from "../lib/soundtrack.ts";

export function AudioToggle() {
  const [on, setOn] = useState(false);
  const soundtrack = useRef<ReturnType<typeof createSoundtrack> | null>(null);
  const request = useRef(0);

  useEffect(() => {
    const player = createSoundtrack();
    soundtrack.current = player;
    let cancelled = false;
    let armed = false;

    const mark = (playing: boolean) => {
      if (!cancelled) setOn(playing);
    };

    const disarm = () => {
      if (!armed) return;
      armed = false;
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
    };

    const begin = (id: number) => {
      void player.start().then((started) => {
        if (cancelled || id !== request.current) return;
        if (started) disarm();
        mark(started);
      });
    };

    const onGesture = () => {
      begin(request.current);
    };

    const id = request.current + 1;
    request.current = id;
    void player.start().then((started) => {
      if (cancelled || id !== request.current) return;
      if (started) {
        mark(true);
        return;
      }
      armed = true;
      window.addEventListener("pointerdown", onGesture, true);
      window.addEventListener("keydown", onGesture, true);
    });

    return () => {
      cancelled = true;
      disarm();
      player.dispose();
      if (soundtrack.current === player) soundtrack.current = null;
    };
  }, []);

  function toggle() {
    const player = soundtrack.current;
    if (!player) return;
    request.current += 1;
    if (on) {
      player.stop();
      setOn(false);
      return;
    }
    const id = request.current;
    void player.start().then((started) => {
      if (id === request.current) setOn(started);
    });
  }

  return (
    <button
      type="button"
      className="icon-button fixed top-3 left-3 z-50 sm:top-5 sm:left-5"
      aria-pressed={on}
      aria-label={on ? letterContent.audioOnLabel : letterContent.audioOffLabel}
      onClick={toggle}
    >
      {on ? <Volume2 size={18} strokeWidth={1.6} /> : <VolumeX size={18} strokeWidth={1.6} />}
    </button>
  );
}
