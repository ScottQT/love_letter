export function ParallaxBackground() {
  return (
    <div className="bg-layer pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#e7d3c3]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#f8f1e7_0%,_#ead7c8_46%,_#d8c0ae_100%)]" />
      <div className="ray left-[4%] top-[-12%]" />
      <div className="ray right-[-4%] top-[6%] [animation-delay:-7s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_42%,_rgba(92,58,48,0.18)_100%)]" />
    </div>
  );
}
