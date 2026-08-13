"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { transform } from "next/dist/build/swc";

export default function HornButton() {
  const rippleRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playHornSound() {
    if (!audioRef.current) {
      audioRef.current = new Audio("/Horn_sound.mp3");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      /* Autoplay/permission errors — safe to ignore */
    });
  }

  function handleHonk() {
    playHornSound();

    /* GSAP ripple — brass rings expanding outward */
    if (rippleRef.current) {
      [0, 150, 300].forEach((delay) => {
        const ripple = document.createElement("div");
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid #e8a13d;
          width: 14px; height: 14px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        `;
        rippleRef.current!.appendChild(ripple);
        gsap.to(ripple, {
          delay: delay / 1000,
          width: 110,
          height: 110,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        });
      });
    }

    /* Button shake */
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        keyframes: [
          { x: -4, rotate: -3, duration: 0.07 },
          { x: 4, rotate: 3, duration: 0.07 },
          { x: -3, rotate: -2, duration: 0.06 },
          { x: 3, rotate: 2, duration: 0.06 },
          { x: 0, rotate: 0, duration: 0.05 },
        ],
      });
    }
  }

  return (
    <div className="fixed
    bottom-[30rem]
    sm:bottom-10
    md:bottom-30
    right-[-16px]
    z-50
    pointer-events-auto" style={{ isolation: "isolate", transform: "rotate(180deg)" }}>
      {/* Ripple origin */}
      <div ref={rippleRef} className="absolute inset-0 overflow-visible" aria-hidden="true" />

      <motion.button
        ref={btnRef}
        onClick={handleHonk}
        id="horn-btn"
        aria-label="Honk the horn"
        whileTap={{ scale: 0.88, y: 2 }}
        transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
        className="relative flex flex-col items-center justify-center cursor-pointer select-none"
        whileHover={{
          borderColor: "#e8a13d",
          scaleX: [1, 0.9, 1],
          scaleY: [1, 1.12, 1],
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <span style={{ fontSize: "60px", lineHeight: 1, transform: "rotate(271deg)" }}>📯</span>

      </motion.button>
    </div>
  );
}
