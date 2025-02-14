import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">保守党アプリ</h1>
        <p className="text-lg">
          食傷気味ですが、愛国心を奮い立たせて作りました。
        </p>
        <Link href="/ArimotoMaker">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            有本構文メーカー
          </button>
        </Link>
      </main>
    </div>
  );
}
