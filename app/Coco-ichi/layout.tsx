import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CoCo壱ゲーム",
  description: "CoCo壱ゲームです。",
  openGraph: {
    title: "CoCo壱ゲーム",
    description: "CoCo壱ゲームです。",
    images: ['/images/Coco-ichi/ogp_card.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 