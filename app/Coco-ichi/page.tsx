'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Character {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  image: string;
  type: 'enemy' | 'ally';
}

// コンポーネントの先頭で結果画像の配列を定義
const resultImages = [
  '/images/Coco-ichi/result_image01.jpg',
  '/images/Coco-ichi/result_image02.jpg',
  '/images/Coco-ichi/result_image03.png'
];

// 新しいインターフェースを追加
interface Score {
  id?: number;
  name: string;
  score: number;
  date: string;
}

// 新しいタイプを追加
type RankingType = 'daily' | 'weekly' | 'all';

// Supabaseクライアントをコンポーネントの外で初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

// 日付比較用のヘルパー関数を修正
const isSameDay = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  
  return date.getFullYear() === now.getFullYear() &&
         date.getMonth() === now.getMonth() &&
         date.getDate() === now.getDate();
};

const isWithinLastWeek = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  return date >= weekAgo;
};

export default function CocoIchiGame() {
  // 画面状態管理
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'game'>('intro');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 500 });
  const [characters, setCharacters] = useState<Character[]>([]);
  const [resultImage, setResultImage] = useState('');
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const playerSize = { width: 120, height: 120 };

  // 衝突済みのキャラクターを追跡するためのRef
  const collidedIdsRef = useRef<Set<number>>(new Set());

  // ゲーム開始時刻を保持するためのref
  const gameStartTimeRef = useRef<number>(0);
  // 現在の出現間隔を保持するためのref
  const spawnIntervalRef = useRef<number>(1200);

  // 新しいstate追加
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [playerName, setPlayerName] = useState('');

  // スコア更新用のRef追加
  const lastScoreUpdateTimeRef = useRef<number>(0);

  // 新しい状態変数を追加
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // サウンドの状態管理を改善
  const [soundContext, setSoundContext] = useState<{
    gameEndSound: HTMLAudioElement | null;
    isInitialized: boolean;  // 初期化状態のみを管理
  }>({
    gameEndSound: null,
    isInitialized: false
  });

  // 新しいstate追加
  const [rankingType, setRankingType] = useState<RankingType>('daily');
  const [dailyScores, setDailyScores] = useState<Score[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<Score[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);

  // プレイヤー位置の更新関数
  const updatePlayerPosition = () => {
    if (gameAreaRef.current) {
      const gameHeight = gameAreaRef.current.clientHeight;
      const newY = gameHeight * 0.8 - playerSize.height / 2;
      setPlayerPosition(prev => ({ ...prev, y: newY }));
    }
  };

  // iOS向けの初期化関数を修正
  const initializeAudioContext = async () => {
    if (!soundContext.isInitialized && typeof Audio !== 'undefined') {
      try {
        // endSoundのみを初期化
        const endSound = new Audio('/sounds/ArimotoMaker/Coco-ichi/game_end.mp3');
        
        // 音量0で短い再生を試みる（iOS向け初期化）
        endSound.volume = 0;
        await endSound.play().then(() => {
          endSound.pause();
          endSound.currentTime = 0;  // 確実に最初に戻す
        });

        // 音量を戻す
        endSound.volume = 1;
        
        // 初期化完了
        setSoundContext({
          gameEndSound: endSound,
          isInitialized: true
        });
      } catch (error) {
        console.error('音声初期化エラー:', error);
      }
    }
  };

  // ユーザーインタラクションでの初期化を修正
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!soundContext.isInitialized) {
        await initializeAudioContext();
      }
    };

    // ゲーム画面でのみイベントリスナーを追加
    if (currentScreen === 'game') {
      window.addEventListener('touchstart', handleUserInteraction);
      window.addEventListener('click', handleUserInteraction);

      return () => {
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [soundContext.isInitialized, currentScreen]);

  // サウンド再生関数を改善
  const playGameEndSound = async () => {
    if (!isSoundEnabled || !soundContext.gameEndSound || !soundContext.isInitialized) return;

    try {
      const sound = soundContext.gameEndSound;
      sound.currentTime = 0;
      await sound.play();
    } catch (error) {
      console.error('ゲームオーバー音声再生エラー:', error);
    }
  };

  // ゲームオーバー時の処理を修正
  const handleGameOver = () => {
    const randomImage = resultImages[Math.floor(Math.random() * resultImages.length)];
    setResultImage(randomImage);
    setGameOver(true);
    setShowScoreSubmit(true);
    
    if (soundContext.isInitialized) {
      playGameEndSound();
    }
  };

  // ゲームを終了してイントロ画面に戻る
  const backToIntro = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentScreen('intro');
  };

  // ゲーム開始時の処理を修正
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setResultImage('');
    setPlayerPosition(prev => ({ ...prev, x: 50 }));
    setCharacters([]);
    setCurrentScreen('game');
    collidedIdsRef.current.clear();
    gameStartTimeRef.current = Date.now();
    spawnIntervalRef.current = 1200; // 初期出現間隔を1200msに設定
    
    setTimeout(updatePlayerPosition, 0);
  };

  // タッチイベントの処理
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameAreaRef.current && gameStarted && !gameOver) {
      e.preventDefault();
      const rect = gameAreaRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left - playerSize.width / 2;
      setPlayerPosition({ ...playerPosition, x: Math.max(0, Math.min(rect.width - playerSize.width, x)) });
    }
  };

  // マウス操作の処理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameAreaRef.current && gameStarted && !gameOver) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - playerSize.width / 2;
      setPlayerPosition({ ...playerPosition, x: Math.max(0, Math.min(rect.width - playerSize.width, x)) });
    }
  };

  // キャラクター（敵と味方）の生成
  useEffect(() => {
    if (!gameStarted || gameOver || currentScreen !== 'game') return;

    const generateCharacter = () => {
      if (gameAreaRef.current) {
        // 経過時間に応じて出現間隔を調整（3秒ごとに20ms短く）
        const elapsedTime = Date.now() - gameStartTimeRef.current;
        const seconds = elapsedTime / 1000 / 3; // 3秒単位での経過時間
        spawnIntervalRef.current = Math.max(
          200, // 最小間隔は200ms
          1200 - Math.floor(seconds) * 20 // 3秒ごとに20ms短くする
        );

        const gameWidth = gameAreaRef.current.clientWidth;
        // 時間経過とともにアンチの出現確率を上げる（最大60%まで）
        const enemyProbability = Math.min(0.6, 0.3 + Math.floor(seconds) * 0.05);
        const isEnemy = Math.random() > (1 - enemyProbability);
        
        const size = 36 + Math.floor(Math.random() * 108);
        const characterSize = { width: size, height: size };
        
        const enemyImages = [
          '/images/Coco-ichi/teki01.jpg',
          '/images/Coco-ichi/teki02.jpg',
          '/images/Coco-ichi/teki03.jpg',
          '/images/Coco-ichi/teki04.jpg',
          '/images/Coco-ichi/teki05.jpg',
          '/images/Coco-ichi/teki06.jpg',
          '/images/Coco-ichi/teki07.jpg',
          '/images/Coco-ichi/teki08.jpg',
          '/images/Coco-ichi/teki09.jpg',
          '/images/Coco-ichi/teki10.jpg',
          '/images/Coco-ichi/teki11.jpg',
          '/images/Coco-ichi/teki12.jpg',
          '/images/Coco-ichi/teki13.jpg',
          '/images/Coco-ichi/teki14.jpg',
          '/images/Coco-ichi/teki15.jpg',
          '/images/Coco-ichi/teki16.jpg',
          '/images/Coco-ichi/teki17.jpg',
        ];
        
        const allyImages = [
          '/images/Coco-ichi/mikata01.jpg',
          '/images/Coco-ichi/mikata02.jpg',
          '/images/Coco-ichi/mikata03.jpg',
          '/images/Coco-ichi/mikata04.jpg',
          '/images/Coco-ichi/mikata05.jpg',
          '/images/Coco-ichi/mikata06.jpg',
          '/images/Coco-ichi/mikata07.jpg',
          '/images/Coco-ichi/mikata08.jpg',
          '/images/Coco-ichi/mikata09.jpg',
          '/images/Coco-ichi/mikata10.jpg',
          '/images/Coco-ichi/mikata11.jpg',
          '/images/Coco-ichi/mikata12.jpg',
          '/images/Coco-ichi/mikata13.jpg',
          '/images/Coco-ichi/mikata14.jpg',
          '/images/Coco-ichi/mikata15.jpg',
          '/images/Coco-ichi/mikata16.jpg',
          '/images/Coco-ichi/mikata17.jpg',
        ];

        const imageIndex = Math.floor(Math.random() * 17);
        const image = isEnemy ? enemyImages[imageIndex] : allyImages[imageIndex];
        
        const newCharacter: Character = {
          id: Date.now(),
          x: Math.random() * (gameWidth - characterSize.width),
          y: -characterSize.height * 2,
          width: characterSize.width,
          height: characterSize.height,
          speed: 2 + Math.random() * 3,
          image,
          type: isEnemy ? 'enemy' : 'ally',
        };

        setCharacters(prev => [...prev, newCharacter]);
      }
    };

    const interval = setInterval(generateCharacter, spawnIntervalRef.current);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, currentScreen]);

  // ゲームループ
  useEffect(() => {
    if (!gameStarted || gameOver || currentScreen !== 'game') return;

    const updateGame = (timestamp: number) => {
      setCharacters(prevCharacters => {
        const gameHeight = gameAreaRef.current?.clientHeight || 700;
        
        // 画面外のキャラクターを除外
        let updatedCharacters = prevCharacters
          .map(char => ({
            ...char,
            y: char.y + char.speed
          }))
          .filter(char => char.y < gameHeight + 100);
        
        const horizontalMargin = 8;
        const verticalMargin = 20;
        const playerCollisionX = playerPosition.x + horizontalMargin;
        const playerCollisionY = playerPosition.y + verticalMargin;
        const playerCollisionWidth = playerSize.width - (horizontalMargin * 2);
        const playerCollisionHeight = playerSize.height - (verticalMargin * 2);
        const playerRight = playerCollisionX + playerCollisionWidth;
        const playerBottom = playerCollisionY + playerCollisionHeight;

        // 衝突判定
        for (const char of updatedCharacters) {
          const charCollisionMargin = char.width * 0.1;
          const charCollisionX = char.x + charCollisionMargin;
          const charCollisionY = char.y + charCollisionMargin;
          const charCollisionWidth = char.width - (charCollisionMargin * 2);
          const charCollisionHeight = char.height - (charCollisionMargin * 2);
          const charRight = charCollisionX + charCollisionWidth;
          const charBottom = charCollisionY + charCollisionHeight;

          if (
            playerCollisionX < charRight &&
            playerRight > charCollisionX &&
            playerCollisionY < charBottom &&
            playerBottom > charCollisionY
          ) {
            if (char.type === 'ally') {
              // 最後のスコア更新から100ms以上経過している場合のみスコアを更新
              if (timestamp - lastScoreUpdateTimeRef.current > 100) {
                setScore(prev => prev + 100);
                lastScoreUpdateTimeRef.current = timestamp;
              }
              // 衝突したキャラクターを配列から除外
              updatedCharacters = updatedCharacters.filter(c => c.id !== char.id);
            } else {
              handleGameOver();
            }
            break;
          }
        }

        return updatedCharacters;
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameStarted, gameOver, playerPosition, score, currentScreen]);

  // スクロール防止処理
  useEffect(() => {
    if (currentScreen === 'game' && gameStarted && !gameOver) {
      const originalStyle = {
        position: document.body.style.position,
        overflow: document.body.style.overflow,
        top: document.body.style.top,
      };
      
      const scrollY = window.scrollY;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = originalStyle.position;
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.top = originalStyle.top;
        document.body.style.width = '';
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [currentScreen, gameStarted, gameOver]);

  // ゲームエリアのリサイズ時にプレイヤー位置を更新
  useEffect(() => {
    if (currentScreen === 'game' && gameStarted && !gameOver) {
      const handleResize = () => {
        updatePlayerPosition();
      };
      
      window.addEventListener('resize', handleResize);
      updatePlayerPosition();
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [currentScreen, gameStarted, gameOver]);

  // スコアを取得する関数を修正
  useEffect(() => {
    const fetchScores = async () => {
      try {
        let data;
        let error;

        switch (rankingType) {
          case 'daily':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .gte('date', new Date().toISOString())
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setDailyScores(data || []);
            break;
          case 'weekly':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .gte('date', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setWeeklyScores(data || []);
            break;
          case 'all':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setAllScores(data || []);
            break;
        }

        if (error) throw error;
      } catch (error) {
        console.error('スコア取得エラー:', error);
      }
    };

    fetchScores();
  }, [rankingType]);

  // スコア送信関数も修正
  const submitScore = async () => {
    if (!playerName.trim()) return;

    // 日本時間でのタイムスタンプを生成
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));

    const scoreData: Score = {
      name: playerName,
      score: score,
      date: jstDate.toISOString()  // JSTのISOString
    };

    try {
      const { error } = await supabase
        .from('scores')
        .insert([scoreData]);

      if (error) throw error;

      // 現在のタブのスコアのみを再取得
      const fetchCurrentScores = async () => {
        let data;
        let error;

        switch (rankingType) {
          case 'daily':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .gte('date', new Date().toISOString())
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setDailyScores(data || []);
            break;
          case 'weekly':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .gte('date', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setWeeklyScores(data || []);
            break;
          case 'all':
            ({ data, error } = await supabase
              .from('scores')
              .select('*')
              .order('score', { ascending: false })
              .limit(10));
            if (!error) setAllScores(data || []);
            break;
        }

        if (error) throw error;
      };

      await fetchCurrentScores();
      setShowScoreSubmit(false);
      setPlayerName('');
    } catch (error) {
      console.error('スコア送信エラー:', error);
    }
  };

  // ランキング表示用のスコアを取得
  const getCurrentScores = () => {
    const scores = (() => {
      switch (rankingType) {
        case 'daily':
          return dailyScores.filter(score => isSameDay(score.date));
        case 'weekly':
          return weeklyScores.filter(score => isWithinLastWeek(score.date));
        case 'all':
          return allScores;
      }
    })();

    return scores;
  };

  // ランキング表示部分を修正
  const RankingSection = () => {
    // タブ切り替えハンドラーを修正
    const handleTabChange = (type: RankingType) => {
      setRankingType(type);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-amber-500 mb-4">愛国ランキング</h2>
        
        <div className="flex mb-4 border-b">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // iOSでのイベントバブリングも防止
              handleTabChange('daily');
            }}
            type="button" // iOSでのデフォルト送信を確実に防止
            className={`flex-1 px-4 py-2 ${
              rankingType === 'daily'
                ? 'border-b-2 border-amber-500 text-amber-500 font-bold'
                : 'text-gray-500'
            }`}
          >
            今日
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // iOSでのイベントバブリングも防止
              handleTabChange('weekly');
            }}
            type="button" // iOSでのデフォルト送信を確実に防止
            className={`flex-1 px-4 py-2 ${
              rankingType === 'weekly'
                ? 'border-b-2 border-amber-500 text-amber-500 font-bold'
                : 'text-gray-500'
            }`}
          >
            1週間
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // iOSでのイベントバブリングも防止
              handleTabChange('all');
            }}
            type="button" // iOSでのデフォルト送信を確実に防止
            className={`flex-1 px-4 py-2 ${
              rankingType === 'all'
                ? 'border-b-2 border-amber-500 text-amber-500 font-bold'
                : 'text-gray-500'
            }`}
          >
            全期間
          </button>
        </div>

        <div className="space-y-2">
          {(() => {
            const scores = getCurrentScores();
            if (!scores || scores.length === 0) {
              return (
                <p className="text-center text-gray-500">データがありません</p>
              );
            }
            return scores.map((score, index) => (
              <div key={score.id} className="flex justify-between items-center">
                <span className="font-bold">{index + 1}. {score.name}</span>
                <span className="text-green-600 tabular-nums">{score.score.toLocaleString()}円</span>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  // サウンド設定ボタンのクリックハンドラーを追加
  const handleSoundToggle = async () => {
    // サウンドが無効から有効に切り替わる時は初期化を試みる
    if (!isSoundEnabled && !soundContext.isInitialized) {
      await initializeAudioContext();
    }
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* イントロ画面 */}
      {currentScreen === 'intro' && (
        <>
          <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-yellow-500 mb-6 mt-4">アンチ撃退! CoCo壱ゲーム</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md w-full">
              <div className="flex justify-end -mb-6">
                <button
                  onClick={handleSoundToggle}
                  className="px-2 rounded-full bg-white"
                >
                  {isSoundEnabled ? (
                    <span className="text-2xl">🔊</span>
                  ) : (
                    <span className="text-2xl">🔇</span>
                  )}
                </button>
              </div>

              <h2 className="text-xl font-bold text-amber-500 mb-4">ゲームの遊び方</h2>
              <div className="mb-6">
                <p className="text-base mb-4">
                  CoCo壱をアンチに取られないように保守党の仲間に届けましょう。
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>画面下のカレーを左右に動かしてアンチを避けながら味方に当てます</li>
                  <li>味方キャラクターに当たると100円獲得できます</li>
                  <li>アンチキャラクターに当たるとゲームオーバーです</li>
                  <li>ゲームオーバー後、名前を入力してスコアを登録できます</li>
                </ul>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // イベントの伝播を停止
                  startGame();
                }}
                className="w-full px-6 py-4 bg-yellow-300 text-gray-800 font-bold rounded-lg hover:bg-yellow-400 transition-colors text-xl"
              >
                ゲームスタート
              </button>
              <p className="text-sm text-red-500 text-center mt-2">音量に注意してください</p>
            </div>

            <RankingSection />
          </div>

          {/* Coco-ichi専用フッター */}
          <footer className="bg-gray-100 border-t mt-2">
            <div className="max-w-4xl mx-auto py-8 px-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  保守党アプリ集
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link 
                  href="/Karuta" 
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <span className="text-xl mb-2">🎴</span>
                  <span className="text-sm font-medium text-gray-700">保守党かるた</span>
                </Link>
                
                <Link 
                  href="https://hoshuto-sugoroku.vercel.app/" 
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <span className="text-xl mb-2">🎲</span>
                  <span className="text-sm font-medium text-gray-700">保守党すごろく</span>
                </Link>
                
                <Link 
                  href="/ArimotoMaker" 
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <span className="text-xl mb-2">🎯</span>
                  <span className="text-sm font-medium text-gray-700">有本構文メーカー</span>
                </Link>

                <Link 
                  href="https://hoshuto-sugoroku.vercel.app/party_name_app" 
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <span className="text-xl mb-2">🎤</span>
                  <span className="text-sm font-medium text-gray-700">党名発表アプリ</span>
                </Link>
              </div>

              <div className="text-center mt-8 text-sm text-gray-500">
                <p>日本を豊かに、強く。</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ゲーム画面 */}
      {currentScreen === 'game' && (
        <div className="fixed inset-0 bg-white z-10 flex flex-col items-center justify-start">
          <div className="w-full max-w-md mx-auto flex flex-col h-full">
            <div className="flex justify-between items-center mb-2 px-4 pt-4 pb-2">
              <h1 className="text-base font-bold text-gray-800">アンチ撃退！CoCo壱ゲーム</h1>
              <div className="flex items-center">
                <span className="text-sm mr-2">獲得賞金:</span>
                <span className="text-green-600 font-bold text-base">{score.toLocaleString()}円</span>
              </div>
            </div>
            
            <div 
              ref={gameAreaRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative flex-grow w-full bg-yellow-300 overflow-hidden"
              style={{ 
                width: '100%',
                maxWidth: '400px',
                height: '600px',
                margin: '0 auto'
              }}
            >
              {gameStarted && !gameOver && (
                <div
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    left: `${playerPosition.x}px`,
                    top: `${playerPosition.y}px`,
                    width: `${playerSize.width}px`,
                    height: `${playerSize.height}px`,
                  }}
                >
                  <Image
                    src="/images/Coco-ichi/avatar.png"
                    alt="プレイヤー"
                    width={playerSize.width}
                    height={playerSize.height}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {characters.map(char => (
                <div
                  key={char.id}
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    left: `${char.x}px`,
                    top: `${char.y}px`,
                    width: `${char.width}px`,
                    height: `${char.height}px`,
                  }}
                >
                  <Image
                    src={char.image}
                    alt={char.type === 'enemy' ? "敵" : "味方"}
                    width={char.width}
                    height={char.height}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-red-800 mb-4">ゲームオーバー</h2>
                      <p className="text-xl font-semibold mb-4">獲得賞金: {score.toLocaleString()} 円</p>
                    </div>

                    {showScoreSubmit && (
                      <div className="mb-4">
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="名前を入力してください"
                          className="w-full px-4 py-2 border rounded mb-2"
                        />
                        <button
                          onClick={submitScore}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          スコアを登録
                        </button>
                      </div>
                    )}

                    <div className="relative w-full aspect-video mb-6">
                      <Image
                        src={resultImage}
                        alt="結果画像"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={startGame}
                        className="w-full px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        もう一度プレイ
                      </button>
                      
                      <button
                        onClick={backToIntro}
                        className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        ゲーム終了
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
