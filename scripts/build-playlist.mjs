// One-time batch job: turn the Exportify CSV into a static playlist.json that
// ships with the site. Resolves each track to a full-length YouTube match;
// tracks that don't get one (missing key, quota, no match) keep their
// Spotify 30s preview URL as a guaranteed-real-audio fallback.
import fs from "fs";
import path from "path";

const CSV_PATH = path.join(process.cwd(), "public", "highway_wala_playlist_og.csv");
const OUT_PATH = path.join(process.cwd(), "data", "playlist.json");
const API_KEY = process.env.YOUTUBE_API_KEY?.trim();

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

async function searchYouTube(artist, title) {
  if (!API_KEY) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", `${artist} - ${title} audio`);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason;
    if (reason === "quotaExceeded") throw new Error("QUOTA_EXCEEDED");
    console.error(`  ! YouTube search failed (${res.status}): ${body?.error?.message ?? ""}`);
    return null;
  }
  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

async function main() {
  const csv = fs.readFileSync(CSV_PATH, "utf-8");
  const [header, ...rows] = parseCSV(csv);
  const col = (name) => header.indexOf(name);

  const iUri = col("Track URI");
  const iName = col("Track Name");
  const iArtist = col("Artist Name(s)");
  const iAlbum = col("Album Name");
  const iArt = col("Album Image URL");
  const iDur = col("Track Duration (ms)");
  const iPreview = col("Track Preview URL");

  // Merge with any previously-resolved data so re-running the script
  // (e.g. after quota resets) only fills in gaps instead of redoing work.
  let existing = {};
  if (fs.existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"));
      for (const t of prev.tracks ?? []) existing[t.id] = t;
    } catch { /* ignore corrupt/old file */ }
  }

  const tracks = [];
  let resolved = 0;
  let quotaHit = false;

  for (const r of rows) {
    const uri = r[iUri]?.trim();
    if (!uri?.startsWith("spotify:track:")) continue;
    const id = uri.replace("spotify:track:", "");
    const title = r[iName]?.trim() ?? "";
    const artist = r[iArtist]?.trim() ?? "";
    const album = r[iAlbum]?.trim() ?? "";
    const art = r[iArt]?.trim() ?? "";
    const durationMs = parseInt(r[iDur] ?? "0", 10) || 0;
    const previewUrl = r[iPreview]?.trim() || null;

    let youtubeId = existing[id]?.youtubeId ?? null;
    if (!youtubeId && !quotaHit) {
      try {
        youtubeId = await searchYouTube(artist, title);
        if (youtubeId) resolved++;
      } catch (err) {
        if (err.message === "QUOTA_EXCEEDED") {
          quotaHit = true;
          console.error(`\nYouTube quota hit after ${resolved} matches — remaining tracks fall back to Spotify previews. Re-run this script after quota resets to fill in the rest.\n`);
        } else {
          console.error(`  ! ${artist} - ${title}:`, err.message);
        }
      }
    }

    tracks.push({
      id,
      title,
      artist,
      art,
      spotifyUrl: `https://open.spotify.com/track/${id}`,
      album,
      durationMs,
      src: null, // reserved for self-hosted overrides dropped in public/audio/
      youtubeId,
      previewUrl,
    });
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ tracks }, null, 2));

  const withPreview = tracks.filter((t) => t.previewUrl).length;
  const withYoutube = tracks.filter((t) => t.youtubeId).length;
  const withNothing = tracks.filter((t) => !t.youtubeId && !t.previewUrl).length;
  console.log(`Wrote ${tracks.length} tracks to ${OUT_PATH}`);
  console.log(`  YouTube matches: ${withYoutube}`);
  console.log(`  Preview fallback available: ${withPreview}`);
  console.log(`  No playable source: ${withNothing}`);
}

main();
