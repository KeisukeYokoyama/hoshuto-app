import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "保守党アプリ",
  description: "保守党アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
