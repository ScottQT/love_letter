import type { ReactNode } from "react";
import { CornerRose } from "./Botanicals.tsx";

type LetterPaperProps = {
  dateLine: string;
  children: ReactNode;
};

export function LetterPaper({ dateLine, children }: LetterPaperProps) {
  return (
    <div className="paper">
      <div className="paper-grain" aria-hidden="true" />
      <div className="paper-crease" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent" />
      <CornerRose className="pointer-events-none absolute right-2 top-2 w-16 opacity-80 sm:right-4 sm:top-4 sm:w-20" />
      {children}
      <p className="pointer-events-none absolute inset-x-5 bottom-[4.5%] text-center font-serif text-[0.72rem] tracking-[0.16em] text-brown sm:text-[0.95rem]">
        {dateLine}
      </p>
    </div>
  );
}
