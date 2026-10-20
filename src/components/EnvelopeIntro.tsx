import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { letterContent } from "../data/letterContent.ts";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.ts";

type EnvelopeIntroProps = {
  onOpened: () => void;
};

export function EnvelopeIntro({ onOpened }: EnvelopeIntroProps) {
  const reduced = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(onOpened, reduced ? 180 : 1320);
    return () => window.clearTimeout(timer);
  }, [onOpened, opening, reduced]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
      <p className="max-w-xl font-serif text-[clamp(2rem,6vw,3.6rem)] leading-[1.15] font-medium text-ink">
        {letterContent.envelopeLine}
      </p>
      <div className="envelope-stage mt-9 sm:mt-12">
        <div className={opening ? "envelope is-open" : "envelope"}>
          <div className="envelope-back" />
          <div className="envelope-sheet" aria-hidden="true">
            <span />
          </div>
          <div className="fold fold-left" />
          <div className="fold fold-right" />
          <div className="fold fold-bottom" />
          <div className="envelope-flap" />
          <div className={opening ? "envelope-seal is-broken" : "envelope-seal"} aria-hidden="true">
            <Heart size={22} fill="currentColor" strokeWidth={1.4} />
          </div>
        </div>
        <div className="envelope-shadow" />
      </div>
      <button
        type="button"
        className="letter-button letter-button-primary mt-9 min-w-44 px-8 font-serif sm:mt-11"
        onClick={() => setOpening(true)}
        disabled={opening}
      >
        {letterContent.openButton}
      </button>
    </div>
  );
}
