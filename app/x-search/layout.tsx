import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X 高度な検索もどき',
  description: 'Xの高度な検索機能をスマホアプリでも使えるようにしたサービスです。',
  openGraph: {
    title: 'X 高度な検索もどき',
    description: 'Xの高度な検索機能をスマホアプリでも使えるようにしたサービスです。',
    type: 'website',
    images: [
      {
        url: 'https://hoshuto-app.vercel.app/images/x-search/x-search-cover.png',
        width: 720,
        height: 720,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'X 高度な検索もどき',
    description: 'Xの高度な検索機能をスマホアプリでも使えるようにしたサービスです。',
    images: [
      {
        url: 'https://hoshuto-app.vercel.app/images/x-search/x-search-cover.png',
        width: 720,
        height: 720,
      },
    ],
  },
};

export default function XSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 