import { Noto_Sans_JP } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { AppLayout } from "./AppLayoutClient";

// フォントの設定
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://tsuruma-coala-wiki.com"
  ),
  title: "鶴舞こあらWiki",
  description: "みんなで作る鶴舞こあらの情報Wiki",
  openGraph: {
    title: "鶴舞こあらWiki",
    description: "みんなで作る鶴舞こあらの情報Wiki",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tsuruma-coala-wiki.com",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "鶴舞こあらWiki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "鶴舞こあらWiki",
    description: "みんなで作る鶴舞こあらの情報Wiki",
    images: ["/home.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja'>
      <body className={`min-h-screen bg-white ${notoSansJP.className}`}>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
