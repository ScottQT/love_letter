type MarkProps = {
  className?: string;
};

export function CornerRose({ className = "" }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 92 92" fill="none" aria-hidden="true">
      <path d="M46 78c8 7 18 4 20-4" stroke="#8B735E" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M46 74c-2-14-12-20-16-34" stroke="#8B735E" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M34 48c-8 2-12 8-10 14 6-2 10-6 10-14Z" stroke="#C77979" strokeWidth="1" fill="#EBC8C8" fillOpacity="0.35" />
      <path d="M58 44c8 3 11 10 7 16-6-3-9-8-7-16Z" stroke="#8B735E" strokeWidth="1" fill="#EBC8C8" fillOpacity="0.28" />
      <path
        d="M46 42c4-8 12-8 12-1 6-5 13-1 10 6 7 1 7 10 1 12 5 6-1 13-8 10 0 7-10 8-12 2-6 4-13-2-9-9-7-2-6-11 1-13-3-8 5-12 5-7Z"
        stroke="#C77979"
        strokeWidth="1.05"
        fill="#EBC8C8"
        fillOpacity="0.45"
      />
      <circle cx="46" cy="48" r="3.2" fill="#C77979" fillOpacity="0.55" />
    </svg>
  );
}

function Sprig({ className = "" }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 70 120" fill="none" aria-hidden="true">
      <path d="M34 112c2-28 4-52 0-86" stroke="#8B735E" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M34 86c-14-4-22-14-20-24 12 2 18 10 20 24Z" stroke="#8B735E" strokeWidth="1" fill="#EBC8C8" fillOpacity="0.3" />
      <path d="M34 64c16-2 24-12 22-22-14 1-20 10-22 22Z" stroke="#C77979" strokeWidth="1" fill="#EBC8C8" fillOpacity="0.28" />
      <path d="M34 42c-12-6-16-16-12-24 10 4 14 12 12 24Z" stroke="#8B735E" strokeWidth="1" fill="#F3D5D5" fillOpacity="0.4" />
    </svg>
  );
}

export function BotanicalFrame() {
  return (
    <div className="botanical-layer pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <CornerRose className="absolute -left-8 top-6 w-28 opacity-45 sm:w-40 sm:opacity-70" />
      <CornerRose className="absolute -right-10 bottom-4 w-32 -scale-x-100 opacity-40 sm:w-44 sm:opacity-60" />
      <Sprig className="absolute right-[6%] top-8 hidden w-16 opacity-50 sm:block" />
      <Sprig className="absolute bottom-8 left-[5%] hidden w-14 -scale-x-100 rotate-12 opacity-40 sm:block" />
    </div>
  );
}
