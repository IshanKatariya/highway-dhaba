import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PLAYLIST_ID = "3MyIslcGZuEMYMhOPmKBcg";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
    // Don't cache the token fetch itself — we handle caching below
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

/** True if a self-hosted audio file exists for this track id. */
function localAudioPath(id: string): string | null {
  const file = path.join(process.cwd(), "public", "audio", `${id}.mp3`);
  return fs.existsSync(file) ? `/audio/${id}.mp3` : null;
}

/**
 * Resolve a track to a YouTube video id via the Data API v3 search endpoint.
 * Results are cached hard (a title/artist -> video match never really changes)
 * to stay inside the free daily quota, which search.list burns through fast.
 */
async function searchYouTube(artist: string, title: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10"); // Music
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", `${artist} - ${title} audio`);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 24 * 7 }, // 7 days
    });
    if (!res.ok) {
      console.error(`[spotify/route] YouTube search failed ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    return data.items?.[0]?.id?.videoId ?? null;
  } catch (err) {
    console.error("[spotify/route] YouTube search error:", err);
    return null;
  }
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  /** Highest-resolution album cover URL from Spotify */
  art: string;
  /** External Spotify URL for attribution */
  spotifyUrl: string;
  /** Album name */
  album: string;
  /** Duration in ms */
  durationMs: number;
  /** Self-hosted audio file under public/audio/, if one has been provided */
  src: string | null;
  /** Matched YouTube video id, used as the playback source when `src` is absent */
  youtubeId: string | null;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    // Fetch up to 50 tracks (playlist max per page)
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=50&fields=items(track(id,name,duration_ms,external_urls,artists(name),album(name,images)))`,
      {
        headers: { Authorization: `Bearer ${token}` },
        // Revalidate every 10 minutes so covers stay fresh
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Spotify playlist error ${res.status}: ${text}`);
    }

    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data.items as any[]).filter((item) => item.track && item.track.id);

    const tracks: SpotifyTrack[] = await Promise.all(
      items.map(async (item) => {
        const t = item.track;
        // Pick the largest available image
        const images: { url: string; width: number; height: number }[] =
          t.album.images ?? [];
        images.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
        const art = images[0]?.url ?? "";
        const artist = t.artists.map((a: { name: string }) => a.name).join(", ");

        return {
          id: t.id,
          title: t.name,
          artist,
          art,
          spotifyUrl: t.external_urls?.spotify ?? "",
          album: t.album.name,
          durationMs: t.duration_ms,
          src: localAudioPath(t.id),
          youtubeId: await searchYouTube(artist, t.name),
        };
      })
    );

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[spotify/route] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
