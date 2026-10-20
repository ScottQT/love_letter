import { useCallback, useRef, useState, type RefObject } from "react";
import { ChevronDown, Link, RotateCcw } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { displayHeading, letterContent, letterPlainText } from "../data/letterContent.ts";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.ts";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.ts";
import { useScrollProgress } from "../hooks/useScrollProgress.ts";
import { HandwritingRenderer } from "./HandwritingRenderer.tsx";
import { LetterEnding, type LetterAnswer } from "./LetterEnding.tsx";
import { LetterPaper } from "./LetterPaper.tsx";

type LetterExperienceProps = {
  sceneRef: RefObject<HTMLElement | null>;
  onReplay: () => void;
};

export function LetterExperience({ sceneRef, onReplay }: LetterExperienceProps) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const progressRef = useScrollProgress(trackRef, sceneRef, wakeRef, !reduced);

  useIsomorphicLayoutEffect(() => {
    if (!reduced) window.scrollTo(0, 0);
  }, [reduced]);
  const [complete, setComplete] = useState(false);
  const [answer, setAnswer] = useState<LetterAnswer>(null);
  const [notice, setNotice] = useState("");

  const onCompleteChange = useCallback((done: boolean) => {
    setComplete(done);
    if (!done) setAnswer(null);
  }, []);

  async function shareLetter() {
    const url = window.location.href;
    const payload = {
      title: displayHeading(),
      text: letterContent.envelopeLine,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice(letterContent.sharedToast);
      window.setTimeout(() => setNotice(""), 2200);
    } catch {
      setNotice(url);
    }
  }

  const showEnding = reduced || complete;

  return (
    <section
      ref={trackRef}
      className={reduced ? "relative z-10 min-h-[100svh]" : "writing-track relative z-10"}
    >
      <div className={reduced ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"}>
        <div className="flex h-full min-h-0 flex-col items-center px-3 pt-14 pb-3 sm:px-6 sm:pt-16 sm:pb-4">
          <header className="w-full max-w-xl shrink-0 text-center">
            <h1 className="font-serif text-[clamp(1.7rem,4vw,3.15rem)] leading-none font-medium tracking-wide text-ink">
              {displayHeading()}
            </h1>
            <span className="mx-auto mt-3 block h-px w-12 bg-gold" />
            <p className="mt-2 font-serif text-[clamp(1rem,2.2vw,1.35rem)] text-brown italic">
              {letterContent.subtitle}
            </p>
          </header>

          <div className="mt-3 w-full max-w-[29rem] min-h-0 flex-1 sm:mt-4">
            <div className="paper-tilt h-full">
              <LetterPaper dateLine={letterContent.dateLine}>
                <div className="absolute inset-[5%_7%_26%_7%] sm:inset-[6%_8%_22%_8.5%]">
                  <HandwritingRenderer
                    message={letterContent.message}
                    signature={letterContent.signature}
                    animate={!reduced}
                    progressRef={progressRef}
                    wakeRef={wakeRef}
                    onCompleteChange={reduced ? undefined : onCompleteChange}
                  />
                </div>
              </LetterPaper>
            </div>
          </div>

          {reduced ? null : (
            <p className="scroll-hint mt-2 flex h-7 shrink-0 items-center gap-1.5 font-serif text-sm tracking-wide text-brown">
              <ChevronDown className="nudge" size={16} strokeWidth={1.6} aria-hidden="true" />
              {letterContent.scrollHint}
            </p>
          )}
        </div>

        <div className="absolute top-3 right-3 z-30 flex gap-2 sm:top-5 sm:right-5">
          <button
            type="button"
            className="icon-button"
            aria-label={letterContent.shareLabel}
            onClick={() => {
              void shareLetter();
            }}
          >
            <Link size={18} strokeWidth={1.6} />
          </button>
          <button type="button" className="icon-button" aria-label={letterContent.replayLabel} onClick={onReplay}>
            <RotateCcw size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center" aria-live="polite">
          {notice ? (
            <p className="rounded-full bg-ink/92 px-4 py-2 font-serif text-base text-ivory">{notice}</p>
          ) : null}
        </div>

        <p className="sr-only">{letterPlainText()}</p>

        {!reduced ? (
          <AnimatePresence>
            {showEnding ? (
              <LetterEnding
                key="ending"
                answer={answer}
                placement="overlay"
                onAnswer={setAnswer}
                onReplay={onReplay}
              />
            ) : null}
          </AnimatePresence>
        ) : null}
      </div>

      {reduced ? (
        <div className="px-4 pb-10">
          <LetterEnding answer={answer} placement="flow" onAnswer={setAnswer} onReplay={onReplay} />
        </div>
      ) : null}
    </section>
  );
}
