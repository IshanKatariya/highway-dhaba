import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Yatra_One, Baloo_2, Russo_One } from "next/font/google";
import "./globals.css";

/* ── Self-hosted via next/font/google (auto-optimized, zero FOUT) ─── */
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

/* Condensed stencil-style Latin for HIGHWAY DHABA subhead */
const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Highway Dhaba — Desi Gaane, Highway Ka Soundtrack",
  description:
    "Sabse zyada baje gaane highway ke dhabe pe. Most played desi bangers on the open road.",
  openGraph: {
    title: "Highway Dhaba",
    description: "Desi highway bangers that blast at every dhaba.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Highway Dhaba",
    description: "Desi highway bangers that blast at every dhaba.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

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
      </body>
    </html>
  );
}
