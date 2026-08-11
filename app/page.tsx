import VideoBackground from "@/components/VideoBackground";
import FilmGrain from "@/components/FilmGrain";
import TopBar from "@/components/TopBar";
import HornMarquee from "@/components/HornMarquee";
import HeroTitle from "@/components/HeroTitle";
import MusicPlayer from "@/components/SpotifyCard";
import HornButton from "@/components/HornButton";

export default function Home() {
  return (
    <>
      {/* Layer 0 — looping video */}
      <VideoBackground />

      {/* Layer 1 — film grain */}
      <FilmGrain />


      {/* Layer 3 — fixed chrome */}
      <TopBar />
      <HornButton />

      {/* Layer 4 — main content (hero title fills the screen) */}
      <main
        className="relative z-20 flex min-h-dvh flex-col items-center justify-center px-4"
        style={{ paddingBottom: "160px", paddingTop: "80px" }}
      >
        <HeroTitle />
      </main>

      {/* Layer 5 — fixed bottom player (above marquee) */}
      <MusicPlayer />

      {/* Layer 6 — marquee ticker (lowest fixed UI) */}
      <HornMarquee />
    </>
  );
}
