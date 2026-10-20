const petals = [
  { left: "8%", top: "72%", size: 18, duration: 23, delay: -4, color: "#EBC8C8", hide: false },
  { left: "18%", top: "88%", size: 12, duration: 27, delay: -12, color: "#C77979", hide: false },
  { left: "74%", top: "78%", size: 16, duration: 25, delay: -8, color: "#E7C2C4", hide: false },
  { left: "86%", top: "64%", size: 11, duration: 21, delay: -2, color: "#D8BD8A", hide: false },
  { left: "46%", top: "92%", size: 14, duration: 29, delay: -16, color: "#EBC8C8", hide: true },
  { left: "62%", top: "84%", size: 10, duration: 24, delay: -6, color: "#C77979", hide: true },
  { left: "30%", top: "70%", size: 13, duration: 26, delay: -18, color: "#F0D2D2", hide: true },
];

const dust = Array.from({ length: 16 }, (_, index) => ({
  left: `${(index * 17) % 100}%`,
  top: `${(index * 29) % 100}%`,
  size: index % 4 === 0 ? 3 : 2,
  duration: 7 + (index % 5),
  delay: -index * 0.7,
  hide: index > 7,
}));

export function FloatingPetals() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
        <div className="petal-layer absolute inset-0">
        {petals.map((petal) => (
          <span
            key={`${petal.left}-${petal.top}`}
            className={`petal ${petal.hide ? "hidden sm:block" : ""}`}
            style={{
              left: petal.left,
              top: petal.top,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
            }}
          >
            <svg width={petal.size} height={petal.size * 0.62} viewBox="0 0 20 12" fill="none">
              <ellipse cx="10" cy="6" rx="8" ry="4.2" fill={petal.color} opacity="0.8" transform="rotate(-28 10 6)" />
            </svg>
          </span>
        ))}
        </div>
      </div>
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
        <div className="dust-layer absolute inset-0">
        {dust.map((speck) => (
          <span
            key={`${speck.left}-${speck.top}`}
            className={`dust ${speck.hide ? "hidden sm:block" : ""}`}
            style={{
              left: speck.left,
              top: speck.top,
              width: speck.size,
              height: speck.size,
              animationDuration: `${speck.duration}s`,
              animationDelay: `${speck.delay}s`,
            }}
          />
        ))}
        </div>
      </div>
    </>
  );
}
