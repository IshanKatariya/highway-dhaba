import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  /** Album cover URL from Spotify */
  art: string;
  /** External Spotify URL for attribution */
  spotifyUrl: string;
  /** Album name */
  album: string;
  /** Duration in ms */
  durationMs: number;
  /** Self-hosted audio file under public/audio/, if one has been provided */
  src: string | null;
  /** Matched YouTube video id — full-length playback source */
  youtubeId: string | null;
  /** Spotify's own 30s preview clip — last-resort fallback source */
  previewUrl: string | null;
}

// Playback data is resolved offline by scripts/build-playlist.mjs (from the
// Exportify CSV + YouTube search) and baked into data/playlist.json. Serving
// it statically means the live site has zero runtime dependency on Spotify's
// or YouTube's APIs — nothing here can 403/rate-limit during real traffic.
export async function GET() {
  try {
    const file = path.join(process.cwd(), "data", "playlist.json");
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw) as { tracks: SpotifyTrack[] };
    return NextResponse.json(data);
  } catch (err) {
    console.error("[spotify/route] Error reading playlist.json:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
