'use client';

import { useState, useEffect, useCallback } from 'react';
import { events, moveEvents } from '../data/Sugoroku/eventsData';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 型定義
interface GameState {
    playerName: string;
    playerAvatar: string;
    currentMoney: number;
    confiscatedMoney: number;
    currentPosition: number;
    isGameOver: boolean;
}

// カスタムフック: 音声合成
const useSpeechSynthesis = () => {
    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
            return utterance;
        }
    }, []);

    return { speak };
};

// カスタムフック: ローカルストレージ
const useLocalStorage = <T,>(key: string, initialValue: T) => {
    // クライアントサイドでのみ実行される初期化を保証
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue] as const;
};

export default function SugorokuPage() {
    const router = useRouter();
    const { speak } = useSpeechSynthesis();
    
    // 状態管理
    const [gameState, setGameState] = useState<GameState>({
        playerName: '',
        playerAvatar: '',
        currentMoney: 0,
        confiscatedMoney: 0,
        currentPosition: 0,
        isGameOver: false
    });
    
    const [customAvatars, setCustomAvatars] = useLocalStorage<string[]>('customAvatars', []);
    const [showSetupScreen, setShowSetupScreen] = useState(true);
    const [showGameScreen, setShowGameScreen] = useState(false);
    const [showResultScreen, setShowResultScreen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [gameBoard, setGameBoard] = useState<any[]>([]);

    // ゲームボードの生成
    const createGameBoard = useCallback(() => {
        const totalSquares = 43;
        const eventKeys = [...Object.keys(events), ...Object.keys(moveEvents)];
        const shuffledEvents = eventKeys.sort(() => Math.random() - 0.5);

        return Array.from({ length: totalSquares }, (_, i) => {
            if (i === 0) return { type: 'start', title: 'スタート' };
            if (i === totalSquares - 1) return { type: 'goal', title: 'ゴール' };
            
            const eventName = shuffledEvents[i % shuffledEvents.length];
            const eventData = events[eventName];
            const moveData = moveEvents[eventName];

            if (eventData) {
                return {
                    type: 'event',
                    title: eventName,
                    event: eventData
                };
            } else if (moveData) {
                return {
                    type: 'move',
                    title: eventName,
                    event: moveData
                };
            }
            
            return {
                type: 'event',
                title: eventName,
                event: null
            };
        });
    }, []);

    // ゲームボードの初期化
    useEffect(() => {
        if (showGameScreen) {
            setGameBoard(createGameBoard());
        }
    }, [showGameScreen, createGameBoard]);

    // サイコロを振る関数
    const rollDice = useCallback(() => {
        return Math.floor(Math.random() * 6) + 1;
    }, []);

    // アバター関連の処理
    const handleAvatarClick = useCallback((avatarUrl: string) => {
        setGameState(prev => ({ ...prev, playerAvatar: avatarUrl }));
    }, []);

    const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const target = e.target;
                if (!target) return;
                const dataUrl = target.result as string;
                setCustomAvatars(prev => [dataUrl, ...prev]);
                handleAvatarClick(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    }, [handleAvatarClick, setCustomAvatars]);

    // サイコロを振って初期所持金を決定
    const handleInitialRoll = useCallback(async () => {
        if (!gameState.playerAvatar) {
            alert('コマを選択してください');
            return;
        }

        const initialRoll = rollDice();
        const initialMoneyMap = {
            1: 50000,
            2: 100000,
            3: 150000,
            4: 200000,
            5: 300000,
            6: 400000
        };

        // サイコロアニメーション
        const diceImage = document.getElementById('dice-image');
        if (diceImage instanceof HTMLImageElement) {
            for (let i = 1; i <= 10; i++) {
                const randomDice = Math.floor(Math.random() * 6) + 1;
                diceImage.src = `/images/Sugoroku/dice${randomDice}.png`;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            diceImage.src = `/images/Sugoroku/dice${initialRoll}.png`;
        }

        const playerName = gameState.playerName || 'ゲスト';
        const initialMoney = initialMoneyMap[initialRoll as keyof typeof initialMoneyMap];

        setGameState(prev => ({
            ...prev,
            playerName,
            currentMoney: initialMoney
        }));

        // 初期所持金の表示
        const moneyDisplay = document.getElementById('initial-money-display');
        if (moneyDisplay) {
            moneyDisplay.textContent = `💰 ${playerName}さんの所持金: ${initialMoney.toLocaleString()}円`;
            moneyDisplay.classList.add('py-2', 'px-4', 'my-4', 'text-blue-800', 'rounded-lg', 'bg-blue-50');
        }

        // 音声再生を Promise でラップ
        await new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(
                `それでは${playerName}さん、上級党員を目指して頑張ってください。所持金は${initialMoney}円です。`
            );
            utterance.lang = 'ja-JP';
            utterance.onend = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
        
        // 音声再生完了後に画面遷移
        setShowSetupScreen(false);
        setShowGameScreen(true);
    }, [gameState.playerAvatar, gameState.playerName, rollDice, speak]);

    // ゲーム終了処理
    const endGame = useCallback((isBankrupt: boolean) => {
        setShowGameScreen(false);
        setShowResultScreen(true);

        const resultMessage = isBankrupt
            ? `${gameState.playerName}さんは破産しました。ワシらの懐が${gameState.confiscatedMoney.toLocaleString()}円、豊かに、強くなりました。`
            : `おめでとうございます。残金${gameState.currentMoney.toLocaleString()}円を全額寄付しました。${gameState.playerName}さんは破産しました。`;

        speak(resultMessage);
    }, [gameState.playerName, gameState.confiscatedMoney, gameState.currentMoney, speak]);

    // プレイヤーを移動させる関数
    const movePlayer = useCallback(async (roll: number) => {
        const newPosition = Math.min(gameState.currentPosition + roll, 42);
        
        // 1マスずつ移動しながらスクロール
        for (let pos = gameState.currentPosition + 1; pos <= newPosition; pos++) {
            setGameState(prev => ({
                ...prev,
                currentPosition: pos
            }));

            const square = document.querySelector(`[data-square-index="${pos}"]`);
            if (square) {
                const headerHeight = 120;
                const targetPosition = square.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (square.getBoundingClientRect().height / 2);
                
                window.scrollTo({
                    top: Math.max(0, targetPosition - headerHeight),
                    behavior: 'smooth'
                });
            }

            const delay = pos === newPosition ? 1000 : 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // イベントの処理
        if (newPosition < 42) {
            const currentSquare = gameBoard[newPosition];
            
            if (currentSquare.type === 'event' && currentSquare.event) {
                // eventsData.tsのreadingを使用して音声を再生
                const eventData = events[currentSquare.title];
                if (eventData) {
                    const utterance = new SpeechSynthesisUtterance(eventData.reading);
                    utterance.lang = 'ja-JP';
                    utterance.volume = 1.0;
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;

                    await new Promise<void>((resolve) => {
                        utterance.onend = () => {
                            const newMoney = gameState.currentMoney - eventData.amount;
                            
                            if (newMoney <= 0) {
                                setGameState(prev => ({
                                    ...prev,
                                    currentMoney: 0,
                                    confiscatedMoney: prev.confiscatedMoney + prev.currentMoney,
                                    isGameOver: true
                                }));
                                endGame(true);
                            } else {
                                setGameState(prev => ({
                                    ...prev,
                                    currentMoney: newMoney,
                                    confiscatedMoney: prev.confiscatedMoney + eventData.amount
                                }));
                            }
                            resolve();
                        };
                        window.speechSynthesis.speak(utterance);
                    });
                }
            } else if (currentSquare.type === 'move' && currentSquare.event) {
                // 移動イベントの処理
                const moveData = moveEvents[currentSquare.title];
                if (moveData) {
                    await movePlayer(moveData);
                }
            }
        }

        // ゴール判定
        if (newPosition === 42) {
            const utterance = new SpeechSynthesisUtterance('ゴール');
            utterance.lang = 'ja-JP';
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            await new Promise<void>((resolve) => {
                utterance.onend = () => {
                    endGame(false);
                    resolve();
                };
                window.speechSynthesis.speak(utterance);
            });
        }
    }, [gameState.currentPosition, gameState.currentMoney, gameBoard, endGame]);

    // サイコロを振るハンドラー
    const handleRollDice = useCallback(async () => {
        const roll = rollDice();
        
        // サイコロアニメーション用の一時的な画像要素を作成
        const diceImage = document.createElement('img');
        diceImage.src = '/images/Sugoroku/dice1.png';
        diceImage.className = 'w-24 h-24 fixed z-50';
        
        // サイコロボタンの位置を取得して配置
        const rollButton = document.getElementById('roll-dice');
        if (rollButton) {
            const buttonRect = rollButton.getBoundingClientRect();
            diceImage.style.position = 'fixed';
            diceImage.style.top = `${buttonRect.top - 116}px`;  // ボタンの上に表示
            diceImage.style.left = `${buttonRect.left + (buttonRect.width - 96) / 2}px`;  // 中央揃え
            document.body.appendChild(diceImage);
        }

        // サイコロのアニメーション
        for (let i = 1; i <= 8; i++) {
            const randomDice = Math.floor(Math.random() * 6) + 1;
            diceImage.src = `/images/Sugoroku/dice${randomDice}.png`;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 最終的な出目を表示
        diceImage.src = `/images/Sugoroku/dice${roll}.png`;
        await new Promise(resolve => setTimeout(resolve, 500));

        // サイコロの画像を削除
        diceImage.remove();

        // プレイヤーを移動
        await movePlayer(roll);
    }, [rollDice, movePlayer]);

    return (
        <div className="bg-white min-h-screen">
            {showSetupScreen && (
                <div className="container mx-auto p-4 max-w-md">
                    <h1 className="text-2xl font-semibold mb-4">
                        🇯🇵 保守党すごろく <small className="text-sm">目指せ上級党員！</small>
                    </h1>
                    
                    {/* アバター選択セクション */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold mb-2">♟️ コマを選択・アップロード</h2>
                        <div className="overflow-x-scroll">
                            <div className="flex gap-4 min-w-max p-2 mb-2">
                                {[1, 2, 3].map((num) => (
                                    <Image
                                        key={num}
                                        src={`/images/Sugoroku/avatar_00${num}.png`}
                                        alt={`アバター${num}`}
                                        width={96}
                                        height={96}
                                        className={`rounded-full cursor-pointer hover:border-2 hover:border-blue-500 
                                            ${gameState.playerAvatar === `/images/Sugoroku/avatar_00${num}.png` ? 'border-2 border-blue-500' : ''}`}
                                        onClick={() => handleAvatarClick(`/images/Sugoroku/avatar_00${num}.png`)}
                                    />
                                ))}
                                {customAvatars.map((avatar, index) => (
                                    <Image
                                        key={`custom-${index}`}
                                        src={avatar}
                                        alt={`カスタムアバター${index + 1}`}
                                        width={96}
                                        height={96}
                                        className={`rounded-full cursor-pointer hover:border-2 hover:border-blue-500 
                                            ${gameState.playerAvatar === avatar ? 'border-2 border-blue-500' : ''}`}
                                        onClick={() => handleAvatarClick(avatar)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* アバターアップロード */}
                        <div className="mt-4 flex gap-2 justify-center">
                            <label className="bg-gray-900 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer text-sm">
                                アップロード
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* プレイヤー名入力 */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold mb-2">👤 プレイヤー名を入力</h2>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={gameState.playerName}
                            onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                        />
                    </div>

                    <div id="dice-section" className="mb-4">
                        <h2 className="block mb-2 text-lg font-bold">🎲 所持金を決める</h2>
                        <p className="mb-6">
                            「上級党員になる」ボタンを押すとサイコロが振られて所持金が決まり、ゲームが始まります。<br />
                            <span className="text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 inline-block mr-1 animate-pulse">
                                    <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z" fill="currentColor"/>
                                </svg>
                                音声をオンにしてお楽しみください。
                            </span>
                        </p>
                        <div id="initial-money-display"></div>
                        <img id="dice-image" src="/images/Sugoroku/dice3.png" className="w-24 h-24 mx-auto my-2 mb-4" alt="サイコロ" />
                        <button
                            onClick={handleInitialRoll}
                            className="bg-red-500 hover:bg-red-400 text-white pr-6 pl-5 py-3 rounded my-4 w-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-6 h-6 inline-block mr-2">
                                <path d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3z" fill="currentColor"/>
                            </svg>
                            上級党員になる
                        </button>
                    </div>
                </div>
            )}

            {/* ゲーム画面 */}
            {showGameScreen && (
                <div className="relative container mx-auto p-4 max-w-md">
                    <div className="fixed top-0 left-0 right-0 bg-white p-4 opacity-90 z-10">
                        <div className="container mx-auto max-w-md">
                            <h1 className="text-2xl font-bold mb-4">🇯🇵 保守党すごろく</h1>
                            <div className="text-right">
                                <div className="mb-2">
                                    <span>{gameState.playerName}</span>さんの所持金：
                                    <span className="font-bold">{gameState.currentMoney.toLocaleString()}</span>円
                                </div>
                                <div>
                                    <span>没収された金額：</span>
                                    <span className="text-red-500 font-bold">
                                        {gameState.confiscatedMoney.toLocaleString()}
                                    </span>円
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ゲームボード */}
                    <div className="mt-32 max-w-md mx-auto">
                        {gameBoard.map((square, index) => (
                            <div
                                key={index}
                                data-square-index={index}
                                className={`first:mt-28 w-full mr-4 mt-2 mb-2 ${
                                    index === 0 ? 'mt-28' : ''
                                }`}
                            >
                                <div
                                    className={`flex flex-col border rounded-md p-1 h-40 w-full items-center justify-center
                                        ${index === 0 ? 'bg-yellow-100' : 
                                          index === gameBoard.length - 1 ? 'bg-green-100' : 
                                          square.event?.color || 'bg-white'}`}
                                >
                                    <div className="text-xl text-center font-bold">
                                        {square.title}
                                    </div>
                                    {gameState.currentPosition === index && (
                                        <div className="absolute left-4">
                                            <Image
                                                src={gameState.playerAvatar}
                                                alt="プレイヤー"
                                                width={64}
                                                height={64}
                                                className="rounded-full border-2 border-indigo-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* サイコロボタン */}
                    <div className="fixed bottom-4 left-0 right-0">
                        <div className="container mx-auto max-w-md px-4">
                            <button
                                id="roll-dice"
                                onClick={handleRollDice}
                                className="bg-red-500 hover:bg-red-400 text-white w-full py-3 rounded"
                                disabled={gameState.isGameOver}
                            >
                                🎲 サイコロを振る
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 結果画面 */}
            {showResultScreen && (
                <div className="container mx-auto p-4 flex flex-col items-center h-screen mt-5">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold mb-4 text-center">結果発表</h2>
                        <p className="text-lg mb-6 text-center">
                            {gameState.isGameOver
                                ? `破産しました。没収された金額：${gameState.confiscatedMoney.toLocaleString()}円`
                                : `ゴールしました！残金：${gameState.currentMoney.toLocaleString()}円`}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-500 hover:bg-red-400 text-white w-full py-3 rounded"
                        >
                            もう一度プレイ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
