# Local audio files

Spotify's API only provides track metadata (title, artist, cover art) — it
does not provide playable audio. This player streams audio from files you
place in this folder.

For each track you want playable, add a file named `<spotify-track-id>.mp3`
here. You can find each track's id by visiting `/api/spotify` in the browser
once `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` are set — it returns JSON
with `id`, `title`, and `artist` for every track in the playlist.

Example: a track with id `4uLU6hMCjMI75M1A2tKUQC` needs a file at
`public/audio/4uLU6hMCjMI75M1A2tKUQC.mp3`.

Tracks without a matching file will show up in the playlist but won't play.
