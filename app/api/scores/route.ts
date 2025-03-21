import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface ScoreItem {
  member: string;
  score: number;
}

// スコアを取得するAPI
export async function GET() {
  try {
    // スコアを降順で取得（0~9位まで）
    const scoresList = await kv.zrange('highscores', 0, 9, {
      withScores: true,
      rev: true // 高いスコア順
    }) as ScoreItem[];
    
    // 整形したスコアデータを作成
    const formattedScores = scoresList.map((item, index) => ({
      id: index + 1,
      playerName: item.member,
      score: item.score
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
    const body = await request.json();
    const { playerName, score } = body;
    
    if (!playerName || typeof score !== 'number') {
      return NextResponse.json(
        { error: '無効なデータです' }, 
        { status: 400 }
      );
    }
    
    // スコアを保存（Redis sorted setを使用）
    await kv.zadd('highscores', { score, member: playerName });
    
    // プレイヤーのランクを計算（自分より高いスコアの数 + 1）
    const higherScores = await kv.zcount('highscores', (score + 0.000001), '+inf');
    const rank = higherScores + 1;
    
    // フロントエンドと互換性を保つためにsuccess: trueを含める
    return NextResponse.json({ 
      success: true, 
      rank
    });
  } catch (error) {
    console.error('スコア保存エラー:', error);
    return NextResponse.json({ error: 'スコアの保存に失敗しました' }, { status: 500 });
  }
}
