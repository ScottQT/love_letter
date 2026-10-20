import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { letterContent } from "../data/letterContent.ts";

export type LetterAnswer = "yes" | "later" | null;

type LetterEndingProps = {
  answer: LetterAnswer;
  placement: "overlay" | "flow";
  onAnswer: (answer: Exclude<LetterAnswer, null>) => void;
  onReplay: () => void;
};

const blooms = [
  { left: "12%", top: "18%", delay: 0.05, scale: 0.7 },
  { left: "78%", top: "12%", delay: 0.16, scale: 0.9 },
  { left: "24%", top: "62%", delay: 0.22, scale: 0.55 },
  { left: "68%", top: "58%", delay: 0.1, scale: 0.75 },
  { left: "48%", top: "8%", delay: 0.28, scale: 0.5 },
];

function HeartBloom() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {blooms.map((bloom) => (
        <motion.span
          key={`${bloom.left}-${bloom.top}`}
          className="absolute text-rose"
          style={{ left: bloom.left, top: bloom.top }}
          initial={{ opacity: 0, scale: 0.3, y: 10 }}
          animate={{ opacity: [0, 0.95, 0.7], scale: bloom.scale, y: -8 }}
          transition={{ duration: 1.05, delay: bloom.delay, ease: "easeOut" }}
        >
          <Heart size={22} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  );
}

export function LetterEnding({ answer, placement, onAnswer, onReplay }: LetterEndingProps) {
  const frame =
    placement === "overlay"
      ? "ending-card absolute inset-x-2.5 bottom-2 z-20 mx-auto max-w-xl px-3.5 py-3 sm:inset-x-6 sm:bottom-4 sm:px-6 sm:py-5"
      : "ending-card relative z-20 mx-auto mt-6 w-full max-w-xl px-4 py-5 sm:px-6";

  return (
    <motion.section
      className={frame}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      data-complete="true"
    >
      <AnimatePresence mode="wait">
        {answer === null ? (
          <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-center font-serif text-[1.12rem] leading-snug text-ink sm:text-[clamp(1.25rem,3vw,1.7rem)]">
              {letterContent.endingPrompt}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="letter-button letter-button-primary font-serif sm:min-w-52"
                onClick={() => {
                  onAnswer("yes");
                  window.open(letterContent.messageLink, "_blank", "noopener,noreferrer");
                }}
              >
                {letterContent.yesLabel}
              </button>
              <button
                type="button"
                className="letter-button letter-button-quiet font-serif sm:min-w-52"
                onClick={() => onAnswer("later")}
              >
                {letterContent.laterLabel}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={answer}
            className="relative px-2 py-1 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {answer === "yes" ? <HeartBloom /> : null}
            <p className="relative font-serif text-[clamp(1.15rem,2.6vw,1.6rem)] leading-snug text-ink italic">
              {answer === "yes" ? letterContent.yesMessage : letterContent.laterMessage}
            </p>
            <div className="relative mt-3 flex flex-wrap justify-center gap-2">
              {answer === "yes" ? (
                <a
                  className="letter-button letter-button-primary font-serif sm:min-w-52"
                  href={letterContent.messageLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {letterContent.messageLabel}
                </a>
              ) : null}
              <button type="button" className="letter-button letter-button-quiet font-serif" onClick={onReplay}>
                {letterContent.replayLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
