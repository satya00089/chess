import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess AI | Interactive Chess Analyzer & Visualizer",
  description:
    "Advanced Chess AI analyzer with interactive visualization. Explore chess strategies with alpha-beta pruning algorithm, real-time position evaluation, and move analysis. Perfect for learning and improving your chess skills.",
  keywords: [
    "chess ai",
    "chess analyzer",
    "chess engine",
    "minimax algorithm",
    "alpha-beta pruning",
    "chess visualization",
    "chess strategy",
    "interactive chess",
    "chess learning",
    "chess analysis",
  ],
  authors: [{ name: "Chess AI Team" }],
  creator: "Chess AI",
  publisher: "Chess AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://satya00089.github.io/chess/",
    title: "Chess AI | Interactive Chess Analyzer & Visualizer",
    description:
      "Advanced Chess AI analyzer with interactive visualization. Explore chess strategies with alpha-beta pruning algorithm and real-time position evaluation.",
    siteName: "Chess AI",
    images: [
      {
        url: "/chess/chess.png",
        width: 1200,
        height: 630,
        alt: "Chess AI - Interactive Chess Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess AI | Interactive Chess Analyzer & Visualizer",
    description:
      "Advanced Chess AI analyzer with interactive visualization. Explore chess strategies with alpha-beta pruning algorithm and real-time position evaluation.",
    images: ["/chess/chess.png"],
    creator: "@satyasubudhi089",
  },
  icons: [
    { rel: "icon", url: "/chess/chess.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/chess/chess.png", type: "image/png" },
  ],
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  category: "Games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
