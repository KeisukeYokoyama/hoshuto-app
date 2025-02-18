'use client';

import { useState } from 'react';
import Image from 'next/image';
import { KarutaCard, karutaList } from '../data/Karuta/karutaData';

export default function Karuta() {
    const [currentCard, setCurrentCard] = useState<KarutaCard | null>(null);
    const [selectedCards, setSelectedCards] = useState<KarutaCard[]>([]);
    const [showModal, setShowModal] = useState(false);

    const shuffle = (array: KarutaCard[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        speechSynthesis.speak(utterance);
    };

    const setupGame = () => {
        const shuffledCards = shuffle(karutaList).slice(0, 8);
        setSelectedCards(shuffledCards);
        const newCurrentCard = shuffledCards[Math.floor(Math.random() * shuffledCards.length)];
        setCurrentCard(newCurrentCard);
        speakText(newCurrentCard.kana);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCardClick = (card: KarutaCard) => {
        if (!currentCard) return;

        if (card.text === currentCard.text) {
            speakText("あなたは紛れもなく頭のおかしい陰謀論じゃです！");
            alert("正解です！");
        } else {
            speakText("朝８を毎日視聴しなさい！");
            alert("お手つきです！");
        }
    };

    return (
        <div className="text-center p-4">
            <h1 className="text-5xl font-bold text-[#E75B66] font-zen-maru-gothic mb-8">保守党かるた</h1>
            
            <div className="mb-4 cursor-pointer" onClick={() => setShowModal(true)}>
                正解をタップしてください。
                <span className="text-blue-600 underline hover:text-[#E75B66]">遊び方</span>
            </div>

            <button
                onClick={setupGame}
                className="px-6 py-2 border border-[#E75B66] text-[#E75B66] hover:bg-[#E75B66] hover:text-white transition-colors rounded"
            >
                かるたを配る
            </button>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {selectedCards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => handleCardClick(card)}
                        className="relative w-[180px] h-[312px] flex items-center justify-center cursor-pointer p-4"
                    >
                        <Image
                            src="/images/Karuta/karutaBackgroundImage.png"
                            alt="背景"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-[48px] left-[31px]">
                            <Image
                                src={`/images/Karuta/${card.author === "代表" ? "daihyouImage.png" : "jimusouchouImage.png"}`}
                                alt={card.author}
                                width={72}
                                height={72}
                                className="object-contain"
                            />
                        </div>
                        <div className="absolute top-[150px] left-6 w-[154px] text-xl font-bold">
                            {card.text}
                        </div>
                        <div className="absolute top-[72px] right-8 w-8 h-8 rounded-full flex items-center justify-center font-serif text-4xl text-white">
                            {card.letter}
                        </div>
                    </div>
                ))}
            </div>

            {/* モーダル */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 pt-14">
                    <div className="bg-white p-8 rounded-lg w-[90%] max-w-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">保守党かるたの遊び方</h2>
                            <button onClick={() => setShowModal(false)} className="text-3xl">&times;</button>
                        </div>
                        <div className="text-left">
                            <p className="mb-2">1. 音声をオンにしてください。</p>
                            <p className="mb-2">2. 「かるたを配る」ボタンを押すとゲームが始まります。</p>
                            <p className="mb-2">3. 読み上げられる暴言に対応する札をタップしてください。</p>
                            <p className="mb-2">4. 「かるたを配る」ボタンを押すと別の暴言が読み上げられます。</p>
                            <p className="text-red-500">※ センシティブな音声が流れます。音量には十分にご注意ください。</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
