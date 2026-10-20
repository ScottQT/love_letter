import songUrl from "../assets/audio/the-gioi-cua-anh.mp3";

const VOLUME = 0.5;

export function createSoundtrack() {
  const audio = new Audio(songUrl);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.hidden = true;
  audio.dataset.soundtrack = "the-gioi-cua-anh";
  document.body.appendChild(audio);

  let target = 0;
  let frame = 0;

  const fade = () => {
    const next = audio.volume + (target - audio.volume) * 0.14;
    const settled = Math.abs(target - next) < 0.012;
    audio.volume = settled ? target : next;
    if (settled && target === 0 && !audio.paused) audio.pause();
    if (!settled) frame = window.requestAnimationFrame(fade);
    else frame = 0;
  };

  const startFade = () => {
    if (!frame) frame = window.requestAnimationFrame(fade);
  };

  return {
    async start() {
      target = VOLUME;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      audio.volume = VOLUME;
      try {
        await audio.play();
      } catch {
        return false;
      }
      return true;
    },
    stop() {
      target = 0;
      startFade();
    },
    dispose() {
      target = 0;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      audio.pause();
      audio.remove();
    },
  };
}
