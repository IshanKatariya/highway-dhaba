"use client";

/* Film grain overlay — animated SVG feTurbulence for living texture */
export default function FilmGrain() {
  return (
    <>
      {/* Static noise layer */}
      <div
        className="fixed inset-0 z-[90] pointer-events-none select-none"
        aria-hidden="true"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "280px 280px",
          mixBlendMode: "overlay",
        }}
      />
      {/* Subtle paper / warm tone layer */}
      <div
        className="fixed inset-0 z-[89] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(232,160,32,0.04) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
