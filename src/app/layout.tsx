import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FrameSDKInit } from "@/components/FrameSDKInit";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = "https://votebase0301.vercel.app";

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
    images: [`${APP_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoteBase - Discover & Vote for Projects",
    description: "Discover amazing projects, upvote your favorites, and connect with builders.",
    images: [`${APP_URL}/og-image.png`],
  },
  other: {
    // Farcaster Mini App embed metadata (new format)
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/og-image.png`,
      button: {
        title: "Open VoteBase",
        action: {
          type: "launch_miniapp",
          name: "VoteBase",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/icon.png`,
          splashBackgroundColor: "#0F0F0F"
        }
      }
    }),
    // Legacy fc:frame for backwards compatibility
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: `${APP_URL}/og-image.png`,
      button: {
        title: "Open VoteBase",
        action: {
          type: "launch_frame",
          name: "VoteBase",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/icon.png`,
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
        {/* Farcaster SDK ready call - inline for fastest execution */}
        <Script id="farcaster-ready" strategy="beforeInteractive">
          {`
            (function() {
              console.log('[VoteBase] Inline SDK ready check starting...');
              if (window.parent && window.parent !== window) {
                try {
                  window.parent.postMessage({ type: 'fc:ready' }, '*');
                  console.log('[VoteBase] Sent fc:ready to parent');
                } catch(e) {
                  console.log('[VoteBase] Could not post to parent:', e);
                }
              }
            })();
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <FrameSDKInit />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
