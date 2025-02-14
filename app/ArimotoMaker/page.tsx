"use client";

import React from "react";
import { useState } from "react";

export default function Arimoto() {
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // 入力テキスト
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // 音声再生
  const playSound = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    const soundNumber = Math.random() < 0.5 ? '01' : '02';
    const firstSound = new Audio(`/sounds/sound_${soundNumber}.mp3`);
    const drumroll = new Audio('/sounds/drumroll.mp3');
    
    await firstSound.play();
    firstSound.addEventListener('ended', () => {
      drumroll.play();
      drumroll.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    });
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
          <input
            type="text"
            id="inputText"
            className="w-full p-2 border rounded-md my-2"
            value={inputText}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="outputText" className="text-sm font-bold">
            ボタンをクリックしてください
          </label>
          <button 
            className={`bg-blue-500 text-white px-4 py-2 rounded-md block mt-2 ${
              isPlaying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            id="outputText"
            onClick={playSound}
            disabled={isPlaying}
          >
            したがいまして
          </button>
        </div>
      </main>
    </div>
  );
}