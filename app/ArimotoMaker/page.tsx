"use client";

import React, { useState, useEffect, useRef } from "react";
import { sentensData } from "../data/sentensData";

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

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      [sound1Ref, sound2Ref, drumrollRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
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
      audio.currentTime = 0;
      // iOS対応：音量を明示的に設定
      audio.volume = 1.0;
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
              有本構文を生成するための愛国ツールです。
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
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2">
                        {displayText}
                      </span>
                    )}
                    {!isShuffling && displayText && displayTextEnd && (
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2">
                        したがいまして、
                      </span>
                    )}
                    {displayTextEnd && (
                      <span className="sm:text-4xl text-2xl font-bold text-white [text-shadow:_2px_2px_1px_rgb(0_0_0_/_75%)] bg-gray-700 bg-opacity-10 px-4 py-2">
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