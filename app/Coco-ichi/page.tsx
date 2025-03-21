'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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

export default function CocoIchiGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(1); // 最初の持ち点は1ポイント
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 500 });
  const [characters, setCharacters] = useState<Character[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const playerSize = { width: 80, height: 80 };

  // ゲーム開始
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(1);
    setPlayerPosition({ x: 50, y: 500 });
    setCharacters([]);
  };

  // タッチイベントの処理
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameAreaRef.current && gameStarted && !gameOver) {
      e.preventDefault(); // スクロールを防止
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
    if (!gameStarted || gameOver) return;

    const generateCharacter = () => {
      if (gameAreaRef.current) {
        const gameWidth = gameAreaRef.current.clientWidth;
        const isEnemy = Math.random() > 0.4; // 60%の確率で敵が出現
        
        // ランダムなサイズを生成（最小60px、最大200px）
        const size = 60 + Math.floor(Math.random() * 140);
        const characterSize = { width: size, height: size };
        
        // 敵と味方の画像をランダムに選択
        const enemyImages = [
          '/images/Coco-ichi/teki01.jpg',
          '/images/Coco-ichi/teki02.jpg',
          '/images/Coco-ichi/teki03.jpg',
          '/images/Coco-ichi/teki04.jpg',
          '/images/Coco-ichi/teki05.jpg',
          '/images/Coco-ichi/teki06.jpg',
        ];
        
        const allyImages = [
          '/images/Coco-ichi/mikata01.jpg',
          '/images/Coco-ichi/mikata02.jpg',
          '/images/Coco-ichi/mikata03.jpg',
          '/images/Coco-ichi/mikata04.jpg',
          '/images/Coco-ichi/mikata05.jpg',
          '/images/Coco-ichi/mikata06.jpg',
        ];

        const imageIndex = Math.floor(Math.random() * 6);
        const image = isEnemy ? enemyImages[imageIndex] : allyImages[imageIndex];
        
        const newCharacter: Character = {
          id: Date.now(),
          x: Math.random() * (gameWidth - characterSize.width),
          y: -characterSize.height,
          width: characterSize.width,
          height: characterSize.height,
          speed: 2 + Math.random() * 3, // ランダムな速度
          image,
          type: isEnemy ? 'enemy' : 'ally',
        };

        setCharacters(prev => [...prev, newCharacter]);
      }
    };

    const interval = setInterval(generateCharacter, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // ゲームループ
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const updateGame = () => {
      // キャラクターの移動
      setCharacters(prevCharacters => {
        const updatedCharacters = prevCharacters.map(char => ({
          ...char,
          y: char.y + char.speed
        })).filter(char => char.y < 600); // 画面外に出たキャラクターを削除

        // 衝突判定
        const playerRight = playerPosition.x + playerSize.width;
        const playerBottom = playerPosition.y + playerSize.height;

        updatedCharacters.forEach(char => {
          const charRight = char.x + char.width;
          const charBottom = char.y + char.height;

          // 衝突判定
          if (
            playerPosition.x < charRight &&
            playerRight > char.x &&
            playerPosition.y < charBottom &&
            playerBottom > char.y
          ) {
            // 衝突時の得点計算
            if (char.type === 'ally') {
              setScore(prev => prev + 1); // 味方：1ポイントアップ
            } else {
              setScore(prev => prev - 10); // 敵：10ポイントマイナス
            }

            // 衝突したキャラクターを削除
            const index = updatedCharacters.findIndex(c => c.id === char.id);
            if (index !== -1) {
              updatedCharacters.splice(index, 1);
            }
          }
        });

        return updatedCharacters;
      });

      // スコアチェック
      if (score <= 0) {
        setGameOver(true);
      }

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameStarted, gameOver, playerPosition, score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4">
      <h1 className="text-3xl font-bold text-amber-800 mb-4">CoCo壱ゲーム</h1>
      
      <div className="mb-4 text-lg">
        <span className="font-semibold">スコア: </span>
        <span className={`${score <= 0 ? 'text-red-500' : 'text-green-600'} font-bold`}>{score}</span>
      </div>
      
      <div 
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => e.preventDefault()}
        className="relative w-full max-w-2xl h-[600px] bg-orange-100 border-2 border-amber-700 overflow-hidden"
      >
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-100 bg-opacity-80">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">CoCo壱ゲームへようこそ！</h2>
            <p className="text-center mb-6 text-amber-700">
              味方にカレーを届けるとポイントアップ！<br />
              敵に当たるとポイントダウン！<br />
              マウスでプレイヤーを操作しよう！
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
            >
              ゲームスタート
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-80">
            <h2 className="text-2xl font-bold text-red-800 mb-4">ゲームオーバー</h2>
            <p className="text-lg font-semibold mb-6">最終スコア: {score}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
            >
              もう一度プレイ
            </button>
          </div>
        )}
        
        {gameStarted && (
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
      </div>
      
      <div className="mt-6 text-amber-800">
        <h3 className="text-xl font-bold mb-2">ゲームルール</h3>
        <ul className="list-disc pl-5">
          <li>味方にカレーを届ける（ぶつかる）と1ポイントアップ</li>
          <li>敵にカレーを取られる（ぶつかる）と10ポイントマイナス</li>
          <li>スコアが0以下になるとゲームオーバー</li>
          <li>マウスでプレイヤーを左右に動かします</li>
        </ul>
      </div>
    </div>
  );
}
