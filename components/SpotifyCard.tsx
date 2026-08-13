"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   FALLBACK TRACKS (used when Spotify API is unavailable)
───────────────────────────────────────── */
const FALLBACK_TRACKS = [
  { id: "1", title: "Safar Ka Hi Tha",  artist: "Mohit Chauhan",   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "2", title: "Tere Bina",        artist: "A.R. Rahman",     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "3", title: "Phir Le Aaya Dil", artist: "Arijit Singh",    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "4", title: "Yeh Dooriyan",     artist: "Mohit Chauhan",   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "5", title: "Choo Lo",          artist: "The Local Train", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "6", title: "Iktara",           artist: "Amit Trivedi",    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
  { id: "7", title: "Tum Se Hi",        artist: "Mohit Chauhan",   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", art: "/image/cover_safar.png", spotifyUrl: "", album: "", durationMs: 0, youtubeId: null, previewUrl: null },
];

/* ─────────────────────────────────────────
   YOUTUBE IFRAME API — minimal ambient types
───────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YTPlayer = any;
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}
import type { SpotifyTrack } from "@/app/api/spotify/route";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function fmt(s: number) {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

/* ─────────────────────────────────────────
   SEEK BAR — thin with amber dot-lights
───────────────────────────────────────── */
function SeekBar({
  current,
  duration,
  onSeek,
}: {
  current: number;
  duration: number;
  onSeek: (r: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const seek = useCallback(
    (clientX: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      onSeek(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
    },
    [onSeek]
  );

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    seek(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging) seek(e.clientX);
  }
  function onPointerUp() {
    setDragging(false);
  }

  const DOTS = 48;
  return (
    <div
      ref={ref}
      className="relative flex items-center cursor-pointer select-none"
      style={{ height: 20 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      {/* Rail */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{ height: 2, background: "rgba(255,255,255,0.08)" }}
      />
      {/* Fill */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{
          height: 2,
          width: `${pct}%`,
          background: "linear-gradient(90deg,#b8860b,#f5a623,#ffd700)",
          transition: dragging ? "none" : "width 0.15s linear",
        }}
      />
      {/* Dot lights */}
      {Array.from({ length: DOTS }).map((_, i) => {
        const dp = (i / (DOTS - 1)) * 100;
        return (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
            style={{
              left: `${dp}%`,
              width: 2.5,
              height: 2.5,
              background:
                dp <= pct ? "#f5a623" : "rgba(255,255,255,0.1)",
              transition: dragging ? "none" : "background 0.1s",
            }}
          />
        );
      })}
      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full z-10"
        style={{
          left: `${pct}%`,
          width: 13,
          height: 13,
          background: "radial-gradient(circle at 35% 30%,#ffd700,#b8860b)",
          boxShadow: "0 0 10px rgba(245,166,35,0.9)",
          border: "1px solid rgba(255,215,0,0.6)",
          transition: dragging ? "none" : "left 0.15s linear",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   VOLUME KNOB
───────────────────────────────────────── */
function VolumeKnob({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (v: number) => void;
}) {
  const startY = useRef<number | null>(null);
  const startVol = useRef(volume);
  const angle = -135 + volume * 270;
  const DOTS = 13;

  return (
    <div
      className="relative cursor-ns-resize flex-shrink-0"
      style={{ width: 44, height: 44 }}
      onPointerDown={(e) => {
        startY.current = e.clientY;
        startVol.current = volume;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (startY.current === null) return;
        const d = (startY.current - e.clientY) / 80;
        onChange(Math.max(0, Math.min(1, startVol.current + d)));
      }}
      onPointerUp={() => {
        startY.current = null;
      }}
      role="slider"
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(volume * 100)}
    >
      {/* SVG indicators */}
      <svg
        width={44}
        height={44}
        viewBox="0 0 44 44"
        className="absolute inset-0"
        aria-hidden
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="rgba(184,134,11,0.2)"
          strokeWidth="1"
        />
        {Array.from({ length: DOTS }).map((_, i) => {
          const deg = -135 + (i / (DOTS - 1)) * 270;
          const rad = (deg * Math.PI) / 180;
          const active = deg <= angle;
          const r1 = 15,
            r2 = 18;
          return (
            <line
              key={i}
              x1={22 + r1 * Math.sin(rad)}
              y1={22 - r1 * Math.cos(rad)}
              x2={22 + r2 * Math.sin(rad)}
              y2={22 - r2 * Math.cos(rad)}
              stroke={active ? "#f5a623" : "rgba(184,134,11,0.18)"}
              strokeWidth={active ? 1.8 : 1.2}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {/* Knob body */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 6,
          background: "radial-gradient(circle at 38% 32%,#1e1608,#0a0805)",
          border: "1px solid rgba(184,134,11,0.25)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              width: 2,
              height: 6,
              background: "linear-gradient(to bottom,#ffd700,#b8860b)",
              borderRadius: 1,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 4px rgba(245,166,35,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SONG LIST DRAWER
───────────────────────────────────────── */
function SongList({
  tracks,
  currentIdx,
  isPlaying,
  onSelect,
  onClose,
}: {
  tracks: SpotifyTrack[];
  currentIdx: number;
  isPlaying: boolean;
  onSelect: (i: number) => void;
  onClose: () => void;
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
        background: "rgb(255 255 255 / 0%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        boxShadow: "0 -12px 60px rgba(0,0,0,0.7)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "#b8860b",
              fontFamily: "auto",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Playlist
          </p>
          <p
            style={{
              fontSize: 15,
              color: "#fff9f0",
              fontFamily: "auto",
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            Highway Dhaba — {tracks.length} Songs
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            width: 32,
            height: 32,
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,249,240,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.06)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Track rows */}
      <div style={{ maxHeight: 280, overflowY: "auto", padding: "6px 0" }}>
        {tracks.map((t, i) => {
          const active = i === currentIdx;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(i)}
              className="w-full flex items-center gap-4 px-5 py-3 text-left transition-all"
              style={{
                
                background: active ? "rgba(245,166,35,0.06)" : "transparent",
                borderLeft: active
                  ? "2px solid #f5a623"
                  : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              {/* Index / playing indicator */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: 24, height: 24 }}
              >
                {active && isPlaying ? (
                  /* Animated bars */
                  <div
                    className="flex items-end gap-[2px]"
                    style={{ height: 14 }}
                  >
                    {[0, 1, 2].map((b) => (
                      <motion.div
                        key={b}
                        className="rounded-sm"
                        style={{ width: 2.5, background: "#f5a623" }}
                        animate={{
                          height: ["30%", "100%", "50%", "80%", "30%"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: b * 0.18,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      color: active
                        ? "#f5a623"
                        : "rgba(255,249,240,0.3)",
                      fontFamily: "auto",
                      fontWeight: 700,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Circle album art from Spotify */}
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{
                  width: 38,
                  height: 38,
                  border: active
                    ? "1.5px solid rgba(245,166,35,0.6)"
                    : "1.5px solid rgba(255,255,255,0.08)",
                  boxShadow: active
                    ? "0 0 10px rgba(245,166,35,0.25)"
                    : "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.art}
                  alt={t.title}
                  width={38}
                  height={38}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: active ? "#fff9f0" : "rgba(255,249,240,0.65)",
                    fontFamily: "auto",
                    letterSpacing: "0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: active ? "#b8860b" : "rgba(255,249,240,0.35)",
                    fontFamily: "auto",
                    marginTop: 1,
                    letterSpacing: "0.06em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.artist}
                </p>
              </div>

              {/* Spotify link for attribution */}
              {t.spotifyUrl && (
                <a
                  href={t.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open on Spotify"
                  style={{
                    flexShrink: 0,
                    color: active
                      ? "#1DB954"
                      : "rgba(29,185,84,0.35)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#1DB954";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = active
                      ? "#1DB954"
                      : "rgba(29,185,84,0.35)";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </a>
              )}

              {/* Active dot */}
              {active && (
                <div
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#f5a623",
                    boxShadow: "0 0 6px #f5a623",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 9999,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Art skeleton */}
      <motion.div
        className="flex-shrink-0 rounded-full"
        style={{
          width: 64,
          height: 64,
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(245,166,35,0.08) 50%,rgba(255,255,255,0.04) 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {[80, 55].map((w, i) => (
          <motion.div
            key={i}
            style={{
              height: i === 0 ? 14 : 10,
              width: `${w}%`,
              borderRadius: 7,
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(245,166,35,0.08) 50%,rgba(255,255,255,0.04) 100%)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Prev = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
);
const Next = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
  </svg>
);
const Play = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const Pause = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

/* ─────────────────────────────────────────
   MAIN PLAYER
───────────────────────────────────────── */
export default function MusicPlayer() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [showList, setShowList] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const [ytReady, setYtReady] = useState(
    () => typeof window !== "undefined" && !!window.YT?.Player
  );
  const [ytApiFailed, setYtApiFailed] = useState(false);
  // The player object exists as soon as it's constructed, but calling
  // playVideo/cueVideoById before its internal onReady fires gets silently
  // dropped (not queued) — every playback command must wait on this flag.
  const [ytPlayerReady, setYtPlayerReady] = useState(false);

  const track = tracks[idx] ?? null;
  // Priority: self-hosted file > full-length YouTube match > Spotify 30s preview.
  // If the YouTube IFrame API never responds, stop waiting and fall back to a
  // playable local/preview source instead of leaving visitors stuck on a dead
  // player for the whole page lifetime.
  const engine: "audio" | "youtube" | null = track?.src
    ? "audio"
    : track?.youtubeId && !ytApiFailed
    ? "youtube"
    : track?.previewUrl
    ? "audio"
    : null;
  const audioSrc = track?.src ?? track?.previewUrl ?? null;

  /* ── Fetch Spotify playlist; fall back to hardcoded tracks if unavailable ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/spotify")
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d.error ?? "API error"));
        return r.json();
      })
      .then((data: { tracks: SpotifyTrack[] }) => {
        if (cancelled) return;
        console.log(`[MusicPlayer] /api/spotify returned ${data.tracks.length} tracks`, data.tracks.length > 0 ? data.tracks[0] : "(using FALLBACK_TRACKS)");
        setTracks(data.tracks.length > 0 ? data.tracks : FALLBACK_TRACKS as SpotifyTrack[]);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[MusicPlayer] /api/spotify fetch failed, using FALLBACK_TRACKS:", err);
        setTracks(FALLBACK_TRACKS as SpotifyTrack[]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Load the YouTube IFrame API once ── */
  useEffect(() => {
    if (window.YT?.Player) {
      console.log("[MusicPlayer] YT API already present on window");
      setYtApiFailed(false);
      setYtReady(true);
      return;
    }
    console.log("[MusicPlayer] injecting YouTube iframe_api script");
    const prevCallback = window.onYouTubeIframeAPIReady;
    const timeoutId = window.setTimeout(() => {
      if (!window.YT?.Player) {
        console.warn("[MusicPlayer] YT API did not respond in time; falling back to local/preview audio instead of waiting forever");
        setYtApiFailed(true);
        setYtReady(false);
      }
    }, 8000);
    window.onYouTubeIframeAPIReady = () => {
      console.log("[MusicPlayer] onYouTubeIframeAPIReady fired — YT script loaded");
      prevCallback?.();
      setYtApiFailed(false);
      setYtReady(true);
      window.clearTimeout(timeoutId);
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => {
        console.error("[MusicPlayer] FAILED to load https://www.youtube.com/iframe_api — check network tab / ad-blocker");
        setYtApiFailed(true);
        setYtReady(false);
        window.clearTimeout(timeoutId);
      };
      document.head.appendChild(tag);
    }
    return () => window.clearTimeout(timeoutId);
  }, []);

  /* ── Create the hidden YouTube player once the API is ready ── */
  useEffect(() => {
    if (!ytReady || ytApiFailed) return;
    if (ytPlayerRef.current) {
      // A dev hot-reload can reset this component's state (ytPlayerReady)
      // while the actual player instance survives untouched — onReady won't
      // fire again for it, so without this we'd be stuck "not ready" forever.
      if (!ytPlayerReady && typeof ytPlayerRef.current.getPlayerState === "function") {
        console.log("[MusicPlayer] reusing surviving YT.Player instance after remount, marking ready");
        setYtPlayerReady(true);
      }
      return;
    }
    console.log("[MusicPlayer] creating YT.Player instance");
    ytPlayerRef.current = new window.YT.Player("yt-audio-player", {
      // A genuinely 0x0 iframe never fully initializes playback in some
      // browsers — size it real, then hide it off-screen via the wrapper div.
      height: "200",
      width: "200",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          console.log("[MusicPlayer] YT player onReady, isMuted:", e.target.isMuted?.());
          e.target.unMute?.();
          e.target.setVolume?.(volume * 100);
          setYtPlayerReady(true);
        },
        onStateChange: (e: { data: number }) => {
          const names: Record<number, string> = { "-1": "UNSTARTED", 0: "ENDED", 1: "PLAYING", 2: "PAUSED", 3: "BUFFERING", 5: "CUED" };
          console.log("[MusicPlayer] YT onStateChange:", names[e.data] ?? e.data);
          if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
          if (e.data === window.YT.PlayerState.PAUSED) setPlaying(false);
          if (e.data === window.YT.PlayerState.ENDED) {
            setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
            setPlaying(true);
          }
        },
        // Video unembeddable/removed — don't get stuck, keep playing the next one.
        onError: (e: { data: number }) => {
          const meanings: Record<number, string> = { 2: "invalid parameter", 5: "HTML5 player error", 100: "video not found", 101: "embedding disallowed by owner", 150: "embedding disallowed by owner" };
          console.error("[MusicPlayer] YT onError code", e.data, "-", meanings[e.data] ?? "unknown", "— skipping to next track");
          setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
          setPlaying(true);
        },
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, ytPlayerReady, ytApiFailed]);

  /* ── Load the current track into whichever engine plays it ── */
  useEffect(() => {
    if (!track) return;
    console.log("[MusicPlayer] track-load effect:", { title: track.title, engine, playing, ytPlayerReady, hasSrc: !!track.src, hasYoutubeId: !!track.youtubeId, hasPreview: !!track.previewUrl });
    if (engine === "audio") {
      const a = audioRef.current;
      if (!a || !audioSrc) { console.warn("[MusicPlayer] audio engine but no audioSrc/element — nothing to play"); return; }
      console.log("[MusicPlayer] setting <audio> src:", audioSrc);
      a.src = audioSrc;
      a.load();
      if (playing) a.play().then(() => console.log("[MusicPlayer] audio.play() resolved")).catch((err) => { console.error("[MusicPlayer] audio.play() rejected:", err); setPlaying(false); });

      // Some CDN URLs stall indefinitely (e.g. blocked QUIC/HTTP3) without
      // ever firing an `error` event — a silent freeze at 0:00. If nothing
      // has loaded within 8s, treat it as failed and move on.
      const watchdog = window.setTimeout(() => {
        if (a.readyState === 0) {
          console.warn("[MusicPlayer] audio stall watchdog fired — readyState still 0 after 8s, skipping track");
          setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
          setPlaying(true);
        }
      }, 8000);
      return () => window.clearTimeout(watchdog);
    } else if (engine === "youtube") {
      const p = ytPlayerRef.current;
      if (!p || !track.youtubeId || !ytPlayerReady || typeof p.loadVideoById !== "function") {
        console.warn("[MusicPlayer] youtube engine but not ready to load:", { hasPlayer: !!p, youtubeId: track.youtubeId, ytPlayerReady });
        return;
      }
      p.unMute?.();
      console.log("[MusicPlayer] calling", playing ? "loadVideoById" : "cueVideoById", track.youtubeId, "isMuted:", p.isMuted?.());
      if (playing) p.loadVideoById(track.youtubeId);
      else p.cueVideoById(track.youtubeId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id, engine, ytReady, ytPlayerReady, audioSrc]);

  /* ── Audio-tag events (self-hosted engine only) ── */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handlers = {
      play: () => { console.log("[MusicPlayer] <audio> play event"); setPlaying(true); },
      pause: () => { console.log("[MusicPlayer] <audio> pause event"); setPlaying(false); },
      timeupdate: () => setCurrentTime(a.currentTime),
      loadedmetadata: () => { console.log("[MusicPlayer] <audio> loadedmetadata, duration:", a.duration); setDuration(a.duration); },
      waiting: () => console.log("[MusicPlayer] <audio> waiting/buffering"),
      canplay: () => console.log("[MusicPlayer] <audio> canplay"),
      ended: () => {
        setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
        setPlaying(true);
      },
      // Load failure (dead URL, network error) — skip instead of freezing.
      error: () => {
        console.error("[MusicPlayer] <audio> error event, code:", a.error?.code, "src:", a.src);
        setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
        setPlaying(true);
      },
    };
    Object.entries(handlers).forEach(([ev, fn]) => a.addEventListener(ev, fn));
    return () =>
      Object.entries(handlers).forEach(([ev, fn]) =>
        a.removeEventListener(ev, fn)
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  /* ── YouTube engine has no timeupdate event — poll instead ── */
  useEffect(() => {
    if (engine !== "youtube") return;
    const id = window.setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      setCurrentTime(p.getCurrentTime());
      const d = p.getDuration?.();
      if (d) setDuration(d);
    }, 250);
    return () => window.clearInterval(id);
  }, [engine]);

  /* ── Watchdog: if we intend to play but the player never confirms it's
     actually playing (dropped command, slow buffer, transient glitch),
     nudge it — and after ~12s of no progress, give up and move on rather
     than leaving the player stuck. ── */
  useEffect(() => {
    if (engine !== "youtube" || !playing || !ytPlayerReady) return;
    let stuckTicks = 0;
    const id = window.setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || typeof p.getPlayerState !== "function") return;
      const state = p.getPlayerState();
      const healthy =
        state === window.YT.PlayerState.PLAYING ||
        state === window.YT.PlayerState.BUFFERING;
      // Belt-and-suspenders: indirect play triggers (auto-skip, retries) can
      // leave YouTube's player silently force-muted by autoplay policy even
      // while it reports PLAYING/BUFFERING — keep stomping it unmuted.
      if (p.isMuted?.()) {
        console.warn("[MusicPlayer] watchdog: player was muted, unmuting");
        p.unMute?.();
      }
      if (healthy) {
        stuckTicks = 0;
        return;
      }
      stuckTicks++;
      if (stuckTicks >= 4) {
        setIdx((i) => (i + 1) % Math.max(tracks.length, 1));
        setPlaying(true);
      } else {
        p.unMute?.();
        p.playVideo?.();
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, [engine, playing, ytPlayerReady, track?.id, tracks.length]);

  /* ── Volume sync ── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytPlayerRef.current?.setVolume) ytPlayerRef.current.setVolume(volume * 100);
  }, [volume]);

  const toggle = () => {
    console.log("[MusicPlayer] toggle() clicked:", { engine, playing, ytPlayerReady, track: track?.title });
    if (engine === "audio") {
      const a = audioRef.current;
      if (!a) return;
      if (playing) a.pause();
      else a.play().catch((err) => { console.error("[MusicPlayer] toggle audio.play() rejected:", err); setPlaying(false); });
    } else if (engine === "youtube") {
      const p = ytPlayerRef.current;
      if (!p || !ytPlayerReady) {
        console.warn("[MusicPlayer] toggle: YT player not ready yet, remembering intent for the next ready callback");
        // Keep the play/pause intent while the iframe API settles; if it never
        // comes back, the loader above falls back to preview/audio playback.
        setPlaying((v) => !v);
        return;
      }
      if (playing) p.pauseVideo?.();
      else { p.unMute?.(); p.playVideo?.(); }
    } else {
      console.warn("[MusicPlayer] toggle: no engine available for this track (no src/youtubeId/previewUrl)");
    }
  };

  const handleSeek = useCallback(
    (r: number) => {
      if (!duration) return;
      if (engine === "audio") {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = r * duration;
      } else if (engine === "youtube") {
        ytPlayerRef.current?.seekTo?.(r * duration, true);
      }
      setCurrentTime(r * duration);
    },
    [duration, engine]
  );

  const selectTrack = (i: number) => {
    setIdx(i);
    setPlaying(true);
    setShowList(false);
  };

  /* ── Render loading / error states ── */
  if (loading) {
    return (
      <motion.div
        className="fixed left-1/2 z-[60] -translate-x-1/2"
        style={{ bottom: 100, width: "min(860px, 94vw)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <LoadingSkeleton />
      </motion.div>
    );
  }


  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div
        id="yt-audio-player"
        style={{ position: "fixed", top: -2000, left: -2000, width: 200, height: 200, pointerEvents: "none" }}
        aria-hidden
      />

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
            <SongList
              tracks={tracks}
              currentIdx={idx}
              isPlaying={playing}
              onSelect={selectTrack}
              onClose={() => setShowList(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Pill player ── */}
        <div
          className="flex items-center gap-4 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9999,
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* ── Circular album art (real Spotify cover) ── */}
          <motion.div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{
              width: 64,
              height: 64,
              border: playing
                ? "2px solid rgba(245,166,35,0.7)"
                : "2px solid rgba(255,255,255,0.1)",
              boxShadow: playing
                ? "0 0 16px rgba(245,166,35,0.35)"
                : "none",
              transition: "border-color 0.4s, box-shadow 0.4s",
            }}
            animate={{ rotate: playing ? 360 : 0 }}
            transition={
              playing
                ? { duration: 10, ease: "linear", repeat: Infinity }
                : { duration: 0 }
            }
          >
            {track?.art ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.art}
                alt={track.title}
                width={64}
                height={64}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 35% 35%, #3d2b00, #1a120b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🎵
              </div>
            )}
          </motion.div>

          {/* ── Track info + seek ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={`t${idx}`}
                style={{
                  fontSize: "clamp(14px,2vw,18px)",
                  fontWeight: 700,
                  color: "#fff9f0",
                  fontFamily: "auto",
                  letterSpacing: "0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
              >
                {track?.title ?? "—"}
              </motion.h2>
            </AnimatePresence>

            {/* Artist */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`a${idx}`}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color: "#b8860b",
                  fontFamily: "auto",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {track?.artist ?? "—"}
              </motion.p>
            </AnimatePresence>

            {/* Seek bar + time */}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,249,240,0.45)",
                  fontFamily: "auto",
                  minWidth: 28,
                } as React.CSSProperties}
              >
                {fmt(currentTime)}
              </span>
              <div className="flex-1">
                <SeekBar
                  current={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,249,240,0.45)",
                  fontFamily: "auto",
                  minWidth: 28,
                  textAlign: "right",
                } as React.CSSProperties}
              >
                {fmt(duration)}
              </span>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Prev */}
            <button
              onClick={() => {
                setIdx((i) => (i - 1 + tracks.length) % tracks.length);
                setPlaying(true);
              }}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 36,
                height: 36,
                color: "rgba(184,134,11,0.7)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5a623";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(184,134,11,0.7)";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
              aria-label="Previous"
            >
              <Prev />
            </button>

            {/* Play / Pause — gold ring circle */}
            <motion.button
              onClick={toggle}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                border: "1.5px solid #f5a623",
                color: "#f5a623",
                background: playing
                  ? "rgba(245,166,35,0.08)"
                  : "transparent",
                boxShadow: playing
                  ? "0 0 20px rgba(245,166,35,0.4)"
                  : "0 0 8px rgba(245,166,35,0.15)",
                transition: "background 0.3s, box-shadow 0.3s",
              }}
              whileHover={{ scale: 1.07, boxShadow: "0 0 28px rgba(245,166,35,0.55)" }}
              whileTap={{ scale: 0.9 }}
              aria-label={playing ? "Pause" : "Play"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={playing ? "p" : "r"}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {playing ? <Pause /> : <Play />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Next */}
            <button
              onClick={() => {
                setIdx((i) => (i + 1) % tracks.length);
                setPlaying(true);
              }}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 36,
                height: 36,
                color: "rgba(184,134,11,0.7)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5a623";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(184,134,11,0.7)";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
              aria-label="Next"
            >
              <Next />
            </button>
          </div>

          {/* ── Divider ── */}
          <div
            style={{
              width: 1,
              height: 40,
              background: "rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          />

          {/* ── Song list toggle ── */}
          <button
            onClick={() => setShowList((s) => !s)}
            className="flex items-center justify-center rounded-full transition-all flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              color: showList ? "#f5a623" : "rgba(184,134,11,0.6)",
              background: showList ? "rgba(245,166,35,0.08)" : "transparent",
              border: showList
                ? "1px solid rgba(245,166,35,0.3)"
                : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!showList) {
                (e.currentTarget as HTMLElement).style.color = "#f5a623";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }
            }}
            onMouseLeave={(e) => {
              if (!showList) {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(184,134,11,0.6)";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }
            }}
            aria-label="Toggle song list"
          >
            <ListIcon />
          </button>

          {/* ── Volume knob ── */}
          <VolumeKnob volume={volume} onChange={setVolume} />
        </div>
      </motion.div>
    </>
  );
}
