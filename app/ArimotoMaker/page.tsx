"use client";

import React, { useState, useEffect } from "react";
import { sentensData } from "../data/sentensData";

export default function Arimoto() {
  const [inputText, setInputText] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのマウント確認のみを行う
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className="justify-items-center min-h-screen px-6 py-8 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center sm:items-start">
        {isClient && (
          <>
            <h1 className="text-4xl font-bold">有本構文メーカー</h1>
            <p className="text-base">
              有本構文を生成するための愛国ツールです。
            </p>
            <div>
              <button 
                className="bg-gray-900 text-white px-4 py-2 rounded-md block"
                onClick={handleButtonClick}
              >
                {isShuffling ? 'ストップ' : 'したがいまして'}
              </button>
            </div>
            <div className="w-full relative">
              <div 
                className="w-full h-[200px] bg-cover bg-center"
                style={{ backgroundImage: "url('/images/background01.png')" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2">
                    {displayText || inputText || ""}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}