import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioToggle } from "./components/AudioToggle.tsx";
import { BotanicalFrame } from "./components/Botanicals.tsx";
import { EnvelopeIntro } from "./components/EnvelopeIntro.tsx";
import { FloatingPetals } from "./components/FloatingPetals.tsx";
import { LetterExperience } from "./components/LetterExperience.tsx";
import { ParallaxBackground } from "./components/ParallaxBackground.tsx";

type Phase = "envelope" | "letter";

export default function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("envelope");

  const openLetter = useCallback(() => {
    window.scrollTo(0, 0);
    setPhase("letter");
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const replay = useCallback(() => {
    setPhase("envelope");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div ref={sceneRef} className="scene relative min-h-[100svh]" data-phase={phase}>
      <ParallaxBackground />
      <FloatingPetals />
      <BotanicalFrame />
      {phase === "letter" ? <LetterExperience sceneRef={sceneRef} onReplay={replay} /> : null}
      <AnimatePresence>
        {phase === "envelope" ? (
          <motion.div
            key="envelope"
            className="fixed inset-0 z-40"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <EnvelopeIntro onOpened={openLetter} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AudioToggle />
    </div>
  );
}
