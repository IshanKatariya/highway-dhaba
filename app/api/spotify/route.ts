import { NextResponse } from "next/server";

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
    const tracks: SpotifyTrack[] = (data.items as any[])
      .filter((item) => item.track && item.track.id)
      .map((item) => {
        const t = item.track;
        // Pick the largest available image
        const images: { url: string; width: number; height: number }[] =
          t.album.images ?? [];
        images.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
        const art = images[0]?.url ?? "";

        return {
          id: t.id,
          title: t.name,
          artist: t.artists.map((a: { name: string }) => a.name).join(", "),
          art,
          spotifyUrl: t.external_urls?.spotify ?? "",
          album: t.album.name,
          durationMs: t.duration_ms,
        };
      });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[spotify/route] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
