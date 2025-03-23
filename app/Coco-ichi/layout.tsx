import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CoCo壱ゲーム",
  description: "CoCo壱ゲームです。",
  openGraph: {
    title: "CoCo壱ゲーム",
    description: "CoCo壱ゲームです。",
    images: ['/images/Coco-ichi/screen_image.jpg'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 