"use client";

import { motion } from "framer-motion";

interface TruckArtBorderProps {
  variant?: "horizontal" | "frame";
  className?: string;
  animate?: boolean;
}

/* Truck-art motif row — diamond + triangle alternating */
function MotifRow({ count = 16 }: { count?: number }) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const x = i * 20 + 10;
        const isDiamond = i % 2 === 0;
        return isDiamond ? (
          <polygon
            key={i}
            points={`${x},2 ${x + 6},7 ${x},12 ${x - 6},7`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ) : (
          <polygon
            key={i}
            points={`${x},2 ${x + 5},12 ${x - 5},12`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        );
      })}
    </g>
  );
}

export function TruckArtDivider({
  className = "",
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <motion.div
      className={`w-full overflow-hidden ${className}`}
      initial={animate ? { opacity: 0, scaleX: 0.7 } : undefined}
      whileInView={animate ? { opacity: 1, scaleX: 1 } : undefined}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <svg
        viewBox="0 0 320 16"
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Center line */}
        <line x1="0" y1="8" x2="320" y2="8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <MotifRow count={16} />
      </svg>
    </motion.div>
  );
}

/* Frame border for cards — 4 sides */
export function TruckArtFrame({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 text-[#B8860B]">
        <TruckArtDivider animate={false} />
      </div>
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 text-[#B8860B]">
        <TruckArtDivider animate={false} />
      </div>
      {/* Left border (rotated) */}
      <div className="absolute top-0 bottom-0 left-0 flex items-center" style={{ width: "16px" }}>
        <div
          className="text-[#2AABB3]"
          style={{ transform: "rotate(90deg)", transformOrigin: "center", width: "100%", height: "16px" }}
        >
          <svg viewBox="0 0 50 16" className="w-full h-full" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <polygon
                key={i}
                points={`${i * 18 + 4},2 ${i * 18 + 8},7 ${i * 18 + 4},12 ${i * 18},7`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            ))}
          </svg>
        </div>
      </div>
      {/* Right border */}
      <div className="absolute top-0 bottom-0 right-0 flex items-center" style={{ width: "16px" }}>
        <div
          className="text-[#2AABB3]"
          style={{ transform: "rotate(90deg)", transformOrigin: "center", width: "100%", height: "16px" }}
        >
          <svg viewBox="0 0 50 16" className="w-full h-full" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <polygon
                key={i}
                points={`${i * 18 + 4},2 ${i * 18 + 8},7 ${i * 18 + 4},12 ${i * 18},7`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            ))}
          </svg>
        </div>
      </div>
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
