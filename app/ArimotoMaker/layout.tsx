import { Metadata } from "next";

export const metadata: Metadata = {
  title: "有本構文メーカー",
  description: "有本構文を生成するための愛国ツールです。",
  openGraph: {
    title: "有本構文メーカー",
    description: "有本構文を生成するための愛国ツールです。",
    images: ['/images/ArimotoMaker/ogp_card.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 