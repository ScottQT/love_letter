export function ParallaxBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="bg-layer absolute -inset-[8%]">
        <div className="absolute inset-0 bg-[#e7d3c3]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#f8f1e7_0%,_#ead7c8_46%,_#d8c0ae_100%)]" />
        <div className="ray left-[8%] top-[-8%]" />
        <div className="ray right-[0%] top-[10%] [animation-delay:-7s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_42%,_rgba(92,58,48,0.18)_100%)]" />
      </div>
    </div>
  );
}
