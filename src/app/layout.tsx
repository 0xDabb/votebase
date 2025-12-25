import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FrameSDKInit } from "@/components/FrameSDKInit";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "VoteBase - Discover & Vote for Projects",
  description: "Discover amazing projects, upvote your favorites, and connect with builders on Farcaster.",
  keywords: ["farcaster", "projects", "upvote", "builders", "discover"],
  authors: [{ name: "VoteBase Team" }],
  openGraph: {
    title: "VoteBase - Discover & Vote for Projects",
    description: "Discover amazing projects, upvote your favorites, and connect with builders.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoteBase - Discover & Vote for Projects",
    description: "Discover amazing projects, upvote your favorites, and connect with builders.",

  },
  other: {
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://dreamy-mermaid-13209a.netlify.app/og-image.png",
      button: {
        title: "Open VoteBase",
        action: {
          type: "launch_frame",
          name: "VoteBase",
          url: "https://dreamy-mermaid-13209a.netlify.app",
          splashImageUrl: "https://dreamy-mermaid-13209a.netlify.app/icon.png",
          splashBackgroundColor: "#0F0F0F"
        }
      }
    })
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Symbols for icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <FrameSDKInit />
        {children}
      </body>
    </html>
  );
}
