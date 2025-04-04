import Link from "next/link";
import { FaSquareXTwitter } from "react-icons/fa6";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">保守党アプリ</h1>
          <p className="text-lg text-gray-600">
            食傷気味ですが、愛国心を奮い立たせて作りました。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/Coco-ichi">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3">🍛</span>
              <span className="text-lg font-medium text-gray-700">アンチ撃退！CoCo壱ゲーム</span>
            </div>
          </Link>

          <Link href="/ArimotoMaker">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3">🎰</span>
              <span className="text-lg font-medium text-gray-700">有本構文メーカー</span>
            </div>
          </Link>

          <Link href="https://hoshuto-sugoroku.vercel.app/">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3">🎲</span>
              <span className="text-lg font-medium text-gray-700">保守党すごろく</span>
            </div>
          </Link>

          <Link href="/Karuta">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3">🎴</span>
              <span className="text-lg font-medium text-gray-700">保守党かるた</span>
            </div>
          </Link>

          <Link href="/x-search">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3"><FaSquareXTwitter /></span>
              <span className="text-lg font-medium text-gray-700">X 高度な検索もどき</span>
            </div>
          </Link>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>日本を豊かに、強く。</p>
        </footer>
      </div>
    </div>
  );
}
