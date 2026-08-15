import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Yatra_One, Baloo_2, Russo_One } from "next/font/google";
import "./globals.css";

/* ── Fonts ─────────────────────────────────────────────── */

const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["devanagari", "latin"],
  variable: "--font-yatra",
  display: "swap",
});

const baloo2 = Baloo_2({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["devanagari", "latin"],
  variable: "--font-baloo",
  display: "swap",
});

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo",
  display: "swap",
});

/* ── SEO Metadata ──────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://highwaydhaba.online"),

  title: "Highway Dhaba — Desi Gaane, Highway Ka Soundtrack",

  description:
    "Highway Dhaba is a late-night highway music experience featuring old Hindi songs, desi classics, truck-art aesthetics, and nostalgic highway vibes.",

  keywords: [
    "Highway Dhaba",
    "Highway Dhaba music website",
    "Highway Dhaba songs",
    "Highway Dhaba songs online",
    "Highway Dhaba songs website",
    "Highway Dhaba website",
    "Highway Dhaba music",
    "desi songs",
    "Hindi songs",
    "old Hindi songs",
    "Bollywood songs",
    "Indian highway",
    "dhaba",
    "truck art",
  ],

  authors: [
    {
      name: "Ishan Kataria",
    },
  ],

  creator: "Ishan Kataria",

  alternates: {
    canonical: "https://highwaydhaba.online",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Highway Dhaba 🚛",
    description:
      "A late-night highway soundtrack — old Hindi songs, desi classics, truck-art aesthetics and nostalgia.",
    url: "https://highwaydhaba.online",
    siteName: "Highway Dhaba",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Highway Dhaba 🚛",
    description:
      "A late-night highway soundtrack — old Hindi songs, desi classics and highway nostalgia.",
  },
};

/* ── Viewport ───────────────────────────────────────────── */

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

/* ── Root Layout ────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full">
      <body
        className={`${yatraOne.variable} ${baloo2.variable} ${russoOne.variable} min-h-full`}
      >
        {children}

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}