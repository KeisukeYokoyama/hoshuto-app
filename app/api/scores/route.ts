import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis
const redis = Redis.fromEnv();

// スコアを取得するAPI
export async function GET() {
  try {
    // スコアの取得（降順で上位10件）
    const scores = await redis.zrange('highscores', 0, 9, {
      rev: true,
      withScores: true,
    });

    // フロントエンド用にデータを整形
    const formattedScores = scores.map((score: any, index: number) => ({
      id: index + 1,
      playerName: score.member,
      score: score.score
    }));

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error('スコア取得エラー:', error);
    return NextResponse.json({ error: 'スコア取得に失敗しました' }, { status: 500 });
  }
}

// スコアを保存するAPI
export async function POST(request: Request) {
  try {
    const { playerName, score } = await request.json();
    
    if (!playerName || typeof score !== 'number') {
      return NextResponse.json(
        { error: '無効なデータです' }, 
        { status: 400 }
      );
    }

    if (playerName.length > 10) {
      return NextResponse.json(
        { error: 'プレイヤー名は10文字以内にしてください' },
        { status: 400 }
      );
    }

    // スコアを保存（sorted setを使用）
    await redis.zadd('highscores', {
      score: score,
      member: playerName
    });

    // ランクを計算（自分より高いスコアの数 + 1）
    const higherScores = await redis.zcount('highscores', score + 0.000001, '+inf');
    const rank = higherScores + 1;

    return NextResponse.json({ 
      success: true, 
      rank
    });
  } catch (error) {
    console.error('スコア保存エラー:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'スコアの保存に失敗しました' }, { status: 500 });
  }
}
