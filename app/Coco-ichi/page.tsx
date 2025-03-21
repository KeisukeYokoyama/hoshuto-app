'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  // 画面状態管理
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'game'>('intro');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [topScores, setTopScores] = useState<Array<{id: number, playerName: string, score: number}>>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 500 });
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const playerSize = { width: 120, height: 120 };

  // プレイヤー位置の更新関数
  const updatePlayerPosition = () => {
    if (gameAreaRef.current) {
      const gameHeight = gameAreaRef.current.clientHeight;
      // プレイヤーをゲームエリアの下部（下から20%の位置）に配置
      const newY = gameHeight * 0.8 - playerSize.height / 2;
      setPlayerPosition(prev => ({ ...prev, y: newY }));
    }
  };

  // ゲームオーバー時の処理
  const handleGameOver = () => {
    setGameOver(true);
  };

  // ゲームを終了してイントロ画面に戻る
  const backToIntro = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentScreen('intro');
  };

  // スコア送信後にイントロ画面に戻る
  const submitScoreAndBackToIntro = async () => {
    if (!playerName.trim()) return;
    
    try {
      setError(null);
      setIsSubmittingScore(true);
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          score,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPlayerRank(data.rank);
        fetchScores();
        // スコア送信後、少し待ってからイントロ画面に戻る
        setTimeout(() => {
          setCurrentScreen('intro');
          setGameStarted(false);
          setGameOver(false);
        }, 2000);
      } else {
        setError(data.error || 'スコアの送信に失敗しました');
      }
    } catch (error) {
      console.error('スコア送信エラー:', error);
      setError('スコアの送信に失敗しました');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // ゲーム開始
  const startGame = () => {
    // ゲーム開始処理
    setGameStarted(true);
    setGameOver(false);
    setScore(0); // スコアを0から開始
    setPlayerPosition(prev => ({ ...prev, x: 50 })); // Y座標は設定しない
    setCharacters([]);
    setCurrentScreen('game'); // ゲーム画面に切り替え
    setPlayerRank(null); // ランクをリセット
    
    // ゲームエリアのサイズが確定した後にプレイヤー位置を更新
    setTimeout(updatePlayerPosition, 0);
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

  // スコアを読み込む
  const fetchScores = async () => {
    try {
      setError(null);
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setTopScores(data);
      } else {
        const data = await response.json();
        setError(data.error || 'スコアの取得に失敗しました');
      }
    } catch (error) {
      console.error('スコア取得エラー:', error);
      setError('スコアの取得に失敗しました');
    }
  };

  // コンポーネントマウント時にスコアを読み込む
  useEffect(() => {
    fetchScores();
  }, []);

  // キャラクター（敵と味方）の生成
  useEffect(() => {
    if (!gameStarted || gameOver || currentScreen !== 'game') return;

    const generateCharacter = () => {
      if (gameAreaRef.current) {
        const gameWidth = gameAreaRef.current.clientWidth;
        const isEnemy = Math.random() > 0.4; // 60%の確率で敵が出現
        
        // ランダムなサイズを生成（最小60px、最大200px）
        const size = 60 + Math.floor(Math.random() * 120);
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
          speed: 3 + Math.random() * 5, // より高速なランダム速度
          image,
          type: isEnemy ? 'enemy' : 'ally',
        };

        setCharacters(prev => [...prev, newCharacter]);
      }
    };

    const interval = setInterval(generateCharacter, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, currentScreen]);

  // ゲームループ
  useEffect(() => {
    if (!gameStarted || gameOver || currentScreen !== 'game') return;

    const updateGame = () => {
      // キャラクターの移動
      setCharacters(prevCharacters => {
        // ゲームエリアの高さを取得して、削除する位置を調整
        const gameHeight = gameAreaRef.current?.clientHeight || 700;
        
        const updatedCharacters = prevCharacters.map(char => ({
          ...char,
          y: char.y + char.speed
        })).filter(char => char.y < gameHeight + 100); // 画面外に十分出るまで保持
        
        // 衝突判定
        // プレイヤーの当たり判定を中心部分に制限（実際のサイズより小さく）
        const collisionMargin = 8; // 余白を設定
        const playerCollisionX = playerPosition.x + collisionMargin;
        const playerCollisionY = playerPosition.y + collisionMargin;
        const playerCollisionWidth = playerSize.width - (collisionMargin * 2);
        const playerCollisionHeight = playerSize.height - (collisionMargin * 2);
        const playerRight = playerCollisionX + playerCollisionWidth;
        const playerBottom = playerCollisionY + playerCollisionHeight;

        updatedCharacters.forEach(char => {
          // キャラクターの当たり判定も中心部分に制限
          const charCollisionMargin = char.width * 0.1; // キャラクターサイズに比例した余白
          const charCollisionX = char.x + charCollisionMargin;
          const charCollisionY = char.y + charCollisionMargin;
          const charCollisionWidth = char.width - (charCollisionMargin * 2);
          const charCollisionHeight = char.height - (charCollisionMargin * 2);
          const charRight = charCollisionX + charCollisionWidth;
          const charBottom = charCollisionY + charCollisionHeight;

          // 衝突判定
          if (
            playerCollisionX < charRight &&
            playerRight > charCollisionX &&
            playerCollisionY < charBottom &&
            playerBottom > charCollisionY
          ) {
            // 衝突時の処理
            if (char.type === 'ally') {
              setScore(prev => prev + 1); // 味方：1ポイントアップ
            } else {
              // 敵に当たったらゲームオーバー
              handleGameOver();
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
      // スクロール禁止の設定
      const originalStyle = {
        position: document.body.style.position,
        overflow: document.body.style.overflow,
        top: document.body.style.top,
      };
      
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY;
      
      // スクロールを固定
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 元に戻す
        document.body.style.position = originalStyle.position;
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.top = originalStyle.top;
        document.body.style.width = '';
        
        // スクロール位置を復元
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
      // 初期位置の設定
      updatePlayerPosition();
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [currentScreen, gameStarted, gameOver]);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* イントロ画面 */}
      {currentScreen === 'intro' && (
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-amber-800 mb-6">CoCo壱ゲーム</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">ゲームの遊び方</h2>
            <div className="mb-6">
              <p className="text-lg mb-4">
                CoCo壱のカレーを配達するゲームです！
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>画面下のプレイヤーを左右に動かして、落ちてくる味方キャラクターに当てましょう</li>
                <li>味方キャラクターに当たると1ポイント獲得できます</li>
                <li>敵キャラクターに当たるとゲームオーバーです！</li>
                <li>できるだけ高得点を目指しましょう！</li>
              </ul>
            </div>
            
            <button
              onClick={startGame}
              className="w-full px-6 py-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors text-xl"
            >
              ゲームスタート
            </button>
          </div>
          
          {/* ハイスコア表示 */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-800 mb-4">ハイスコア</h3>
            {topScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left py-2 px-4">順位</th>
                      <th className="text-left py-2 px-4">名前</th>
                      <th className="text-right py-2 px-4">スコア</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScores.map((entry, index) => (
                      <tr key={entry.id} className="border-b border-amber-100 last:border-b-0">
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{entry.playerName}</td>
                        <td className="py-2 px-4 text-right">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">まだスコアがありません</p>
            )}
          </div>
        </div>
      )}

      {/* ゲーム画面 */}
      {currentScreen === 'game' && (
        <div className="fixed inset-0 bg-amber-50 z-10 flex flex-col items-center justify-start">
          <div className="w-full max-w-md mx-auto flex flex-col h-full pt-2">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl font-bold text-gray-800 ml-4">CoCo壱ゲーム</h1>
              <div className="flex items-center">
                <span className="font-semibold mr-2">スコア:</span>
                <span className="text-green-600 font-bold text-xl mr-4">{score}</span>
              </div>
            </div>
            
            <div 
              ref={gameAreaRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => e.preventDefault()}
              className="relative flex-grow w-full bg-yellow-300 overflow-hidden"
              style={{ minHeight: '70vh' }}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-80 z-20">
                  <h2 className="text-2xl font-bold text-red-800 mb-4">ゲームオーバー</h2>
                  <p className="text-lg font-semibold mb-6">最終スコア: {score}</p>
                  
                  {error && (
                    <p className="text-red-600 font-bold mb-4">{error}</p>
                  )}
                  
                  {!playerRank ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="名前を入力（10文字以内）"
                        maxLength={10}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="px-3 py-2 border rounded-lg mr-2"
                        disabled={isSubmittingScore}
                      />
                      <button
                        onClick={submitScoreAndBackToIntro}
                        disabled={!playerName.trim() || isSubmittingScore}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                      >
                        {isSubmittingScore ? 'スコア送信中...' : 'スコア送信'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-lg font-bold mb-4 text-blue-600">あなたのランク: {playerRank}位</p>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      もう一度プレイ
                    </button>
                    
                    <button
                      onClick={backToIntro}
                      className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      ゲームを終了
                    </button>
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
