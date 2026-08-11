"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Pause video when tab is hidden — saves battery/data */
  useEffect(() => {
    const handleVisibility = () => {
      if (!videoRef.current) return;
      if (document.hidden) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Video */}
      <motion.video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        style={{ filter: "saturate(1.2) brightness(0.55)" }}
      >
        <source src="/video/dhaba-loop.mp4" type="video/mp4" />
      </motion.video>

      {/* Multi-layer gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(10,8,5,0.45) 0%,
              rgba(10,8,5,0.05) 30%,
              rgba(10,8,5,0.05) 60%,
              rgba(10,8,5,0.72) 100%
            )
          `,
        }}
      />

      {/* Warm amber vignette from edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,8,5,0.55) 100%)",
        }}
      />
    </div>
  );
}
