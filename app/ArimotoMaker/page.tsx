"use client";

import React, { useState, useEffect } from "react";
import { sentensData } from "../data/sentensData";

export default function Arimoto() {
  const [inputText, setInputText] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // シャッフルアニメーション
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isShuffling) {
      intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * sentensData.length);
        setDisplayText(sentensData[randomIndex].text);
      }, 50);
    }

    // クリーンアップ関数
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isShuffling]);

  // ボタンクリックハンドラー
  const handleButtonClick = () => {
    if (isShuffling) {
      setIsShuffling(false);
      setInputText(displayText);
    } else {
      setIsShuffling(true);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">有本構文メーカー</h1>
        <p className="text-base">
          有本構文メーカーは、有本構文を作成するためのツールです。
        </p>
        <div className="w-full">
          <label htmlFor="inputText" className="text-sm font-bold">
            上の句を入力してください
          </label>
          <div className="w-full p-2 border rounded-md my-2 min-h-[40px]">
            {displayText || inputText}
          </div>
        </div>
        <div>
          <label htmlFor="outputText" className="text-sm font-bold">
            ボタンをクリックしてください
          </label>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md block mt-2"
            onClick={handleButtonClick}
          >
            {isShuffling ? 'ストップ' : 'スタート'}
          </button>
        </div>
      </main>
    </div>
  );
}