"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   TRACKS
───────────────────────────────────────── */
const TRACKS = [
  { title: "Safar Ka Hi Tha", artist: "Mohit Chauhan", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", art: "/image/cover_safar.png" },
  { title: "Tere Bina", artist: "A.R. Rahman", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", art: "/image/cover_safar.png" },
  { title: "Phir Le Aaya Dil", artist: "Arijit Singh", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", art: "/image/cover_safar.png" },
  { title: "Yeh Dooriyan", artist: "Mohit Chauhan", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", art: "/image/cover_safar.png" },
  { title: "Choo Lo", artist: "The Local Train", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", art: "/image/cover_safar.png" },
  { title: "Iktara", artist: "Amit Trivedi", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", art: "/image/cover_safar.png" },
  { title: "Tum Se Hi", artist: "Mohit Chauhan", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", art: "/image/cover_safar.png" },
];

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

/* ─────────────────────────────────────────
   SEEK BAR — thin with amber dot-lights
───────────────────────────────────────── */
function SeekBar({ current, duration, onSeek }: { current: number; duration: number; onSeek: (r: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const seek = useCallback((clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  }, [onSeek]);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    seek(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) { if (dragging) seek(e.clientX); }
  function onPointerUp() { setDragging(false); }

  const DOTS = 48;
  return (
    <div ref={ref} className="relative flex items-center cursor-pointer select-none" style={{ height: 20 }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      {/* Rail */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full" style={{ height: 2, background: "rgba(255,255,255,0.08)" }} />
      {/* Fill */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{ height: 2, width: `${pct}%`, background: "linear-gradient(90deg,#b8860b,#f5a623,#ffd700)", transition: dragging ? "none" : "width 0.15s linear" }} />
      {/* Dot lights */}
      {Array.from({ length: DOTS }).map((_, i) => {
        const dp = (i / (DOTS - 1)) * 100;
        return <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
          style={{ left: `${dp}%`, width: 2.5, height: 2.5, background: dp <= pct ? "#f5a623" : "rgba(255,255,255,0.1)", transition: dragging ? "none" : "background 0.1s" }} />;
      })}
      {/* Thumb */}
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full z-10"
        style={{ left: `${pct}%`, width: 13, height: 13, background: "radial-gradient(circle at 35% 30%,#ffd700,#b8860b)", boxShadow: "0 0 10px rgba(245,166,35,0.9)", border: "1px solid rgba(255,215,0,0.6)", transition: dragging ? "none" : "left 0.15s linear" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   VOLUME KNOB
───────────────────────────────────────── */
function VolumeKnob({ volume, onChange }: { volume: number; onChange: (v: number) => void }) {
  const startY = useRef<number | null>(null);
  const startVol = useRef(volume);
  const angle = -135 + volume * 270;
  const DOTS = 13;

  return (
    <div className="relative cursor-ns-resize flex-shrink-0"
      style={{ width: 44, height: 44 }}
      onPointerDown={(e) => { startY.current = e.clientY; startVol.current = volume; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (startY.current === null) return; const d = (startY.current - e.clientY) / 80; onChange(Math.max(0, Math.min(1, startVol.current + d))); }}
      onPointerUp={() => { startY.current = null; }}
      role="slider" aria-label="Volume" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(volume * 100)}>
      {/* SVG indicators */}
      <svg width={44} height={44} viewBox="0 0 44 44" className="absolute inset-0" aria-hidden>
        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(184,134,11,0.2)" strokeWidth="1" />
        {Array.from({ length: DOTS }).map((_, i) => {
          const deg = -135 + (i / (DOTS - 1)) * 270;
          const rad = (deg * Math.PI) / 180;
          const active = deg <= angle;
          const r1 = 15, r2 = 18;
          return <line key={i}
            x1={22 + r1 * Math.sin(rad)} y1={22 - r1 * Math.cos(rad)}
            x2={22 + r2 * Math.sin(rad)} y2={22 - r2 * Math.cos(rad)}
            stroke={active ? "#f5a623" : "rgba(184,134,11,0.18)"}
            strokeWidth={active ? 1.8 : 1.2} strokeLinecap="round" />;
        })}
      </svg>
      {/* Knob body */}
      <div className="absolute rounded-full" style={{ inset: 6, background: "radial-gradient(circle at 38% 32%,#1e1608,#0a0805)", border: "1px solid rgba(184,134,11,0.25)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.7)" }}>
        <div className="w-full h-full flex items-center justify-center" style={{ transform: `rotate(${angle}deg)` }}>
          <div style={{ position: "absolute", top: 3, width: 2, height: 6, background: "linear-gradient(to bottom,#ffd700,#b8860b)", borderRadius: 1, left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 4px rgba(245,166,35,0.7)" }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SONG LIST DRAWER
───────────────────────────────────────── */
function SongList({ tracks, currentIdx, isPlaying, onSelect, onClose }: {
  tracks: typeof TRACKS; currentIdx: number; isPlaying: boolean;
  onSelect: (i: number) => void; onClose: () => void;
}) {
  return (
    <motion.div
      key="songlist"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-full mb-3 left-0 right-0 overflow-hidden"
      style={{
        background: "rgba(8,6,3,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        boxShadow: "0 -12px 60px rgba(0,0,0,0.7)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#b8860b", fontFamily: "var(--font-baloo)", fontWeight: 700, textTransform: "uppercase" }}>
            Playlist
          </p>
          <p style={{ fontSize: 15, color: "#fff9f0", fontFamily: "var(--font-baloo)", fontWeight: 700, marginTop: 2 }}>
            Highway Dhaba — {tracks.length} Songs
          </p>
        </div>
        <button onClick={onClose} className="flex items-center justify-center rounded-full transition-all"
          style={{ width: 32, height: 32, background: "rgba(255,255,255,0.06)", color: "rgba(255,249,240,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Track rows */}
      <div style={{ maxHeight: 280, overflowY: "auto", padding: "6px 0" }}>
        {tracks.map((t, i) => {
          const active = i === currentIdx;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className="w-full flex items-center gap-4 px-5 py-3 text-left transition-all"
              style={{ background: active ? "rgba(245,166,35,0.06)" : "transparent", borderLeft: active ? "2px solid #f5a623" : "2px solid transparent" }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              {/* Index / playing indicator */}
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
                {active && isPlaying ? (
                  /* Animated bars */
                  <div className="flex items-end gap-[2px]" style={{ height: 14 }}>
                    {[0, 1, 2].map(b => (
                      <motion.div key={b} className="rounded-sm"
                        style={{ width: 2.5, background: "#f5a623" }}
                        animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.18, ease: "easeInOut" }} />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: active ? "#f5a623" : "rgba(255,249,240,0.3)", fontFamily: "var(--font-baloo)", fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Circle art */}
              <div className="flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 38, height: 38, border: active ? "1.5px solid rgba(245,166,35,0.6)" : "1.5px solid rgba(255,255,255,0.08)", boxShadow: active ? "0 0 10px rgba(245,166,35,0.25)" : "none" }}>
                <img src={t.art} alt={t.title} width={38} height={38} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff9f0" : "rgba(255,249,240,0.65)", fontFamily: "var(--font-baloo)", letterSpacing: "0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title}
                </p>
                <p style={{ fontSize: 11, color: active ? "#b8860b" : "rgba(255,249,240,0.35)", fontFamily: "var(--font-baloo)", marginTop: 1, letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.artist}
                </p>
              </div>

              {/* Active dot */}
              {active && (
                <div className="flex-shrink-0 rounded-full" style={{ width: 6, height: 6, background: "#f5a623", boxShadow: "0 0 6px #f5a623" }} />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Prev = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>;
const Next = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" /></svg>;
const Play = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
const Pause = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>;

/* ─────────────────────────────────────────
   MAIN PLAYER
───────────────────────────────────────── */
export default function MusicPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [showList, setShowList] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = TRACKS[idx];

  /* Load new track */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = track.src;
    a.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  /* Audio events */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handlers = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      timeupdate: () => setCurrentTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration),
      ended: () => setIdx(i => (i + 1) % TRACKS.length),
    };
    Object.entries(handlers).forEach(([ev, fn]) => a.addEventListener(ev, fn));
    return () => Object.entries(handlers).forEach(([ev, fn]) => a.removeEventListener(ev, fn));
  }, []);

  /* Volume sync */
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play().catch(() => setPlaying(false));
  };

  const handleSeek = useCallback((r: number) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = r * duration;
    setCurrentTime(r * duration);
  }, [duration]);

  const selectTrack = (i: number) => { setIdx(i); setPlaying(true); setShowList(false); };

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <motion.div
        className="fixed left-1/2 z-[60] -translate-x-1/2"
        style={{ bottom: 100, width: "min(860px, 94vw)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Song list drawer ── */}
        <AnimatePresence>
          {showList && (
            <SongList tracks={TRACKS} currentIdx={idx} isPlaying={playing} onSelect={selectTrack} onClose={() => setShowList(false)} />
          )}
        </AnimatePresence>

        {/* ── Pill player ── */}
        <div
          className="flex items-center gap-4 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.02)",   /* #ffffff05 */
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9999,                      /* full pill */
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* ── Circular album art ── */}
          <motion.div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{
              width: 64, height: 64,
              border: playing ? "2px solid rgba(245,166,35,0.7)" : "2px solid rgba(255,255,255,0.1)",
              boxShadow: playing ? "0 0 16px rgba(245,166,35,0.35)" : "none",
              transition: "border-color 0.4s, box-shadow 0.4s",
            }}
            animate={{ rotate: playing ? 360 : 0 }}
            transition={playing ? { duration: 10, ease: "linear", repeat: Infinity } : { duration: 0 }}
          >
            <img src={track.art} alt={track.title} width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>

          {/* ── Track info + seek ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Label
            <p style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(184,134,11,0.8)", fontFamily: "var(--font-russo)", textTransform: "uppercase", fontWeight: 400 }}>
              अभी बज़ रहा है
            </p> */}

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h2 key={`t${idx}`}
                style={{ fontSize: "clamp(14px,2vw,18px)", fontWeight: 700, color: "#fff9f0", fontFamily: "var(--font-stencil), sans-serif", letterSpacing: "0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}>
                {track.title}
              </motion.h2>
            </AnimatePresence>

            {/* Artist */}
            <AnimatePresence mode="wait">
              <motion.p key={`a${idx}`}
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "#b8860b", fontFamily: "var(--font-stencil), sans-serif", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {track.artist}
              </motion.p>
            </AnimatePresence>

            {/* Seek bar + time */}
            <div className="flex items-center gap-2 mt-1.5">
              <span style={{ fontSize: 10, color: "rgba(255,249,240,0.45)", fontFamily: "var(--font-baloo)", minWidth: 28, tabularNums: true } as React.CSSProperties}>
                {fmt(currentTime)}
              </span>
              <div className="flex-1"><SeekBar current={currentTime} duration={duration} onSeek={handleSeek} /></div>
              <span style={{ fontSize: 10, color: "rgba(255,249,240,0.45)", fontFamily: "var(--font-baloo)", minWidth: 28, textAlign: "right" } as React.CSSProperties}>
                {fmt(duration)}
              </span>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Prev */}
            <button onClick={() => { setIdx(i => (i - 1 + TRACKS.length) % TRACKS.length); setPlaying(true); }}
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, color: "rgba(184,134,11,0.7)", background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f5a623"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(184,134,11,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              aria-label="Previous">
              <Prev />
            </button>

            {/* Play / Pause — gold ring circle */}
            <motion.button onClick={toggle}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 52, height: 52,
                border: "1.5px solid #f5a623",
                color: "#f5a623",
                background: playing ? "rgba(245,166,35,0.08)" : "transparent",
                boxShadow: playing ? "0 0 20px rgba(245,166,35,0.4)" : "0 0 8px rgba(245,166,35,0.15)",
                transition: "background 0.3s, box-shadow 0.3s",
              }}
              whileHover={{ scale: 1.07, boxShadow: "0 0 28px rgba(245,166,35,0.55)" }}
              whileTap={{ scale: 0.9 }}
              aria-label={playing ? "Pause" : "Play"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={playing ? "p" : "r"}
                  initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.12 }}>
                  {playing ? <Pause /> : <Play />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Next */}
            <button onClick={() => { setIdx(i => (i + 1) % TRACKS.length); setPlaying(true); }}
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, color: "rgba(184,134,11,0.7)", background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f5a623"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(184,134,11,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              aria-label="Next">
              <Next />
            </button>
          </div>

          {/* ── Divider ── */}
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

          {/* ── Volume knob ── */}
          <VolumeKnob volume={volume} onChange={setVolume} />


        </div>
      </motion.div>
    </>
  );
}
