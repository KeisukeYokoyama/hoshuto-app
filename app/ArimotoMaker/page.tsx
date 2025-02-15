"use client";

import React, { useState, useEffect, useRef } from "react";
import { sentensData } from "../data/ArimotoMaker/sentensData";

export default function Arimoto() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [displayTextEnd, setDisplayTextEnd] = useState("");
  const [isClient, setIsClient] = useState(false);

  // 音声オブジェクトの参照を保持
  const sound1Ref = useRef<HTMLAudioElement | null>(null);
  const sound2Ref = useRef<HTMLAudioElement | null>(null);
  const drumrollRef = useRef<HTMLAudioElement | null>(null);

  // 音声オブジェクトの初期化
  useEffect(() => {
    sound1Ref.current = new Audio('/sounds/sound_01.mp3');
    sound2Ref.current = new Audio('/sounds/sound_02.mp3');
    drumrollRef.current = new Audio('/sounds/drumroll.mp3');

    // 各音声ファイルの設定
    [sound1Ref, sound2Ref, drumrollRef].forEach(ref => {
      if (ref.current) {
        ref.current.preload = 'auto';  // プリロードを設定
        ref.current.load();  // 明示的にロード
      }
    });

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      [sound1Ref, sound2Ref, drumrollRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current.src = '';  // ソースをクリア
        }
      });
    };
  }, []);

  useEffect(() => {
    setIsClient(true);

    // iOS向けの音声API初期化
    const initSpeech = () => {
      const dummyUtterance = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(dummyUtterance);
    };
    
    if ('ontouchend' in document) {
      document.addEventListener('touchend', initSpeech, { once: true });
    } else {
      initSpeech();
    }

    // クリーンアップ関数
    return () => {
      if ('ontouchend' in document) {
        document.removeEventListener('touchend', initSpeech);
      }
    };
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

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isShuffling]);

  const playSound = async (audio: HTMLAudioElement) => {
    try {
      // 再生前に完全に停止させる
      audio.pause();
      audio.currentTime = 0;
      // iOS対応：音量を明示的に設定
      audio.volume = 1.0;
      // プリロードの設定を追加
      audio.load();
      await audio.play();
    } catch (error) {
      console.error('音声の再生に失敗しました:', error);
    }
  };

  const handleButtonClick = async () => {
    if (!isShuffling && sound1Ref.current && sound2Ref.current && drumrollRef.current) {
      setIsShuffling(true);
      setDisplayTextEnd("");
      
      const selectedSound = Math.random() < 0.5 ? sound1Ref.current : sound2Ref.current;
      
      await playSound(selectedSound);
      
      const duration = selectedSound.duration * 1000 || 1000;
      setTimeout(async () => {
        if (drumrollRef.current) {
          await playSound(drumrollRef.current);
          
          const drumrollDuration = (drumrollRef.current.duration * 1000) - 1800;
          setTimeout(() => {
            setIsShuffling(false);
            const finalIndex = Math.floor(Math.random() * sentensData.length);
            const finalIndexEnd = Math.floor(Math.random() * sentensData.length);
            const finalText = sentensData[finalIndex].text;
            const finalTextEnd = sentensData[finalIndexEnd].text;
            setDisplayText(finalText);
            setDisplayTextEnd(finalTextEnd);

            // テキスト表示後、1秒待ってから音声読み上げを開始
            setTimeout(() => {
              const utterance = new SpeechSynthesisUtterance();
              utterance.text = `${sentensData[finalIndex].speech}。したがいまして、${sentensData[finalIndexEnd].speech}`;
              utterance.lang = 'ja-JP';
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              window.speechSynthesis.speak(utterance);
            }, 500);
          }, drumrollDuration);
        }
      }, duration);
    }
  };

  return (
    <div className="justify-items-center px-6 py-8 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center max-w-2xl mx-auto w-full">
        {isClient && (
          <>
            <h1 className="text-4xl font-bold text-center">有本構文メーカー</h1>
            <p className="text-base text-center">
              有本構文を生成するための愛国ツールです<br />
              <span className="text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 inline-block mr-1 animate-pulse"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" fill="currentColor"/></svg>
                    音声オンでご利用ください
                </span>
            </p>
            <div className="flex justify-center w-full">
              <button 
                className="bg-gray-900 text-white px-4 py-2 rounded-md block disabled:opacity-50 w-40 text-center"
                onClick={handleButtonClick}
                disabled={isShuffling}
              >
                {isShuffling ? '生成中' : '有本構文を生成'}
              </button>
            </div>
            <div className="w-full relative">
              {(displayText || isShuffling) && (
                <div 
                  className={`w-full aspect-[16/9] max-h-[600px] min-h-[200px] bg-cover bg-center ${!isShuffling ? "bg-[url('/images/background01.png')]" : "bg-gray-800"}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    {displayText && (
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2 text-center">
                        {displayText}
                      </span>
                    )}
                    {!isShuffling && displayText && displayTextEnd && (
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2 text-center">
                        したがいまして、
                      </span>
                    )}
                    {displayTextEnd && (
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2 text-center">
                        {displayTextEnd}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}