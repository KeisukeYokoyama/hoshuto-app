import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | 保守党アプリ',
    default: '保守党アプリ'
  },
  description: "保守党アプリ - 愛国者のためのお役立ちアプリ",
  openGraph: {
    title: "保守党アプリ",
    description: "保守党アプリ - 愛国者のためのお役立ちアプリ",
    type: "website",
    images: [
      {
        url: '/images/Coco-ichi/screen_image.jpg',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/images/Coco-ichi/screen_image.jpg'],
  },
  metadataBase: new URL('https://hoshuto-app.vercel.app'),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main>
          {children}
        </main>
        <GoogleAnalytics gaId="G-X4G7J6Q02L" />
      </body>
    </html>
  );
}
