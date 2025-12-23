import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bote - Discover & Vote for Projects",
  description: "Discover amazing projects, upvote your favorites, and connect with builders on Farcaster.",
  keywords: ["farcaster", "projects", "upvote", "builders", "discover"],
  authors: [{ name: "Bote Team" }],
  openGraph: {
    title: "Bote - Discover & Vote for Projects",
    description: "Discover amazing projects, upvote your favorites, and connect with builders.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bote - Discover & Vote for Projects",
    description: "Discover amazing projects, upvote your favorites, and connect with builders.",
  },
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
        {children}
      </body>
    </html>
  );
}
