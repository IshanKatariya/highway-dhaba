"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

function createHornSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.4);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(330, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(310, ctx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    /* Silently fail — no AudioContext */
  }
}

export default function HornButton() {
  const rippleRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleHonk() {
    createHornSound();

    /* GSAP ripple */
    if (rippleRef.current) {
      [0, 150, 300].forEach((delay) => {
        const ripple = document.createElement("div");
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid #F5A623;
          width: 12px; height: 12px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        `;
        rippleRef.current!.appendChild(ripple);
        gsap.to(ripple, {
          delay: delay / 1000,
          width: 100,
          height: 100,
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
          { x: -4, rotate: -2, duration: 0.07 },
          { x: 4, rotate: 2, duration: 0.07 },
          { x: -3, rotate: -1, duration: 0.06 },
          { x: 3, rotate: 1, duration: 0.06 },
          { x: 0, rotate: 0, duration: 0.05 },
        ],
      });
    }
  }

  return (
    <div className="fixed bottom-14 left-4 z-50 pointer-events-auto" style={{ isolation: "isolate" }}>
      {/* Ripple origin */}
      <div ref={rippleRef} className="absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden="true" />

      <motion.button
        ref={btnRef}
        onClick={handleHonk}
        id="horn-btn"
        aria-label="Honk the horn"
        whileTap={{ scale: 0.88, y: 2 }}
        className="relative flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none"
        style={{
          background: "rgba(10,8,5,0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(184,134,11,0.45)",
          borderRadius: "4px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          fontFamily: "var(--font-baloo)",
          fontWeight: 700,
          fontSize: "13px",
          color: "#FFF9F0",
          outline: "none",
          /* Truck-art angled corners via clip-path */
          clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
        }}
        whileHover={{
          boxShadow: "0 6px 28px rgba(0,0,0,0.6), 0 0 24px rgba(232,160,32,0.25)",
          borderColor: "rgba(245,166,35,0.65)",
          transition: { duration: 0.2 },
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>📯</span>
        <span className="hidden sm:inline">Horn OK Please</span>
      </motion.button>
    </div>
  );
}
