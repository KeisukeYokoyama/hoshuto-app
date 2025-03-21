import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

// スコアを取得するAPI
export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const scores = data.scores.sort((a: any, b: any) => b.score - a.score).slice(0, 10);
    return NextResponse.json(scores);
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

    // 現在のデータを読み込む
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    
    // 新しいスコアを追加
    const newScore = {
      id: Date.now(),
      playerName,
      score
    };
    
    data.scores.push(newScore);
    
    // スコアでソート
    data.scores.sort((a: any, b: any) => b.score - a.score);
    
    // 上位10件のみ保持
    data.scores = data.scores.slice(0, 10);
    
    // ファイルに保存
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    // ランクを計算（自分より高いスコアの数 + 1）
    const rank = data.scores.findIndex((s: any) => s.id === newScore.id) + 1;
    
    return NextResponse.json({ 
      success: true, 
      rank
    });
  } catch (error) {
    console.error('スコア保存エラー:', error);
    return NextResponse.json({ error: 'スコアの保存に失敗しました' }, { status: 500 });
  }
}
